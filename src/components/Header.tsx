import React from 'react';
import { GitHubUser } from '../types';
import { KeyRound, ShieldCheck, Terminal, Sparkles, FolderTree, GitBranch } from 'lucide-react';

interface HeaderProps {
  user: GitHubUser | null;
  isDemo: boolean;
  activeTab: 'source' | 'tree' | 'target' | 'migrate' | 'cli';
  setActiveTab: (tab: 'source' | 'tree' | 'target' | 'migrate' | 'cli') => void;
  onOpenTokenModal: () => void;
  onToggleDemo: () => void;
  filesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isDemo,
  activeTab,
  setActiveTab,
  onOpenTokenModal,
  onToggleDemo,
  filesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand single text element */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('source')}
            className="flex items-center gap-2.5 text-left text-lg font-semibold tracking-tight text-white transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FolderTree className="h-4 w-4" />
            </div>
            <span>GitMigrate</span>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('source')}
            className={`px-3 py-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'source'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Select Apps
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`px-3 py-1.5 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tree'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>2. Directory Tree</span>
            {filesCount > 0 && (
              <span className="font-mono text-xs text-slate-500 tabular-nums">({filesCount})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('target')}
            className={`px-3 py-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'target'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Target Repository
          </button>
          <button
            onClick={() => setActiveTab('migrate')}
            className={`px-3 py-1.5 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'migrate'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>4. Migration Execution</span>
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`px-3 py-1.5 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cli'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>CLI Commands</span>
          </button>
        </nav>

        {/* Zone 3: Primary action & authentication status */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenTokenModal}
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                title="GitHub Account & Rate Limit"
              >
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="h-5 w-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="font-mono max-w-[100px] truncate">{user.login}</span>
                {isDemo && (
                  <span className="text-[10px] text-amber-400 font-medium">Demo</span>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenTokenModal}
              className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20 whitespace-nowrap"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Connect GitHub</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab(activeTab === 'migrate' ? 'tree' : 'migrate')}
            className="rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400 whitespace-nowrap"
          >
            Migrate to GitHub
          </button>
        </div>
      </div>
    </header>
  );
};
