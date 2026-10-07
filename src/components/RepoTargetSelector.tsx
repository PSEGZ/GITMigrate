import React, { useState, useEffect } from 'react';
import { GitHubRepo, MigrationConfig } from '../types';
import { 
  GitBranch, 
  GitFork, 
  FolderGit2, 
  Plus, 
  Lock, 
  Globe, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Search,
  KeyRound
} from 'lucide-react';

interface RepoTargetSelectorProps {
  repos: GitHubRepo[];
  config: MigrationConfig;
  onChangeConfig: (newConfig: Partial<MigrationConfig>) => void;
  onProceedToMigrate: () => void;
  onCreateNewRepo: (name: string, description: string, isPrivate: boolean) => Promise<GitHubRepo>;
  onOpenAuthModal: () => void;
  isAuthenticated: boolean;
}

export const RepoTargetSelector: React.FC<RepoTargetSelectorProps> = ({
  repos,
  config,
  onChangeConfig,
  onProceedToMigrate,
  onCreateNewRepo,
  onOpenAuthModal,
  isAuthenticated,
}) => {
  const [repoMode, setRepoMode] = useState<'existing' | 'new'>(config.isNewRepo ? 'new' : 'existing');
  const [searchRepo, setSearchRepo] = useState('');
  const [newRepoName, setNewRepoName] = useState('my-migrated-apps');
  const [newRepoDesc, setNewRepoDesc] = useState('Migrated application suite with preserved directory structure');
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  // Filter repos
  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(searchRepo.toLowerCase()) ||
      r.full_name.toLowerCase().includes(searchRepo.toLowerCase())
  );

  const handleSelectExistingRepo = (repo: GitHubRepo) => {
    onChangeConfig({
      repoOwner: repo.owner.login,
      repoName: repo.name,
      isNewRepo: false,
      targetBranch: repo.default_branch || 'main',
    });
  };

  const handleCreateRepoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoName.trim()) {
      setRepoError('Repository name is required');
      return;
    }
    // Validate repository name (alphanumeric, dashes, dots, underscores)
    if (!/^[a-zA-Z0-9_.-]+$/.test(newRepoName.trim())) {
      setRepoError('Repository name can only contain alphanumeric characters, hyphens, periods, and underscores.');
      return;
    }

    try {
      setIsCreatingRepo(true);
      setRepoError(null);
      const created = await onCreateNewRepo(newRepoName.trim(), newRepoDesc, newRepoPrivate);
      onChangeConfig({
        repoOwner: created.owner.login,
        repoName: created.name,
        isNewRepo: false,
        targetBranch: created.default_branch || 'main',
      });
      setRepoMode('existing');
    } catch (err: any) {
      setRepoError(err.message || 'Failed to create repository on GitHub');
    } finally {
      setIsCreatingRepo(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Target Repository Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select or initialize the GitHub repository and branch that will receive your migrated directory structure.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-amber-400" />
            <div className="text-xs">
              <span className="font-semibold text-white">Using Demo Sandbox Mode.</span>
              <span className="text-amber-200 ml-1">
                To migrate into your real live GitHub repository, connect your Personal Access Token.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenAuthModal}
            className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
          >
            Connect Token
          </button>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => {
            setRepoMode('existing');
            onChangeConfig({ isNewRepo: false });
          }}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            repoMode === 'existing'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <FolderGit2 className="h-4 w-4" />
          <span>Select Existing Repository</span>
        </button>

        <button
          onClick={() => {
            setRepoMode('new');
            onChangeConfig({ isNewRepo: true });
          }}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            repoMode === 'new'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Create New Repository</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          {repoMode === 'existing' ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchRepo}
                  onChange={(e) => setSearchRepo(e.target.value)}
                  placeholder="Filter repositories..."
                  className="w-full rounded-md border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {filteredRepos.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No repositories found matching "{searchRepo}".
                  </div>
                ) : (
                  filteredRepos.map((repo) => {
                    const isSelected =
                      config.repoOwner === repo.owner.login && config.repoName === repo.name;
                    return (
                      <div
                        key={repo.id}
                        onClick={() => handleSelectExistingRepo(repo)}
                        className={`cursor-pointer rounded-lg border p-3 transition-all ${
                          isSelected
                            ? 'border-cyan-500/50 bg-cyan-950/20'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {repo.private ? (
                              <Lock className="h-3.5 w-3.5 text-amber-400" />
                            ) : (
                              <Globe className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            <span className="font-mono text-xs font-semibold text-white">
                              {repo.full_name}
                            </span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                          </div>
                          <span className="font-mono text-[11px] text-slate-500">
                            {repo.default_branch}
                          </span>
                        </div>
                        {repo.description && (
                          <p className="mt-1 text-[11px] text-slate-400 truncate">
                            {repo.description}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Create New Repo Form */
            <form
              onSubmit={handleCreateRepoSubmit}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4"
            >
              <h2 className="text-xs font-semibold text-white">New GitHub Repository Details</h2>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Repository Name
                </label>
                <div className="flex items-center">
                  <span className="rounded-l-lg border border-r-0 border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-500">
                    {config.repoOwner || 'github'}/
                  </span>
                  <input
                    type="text"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    placeholder="my-project-suite"
                    className="w-full rounded-r-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newRepoDesc}
                  onChange={(e) => setNewRepoDesc(e.target.value)}
                  placeholder="Migrated applications with preserved directory hierarchy"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewRepoPrivate(true)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-all ${
                      newRepoPrivate
                        ? 'border-cyan-500/50 bg-cyan-950/20 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <span className="font-medium">Private Repository</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRepoPrivate(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-all ${
                      !newRepoPrivate
                        ? 'border-cyan-500/50 bg-cyan-950/20 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium">Public Repository</span>
                  </button>
                </div>
              </div>

              {repoError && (
                <div className="text-xs text-rose-400 font-medium">{repoError}</div>
              )}

              <button
                type="submit"
                disabled={isCreatingRepo}
                className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors"
              >
                {isCreatingRepo ? 'Creating on GitHub...' : 'Initialize & Select Repository'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Branch & Commit Options */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h2 className="text-xs font-semibold text-white">Branch & Commit Metadata</h2>

            {/* Target Branch */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Target Branch
              </label>
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={config.targetBranch}
                  onChange={(e) => onChangeConfig({ targetBranch: e.target.value })}
                  placeholder="main"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Commit Message */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Commit Message
              </label>
              <textarea
                rows={2}
                value={config.commitMessage}
                onChange={(e) => onChangeConfig({ commitMessage: e.target.value })}
                placeholder="feat: migrate application with preserved directory structure"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            {/* Security Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.sanitizeDotEnv}
                  onChange={(e) => onChangeConfig({ sanitizeDotEnv: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Sanitize private keys in .env files</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.preserveEmptyDirectories}
                  onChange={(e) =>
                    onChangeConfig({ preserveEmptyDirectories: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Preserve empty directories via .gitkeep</span>
              </label>
            </div>
          </div>

          {/* Selected Summary Card */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/10 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Target:</span>
              <span className="font-mono text-cyan-300">
                {config.repoOwner}/{config.repoName}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Branch: {config.targetBranch}</span>
              <span aria-hidden="true">·</span>
              <span>Root: {config.destinationPrefix || '/'}</span>
            </div>

            <button
              type="button"
              onClick={onProceedToMigrate}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
            >
              <span>Ready to Execute Migration</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
