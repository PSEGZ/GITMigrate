import React, { useState } from 'react';
import { GitHubUser } from '../types';
import { KeyRound, ShieldAlert, CheckCircle2, ExternalLink, X, Zap } from 'lucide-react';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAuth: {
    token: string | null;
    user: GitHubUser | null;
    isDemo: boolean;
  };
  onSaveToken: (token: string) => Promise<void>;
  onUseDemo: () => void;
  onDisconnect: () => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({
  isOpen,
  onClose,
  currentAuth,
  onSaveToken,
  onUseDemo,
  onDisconnect,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError('Please paste a valid GitHub Personal Access Token.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSaveToken(tokenInput.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate token with GitHub API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">GitHub Authentication</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {currentAuth.user && (
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="flex items-center gap-3">
                <img
                  src={currentAuth.user.avatar_url}
                  alt={currentAuth.user.login}
                  className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{currentAuth.user.name || currentAuth.user.login}</span>
                    <span className="font-mono text-xs text-slate-400">@{currentAuth.user.login}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{currentAuth.isDemo ? 'Sandbox Mode' : 'Connected to GitHub'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{currentAuth.user.public_repos} repos</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onDisconnect}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                Disconnect
              </button>
            </div>
          )}

          <p className="text-xs text-slate-400 leading-relaxed">
            GitMigrate uses the official GitHub Git Database API (Blobs, Trees, Commits) to push code while guaranteeing 100% preservation of all nested directory structures, dotfiles, and monorepo paths.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  GitHub Personal Access Token (PAT)
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,read:org&description=GitMigrate+Studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  <span>Create PAT on GitHub</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx or github_pat_xxxxxxxxxxxx"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <p className="mt-1.5 text-[11px] text-slate-500">
                Requires the <code className="text-slate-300 bg-slate-800/80 px-1 py-0.5 rounded">repo</code> scope to create trees, blobs, and commits.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onUseDemo();
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-750 hover:text-white transition-colors"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Use Demo Sandbox</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Verifying...' : 'Save & Authenticate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
