import React, { useState, useMemo } from 'react';
import { DirectoryNode, MigrationFile } from '../types';
import { buildDirectoryTree } from '../services/fileScanner';
import { 
  Folder, 
  FolderOpen, 
  File, 
  FileCode, 
  FileJson, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Eye, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  Hash 
} from 'lucide-react';

interface DirectoryTreeViewProps {
  files: MigrationFile[];
  destinationPrefix: string;
  setDestinationPrefix: (prefix: string) => void;
  onPreviewFile: (file: MigrationFile) => void;
  onProceedToTarget: () => void;
}

export const DirectoryTreeView: React.FC<DirectoryTreeViewProps> = ({
  files,
  destinationPrefix,
  setDestinationPrefix,
  onPreviewFile,
  onProceedToTarget,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '': true,
    'src': true,
    'apps': true,
    'apps/client': true,
    'apps/server': true,
    'packages': true,
  });

  const tree = useMemo(() => buildDirectoryTree(files), [files]);

  // Compute stats
  const stats = useMemo(() => {
    const dirSet = new Set<string>();
    let maxDepth = 0;
    files.forEach((f) => {
      const parts = f.path.split('/');
      maxDepth = Math.max(maxDepth, parts.length);
      parts.pop();
      let acc = '';
      parts.forEach((p) => {
        acc = acc ? `${acc}/${p}` : p;
        dirSet.add(acc);
      });
    });
    return {
      directoriesCount: dirSet.size,
      maxDepth,
      totalBytes: files.reduce((acc, f) => acc + f.size, 0),
    };
  }, [files]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const expandAll = () => {
    const newExpanded: Record<string, boolean> = {};
    const traverse = (node: DirectoryNode) => {
      if (node.isDirectory) {
        newExpanded[node.path] = true;
        node.children?.forEach(traverse);
      }
    };
    traverse(tree);
    setExpandedFolders(newExpanded);
  };

  const collapseAll = () => {
    setExpandedFolders({});
  };

  const getFileIcon = (filename: string) => {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.json')) return <FileJson className="h-4 w-4 text-amber-400 shrink-0" />;
    if (lower.endsWith('.ts') || lower.endsWith('.tsx') || lower.endsWith('.js') || lower.endsWith('.jsx')) {
      return <FileCode className="h-4 w-4 text-cyan-400 shrink-0" />;
    }
    if (lower.endsWith('.css') || lower.endsWith('.scss')) {
      return <FileCode className="h-4 w-4 text-sky-400 shrink-0" />;
    }
    if (lower.endsWith('.md') || lower.endsWith('.txt')) {
      return <FileText className="h-4 w-4 text-slate-400 shrink-0" />;
    }
    return <File className="h-4 w-4 text-slate-500 shrink-0" />;
  };

  // Filter files if searching
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return files.filter((f) => f.path.toLowerCase().includes(q));
  }, [files, searchQuery]);

  // Recursive Tree Node Renderer
  const renderNode = (node: DirectoryNode, depth: number = 0) => {
    if (node.name === 'root') {
      return (
        <div className="space-y-0.5">
          {node.children?.map((child) => renderNode(child, 0))}
        </div>
      );
    }

    const isExpanded = expandedFolders[node.path] ?? false;

    if (node.isDirectory) {
      return (
        <div key={node.path} className="select-none">
          <div
            onClick={() => toggleFolder(node.path)}
            style={{ paddingLeft: `${depth * 18}px` }}
            className="group flex items-center justify-between py-1.5 px-2 hover:bg-slate-900 rounded-md cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-500 group-hover:text-slate-300">
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </span>
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-cyan-400 shrink-0" />
              ) : (
                <Folder className="h-4 w-4 text-cyan-500/80 shrink-0" />
              )}
              <span className="font-mono text-xs font-semibold text-slate-200 truncate">
                {node.name}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono tabular-nums">
              <span>{node.fileCount} items</span>
            </div>
          </div>

          {isExpanded && node.children && (
            <div className="space-y-0.5 border-l border-slate-800/80 ml-3">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // File Node
    const file = node.file!;
    const destPath = destinationPrefix
      ? `${destinationPrefix.replace(/^\/+/, '').replace(/\/+$/, '')}/${file.path}`
      : file.path;

    return (
      <div
        key={node.path}
        style={{ paddingLeft: `${depth * 18 + 8}px` }}
        className="group flex items-center justify-between py-1 px-2 hover:bg-slate-900/80 rounded-md transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {getFileIcon(node.name)}
          <span className="font-mono text-xs text-slate-300 group-hover:text-white truncate">
            {node.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-slate-500 tabular-nums">
            {file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(1)} KB`}
          </span>
          <button
            onClick={() => onPreviewFile(file)}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-cyan-400 transition-opacity"
            title="Inspect code"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Directory Structure Verification
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit the exact folder nesting and path hierarchy before committing to GitHub.
          </p>
        </div>

        {/* Invariant badge & stats */}
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span>100% Hierarchy Preserved</span>
          </div>
          <span aria-hidden="true">·</span>
          <span>{files.length} files</span>
          <span aria-hidden="true">·</span>
          <span>{stats.directoriesCount} directories</span>
        </div>
      </div>

      {/* Target Path Prefix & Destination Configuration */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-semibold text-white">Target Folder Mount Prefix</h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Control where apps land in the target repo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setDestinationPrefix('')}
            className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
              destinationPrefix === ''
                ? 'border-cyan-500/50 bg-cyan-950/20 text-white'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-semibold">Repository Root (/)</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Files placed directly at root (standard single app)</span>
          </button>

          <button
            type="button"
            onClick={() => setDestinationPrefix('apps/web')}
            className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
              destinationPrefix === 'apps/web'
                ? 'border-cyan-500/50 bg-cyan-950/20 text-white'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-semibold">Subfolder: apps/web</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Nest as a sub-app in a monorepo workspace</span>
          </button>

          <div className="flex flex-col justify-center p-3 rounded-lg border border-slate-800 bg-slate-950">
            <label className="text-[11px] font-medium text-slate-400 mb-1">Custom Subdirectory</label>
            <input
              type="text"
              value={destinationPrefix}
              onChange={(e) => setDestinationPrefix(e.target.value)}
              placeholder="e.g. apps/my-service or services/api"
              className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Main Tree View Box */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 px-4 py-3 gap-3 bg-slate-900/80">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search paths or files..."
              className="w-full rounded-md border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded border border-slate-800 bg-slate-950 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded border border-slate-800 bg-slate-950 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Tree Canvas */}
        <div className="p-4 max-h-[460px] overflow-y-auto">
          {filteredFiles ? (
            /* Flat search list */
            <div className="space-y-1">
              <div className="text-xs text-slate-400 mb-2 font-mono">
                Matching files ({filteredFiles.length}):
              </div>
              {filteredFiles.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2 hover:bg-slate-900 rounded font-mono text-xs text-slate-300"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getFileIcon(f.path)}
                    <span className="truncate">{f.path}</span>
                  </div>
                  <button
                    onClick={() => onPreviewFile(f)}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px]"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Full recursive tree */
            renderNode(tree)
          )}
        </div>

        {/* Footer with Destination Mapping summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 px-4 py-3 bg-slate-900/60 gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500">Destination Mount:</span>
            <span className="font-mono text-cyan-300">
              {destinationPrefix ? `${destinationPrefix}/[path]` : '/[root]/[path]'}
            </span>
          </div>

          <button
            onClick={onProceedToTarget}
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            <span>Proceed to Target Repository</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
