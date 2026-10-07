export interface MigrationFile {
  id: string;
  path: string; // e.g. "src/components/Header.tsx"
  content: string; // text or base64
  isBinary: boolean;
  size: number;
  lastModified?: number;
  appName?: string; // Optional app container name if multi-app
}

export interface DirectoryNode {
  name: string;
  path: string; // relative path
  isDirectory: boolean;
  children?: DirectoryNode[];
  file?: MigrationFile;
  size?: number;
  fileCount?: number;
}

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  total_private_repos?: number;
  scopes?: string[];
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  html_url: string;
  default_branch: string;
  description: string | null;
  updated_at: string;
  size: number;
}

export interface MigrationConfig {
  repoOwner: string;
  repoName: string;
  isNewRepo: boolean;
  newRepoPrivate: boolean;
  newRepoDescription: string;
  targetBranch: string;
  createNewBranch: boolean;
  destinationPrefix: string; // e.g. "" (root) or "apps/web/"
  commitMessage: string;
  authorName?: string;
  authorEmail?: string;
  preserveEmptyDirectories: boolean; // creates .gitkeep for empty folders
  sanitizeDotEnv: boolean; // prevents leaking secrets in .env
}

export type MigrationStep = 
  | 'idle'
  | 'validating'
  | 'creating_blobs'
  | 'building_tree'
  | 'creating_commit'
  | 'updating_ref'
  | 'verifying'
  | 'completed'
  | 'failed';

export interface MigrationLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  details?: string;
}

export interface MigrationResult {
  commitSha: string;
  treeSha: string;
  branch: string;
  repoUrl: string;
  commitUrl: string;
  treeUrl: string;
  filesCount: number;
  directoriesCount: number;
  totalBytes: number;
  verifiedAt: string;
}
