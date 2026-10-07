import JSZip from 'jszip';
import { DirectoryNode, MigrationFile } from '../types';

// Default ignore patterns
export const DEFAULT_IGNORE_PATTERNS = [
  'node_modules/',
  '.git/',
  '.DS_Store',
  'Thumbs.db',
  'dist/',
  'build/',
  '.next/',
  '.turbo/',
  'coverage/',
  '*.log',
];

export function isIgnored(path: string, patterns: string[] = DEFAULT_IGNORE_PATTERNS): boolean {
  for (const pattern of patterns) {
    if (pattern.endsWith('/')) {
      const dirName = pattern.slice(0, -1);
      if (path.startsWith(dirName + '/') || path.includes('/' + dirName + '/')) {
        return true;
      }
    } else if (pattern.startsWith('*.')) {
      const ext = pattern.slice(1);
      if (path.endsWith(ext)) {
        return true;
      }
    } else {
      if (path === pattern || path.endsWith('/' + pattern)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Builds a nested DirectoryNode hierarchy from a flat list of MigrationFiles.
 */
export function buildDirectoryTree(files: MigrationFile[]): DirectoryNode {
  const root: DirectoryNode = {
    name: 'root',
    path: '',
    isDirectory: true,
    children: [],
    fileCount: 0,
    size: 0,
  };

  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean);
    let current = root;
    current.fileCount = (current.fileCount || 0) + 1;
    current.size = (current.size || 0) + file.size;

    let accumulatedPath = '';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;

      if (!current.children) {
        current.children = [];
      }

      let existing = current.children.find((c) => c.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: accumulatedPath,
          isDirectory: !isFile,
          children: isFile ? undefined : [],
          file: isFile ? file : undefined,
          fileCount: isFile ? 1 : 0,
          size: isFile ? file.size : 0,
        };
        current.children.push(existing);
      } else {
        if (!isFile) {
          existing.fileCount = (existing.fileCount || 0) + 1;
          existing.size = (existing.size || 0) + file.size;
        }
      }

      current = existing;
    }
  }

  // Sort nodes: directories first (alphabetical), then files (alphabetical)
  function sortNodes(node: DirectoryNode) {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortNodes);
    }
  }
  sortNodes(root);

  return root;
}

/**
 * Parses files selected via HTML <input type="file" webkitdirectory>
 */
export async function parseFileList(
  fileList: FileList,
  filterIgnored: boolean = true
): Promise<MigrationFile[]> {
  const result: MigrationFile[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    // webkitRelativePath contains e.g. "my-project/src/index.ts"
    let relativePath = file.webkitRelativePath || file.name;

    // Strip top-level wrapper folder if needed, or preserve whole path
    const parts = relativePath.split('/');
    if (parts.length > 1) {
      // Remove the picked root folder name so it mounts directly at repo root
      relativePath = parts.slice(1).join('/');
    }

    if (filterIgnored && isIgnored(relativePath)) {
      continue;
    }

    const isBinary = isBinaryFile(file.name);
    let content: string;

    if (isBinary) {
      const buffer = await file.arrayBuffer();
      content = arrayBufferToBase64(buffer);
    } else {
      content = await file.text();
    }

    result.push({
      id: Math.random().toString(36).substring(2, 9),
      path: relativePath,
      content,
      isBinary,
      size: file.size,
      lastModified: file.lastModified,
    });
  }

  return result;
}

/**
 * Parses a ZIP archive using JSZip, maintaining directory structure.
 */
export async function parseZipArchive(
  zipFile: File,
  filterIgnored: boolean = true
): Promise<MigrationFile[]> {
  const jszip = new JSZip();
  const zip = await jszip.loadAsync(zipFile);
  const result: MigrationFile[] = [];

  // Determine if all files share a common single root folder (like GitHub zip exports)
  const paths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);
  const firstSlashIdxs = paths.map((p) => p.indexOf('/'));
  let hasCommonRoot = paths.length > 0 && firstSlashIdxs.every((idx) => idx > 0);
  let commonRootPrefix = '';

  if (hasCommonRoot) {
    const candidate = paths[0].split('/')[0] + '/';
    if (paths.every((p) => p.startsWith(candidate))) {
      commonRootPrefix = candidate;
    }
  }

  for (const [rawPath, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue; // Git directories are defined by file paths

    let normalizedPath = rawPath;
    if (commonRootPrefix && normalizedPath.startsWith(commonRootPrefix)) {
      normalizedPath = normalizedPath.slice(commonRootPrefix.length);
    }

    if (filterIgnored && isIgnored(normalizedPath)) {
      continue;
    }

    const isBinary = isBinaryFile(normalizedPath);
    let content: string;
    let size = 0;

    if (isBinary) {
      const uint8 = await zipEntry.async('uint8array');
      size = uint8.length;
      content = uint8ToBase64(uint8);
    } else {
      content = await zipEntry.async('string');
      size = new Blob([content]).size;
    }

    result.push({
      id: Math.random().toString(36).substring(2, 9),
      path: normalizedPath,
      content,
      isBinary,
      size,
    });
  }

  return result;
}

/**
 * Reads folders dropped via drag-and-drop using the FileSystem API.
 */
export async function parseDroppedItems(
  items: DataTransferItemList,
  filterIgnored: boolean = true
): Promise<MigrationFile[]> {
  const result: MigrationFile[] = [];

  async function traverseEntry(entry: any, currentPath: string) {
    if (entry.isFile) {
      const file: File = await new Promise((resolve, reject) => {
        entry.file(resolve, reject);
      });

      const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      if (filterIgnored && isIgnored(fullPath)) return;

      const isBinary = isBinaryFile(file.name);
      let content: string;
      if (isBinary) {
        const buffer = await file.arrayBuffer();
        content = arrayBufferToBase64(buffer);
      } else {
        content = await file.text();
      }

      result.push({
        id: Math.random().toString(36).substring(2, 9),
        path: fullPath,
        content,
        isBinary,
        size: file.size,
        lastModified: file.lastModified,
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const nextPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

      const readEntries = (): Promise<any[]> => {
        return new Promise((resolve, reject) => {
          dirReader.readEntries(resolve, reject);
        });
      };

      let entries: any[] = [];
      let batch: any[] = [];
      do {
        batch = await readEntries();
        entries = entries.concat(batch);
      } while (batch.length > 0);

      for (const childEntry of entries) {
        await traverseEntry(childEntry, nextPath);
      }
    }
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const entry = (item as any).webkitGetAsEntry?.();
      if (entry) {
        await traverseEntry(entry, '');
      }
    }
  }

  // If dropped folder contained a root prefix folder name, normalize it
  if (result.length > 0) {
    const allSlash = result.every((f) => f.path.includes('/'));
    if (allSlash) {
      const firstSegment = result[0].path.split('/')[0];
      if (result.every((f) => f.path.startsWith(firstSegment + '/'))) {
        return result.map((f) => ({
          ...f,
          path: f.path.slice(firstSegment.length + 1),
        }));
      }
    }
  }

  return result;
}

// Helpers
function isBinaryFile(filename: string): boolean {
  const binaryExts = [
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.svgz',
    '.pdf', '.zip', '.tar', '.gz', '.woff', '.woff2', '.ttf', '.eot',
    '.mp3', '.mp4', '.wav', '.wasm', '.bin', '.exe',
  ];
  const lower = filename.toLowerCase();
  return binaryExts.some((ext) => lower.endsWith(ext));
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function uint8ToBase64(uint8: Uint8Array): string {
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}
