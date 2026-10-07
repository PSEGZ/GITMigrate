import React, { useState, useEffect } from 'react';
import { 
  GitHubRepo, 
  GitHubUser, 
  MigrationConfig, 
  MigrationFile, 
  MigrationLog, 
  MigrationResult, 
  MigrationStep 
} from './types';
import { GitHubService } from './services/github';
import { APP_PRESETS } from './services/mockData';
import { Header } from './components/Header';
import { AppSourcePicker } from './components/AppSourcePicker';
import { DirectoryTreeView } from './components/DirectoryTreeView';
import { RepoTargetSelector } from './components/RepoTargetSelector';
import { MigrationConsole } from './components/MigrationConsole';
import { TokenModal } from './components/TokenModal';
import { CliGuideModal } from './components/CliGuideModal';
import { FileViewerModal } from './components/FileViewerModal';
import { 
  FolderTree, 
  GitFork, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Layers,
  Terminal,
  KeyRound
} from 'lucide-react';

export default function App() {
  // Service instance
  const [gitHubService] = useState<GitHubService>(() => new GitHubService(undefined, true));

  // Authentication State
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false);

  // App & Files State
  const [files, setFiles] = useState<MigrationFile[]>(() => APP_PRESETS[0].files);
  const [sourceName, setSourceName] = useState<string>(APP_PRESETS[0].name);
  const [destinationPrefix, setDestinationPrefix] = useState<string>('');

  // Target Repository State
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [config, setConfig] = useState<MigrationConfig>({
    repoOwner: 'shoutinsms',
    repoName: 'cloud-apps-monorepo',
    isNewRepo: false,
    newRepoPrivate: true,
    newRepoDescription: 'Repository for migrated apps with preserved directory structure',
    targetBranch: 'main',
    createNewBranch: false,
    destinationPrefix: '',
    commitMessage: 'feat: migrate application with preserved directory structure',
    authorName: 'Developer',
    authorEmail: 'shoutinsms@gmail.com',
    preserveEmptyDirectories: true,
    sanitizeDotEnv: true,
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<'source' | 'tree' | 'target' | 'migrate' | 'cli'>('source');
  const [inspectingFile, setInspectingFile] = useState<MigrationFile | null>(null);
  const [isCliGuideOpen, setIsCliGuideOpen] = useState<boolean>(false);

  // Migration Execution State
  const [migrationStep, setMigrationStep] = useState<MigrationStep>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  // Initialize Auth & Repositories
  useEffect(() => {
    const initAuth = async () => {
      try {
        const u = await gitHubService.verifyAuth();
        setUser(u);
        const r = await gitHubService.listRepositories();
        setRepos(r);
        if (r.length > 0) {
          setConfig((prev) => ({
            ...prev,
            repoOwner: r[0].owner.login,
            repoName: r[0].name,
            targetBranch: r[0].default_branch || 'main',
          }));
        }
      } catch (err) {
        console.error('Initial auth check:', err);
      }
    };
    initAuth();
  }, [gitHubService]);

  // Handle Token Save
  const handleSaveToken = async (newToken: string) => {
    gitHubService.setToken(newToken);
    const u = await gitHubService.verifyAuth();
    setUser(u);
    setToken(newToken);
    setIsDemo(false);
    const r = await gitHubService.listRepositories();
    setRepos(r);
    if (r.length > 0) {
      setConfig((prev) => ({
        ...prev,
        repoOwner: r[0].owner.login,
        repoName: r[0].name,
        targetBranch: r[0].default_branch || 'main',
      }));
    }
  };

  const handleUseDemo = () => {
    gitHubService.setDemoMode(true);
    setIsDemo(true);
    setToken(null);
    gitHubService.verifyAuth().then((u) => {
      setUser(u);
      gitHubService.listRepositories().then((r) => {
        setRepos(r);
      });
    });
  };

  const handleDisconnect = () => {
    gitHubService.setToken('');
    gitHubService.setDemoMode(true);
    setToken(null);
    setIsDemo(true);
    handleUseDemo();
  };

  // Files Loaded Handler
  const handleFilesLoaded = (newFiles: MigrationFile[], name: string) => {
    setFiles(newFiles);
    setSourceName(name);
    // Reset any previous execution results
    setMigrationResult(null);
    setMigrationStep('idle');
    setProgressPercent(0);
  };

  // Create New Repo Handler
  const handleCreateNewRepo = async (name: string, description: string, isPrivate: boolean) => {
    const created = await gitHubService.createRepository({
      name,
      description,
      isPrivate,
    });
    setRepos((prev) => [created, ...prev]);
    return created;
  };

  // Execute Migration
  const handleStartMigration = async () => {
    if (files.length === 0) return;
    setMigrationStep('validating');
    setProgressPercent(0);
    setLogs([]);
    setMigrationResult(null);
    setMigrationError(null);

    const fullConfig = {
      ...config,
      destinationPrefix,
    };

    try {
      const result = await gitHubService.executeMigration(
        fullConfig,
        files,
        (stepName, pct, logItem) => {
          setMigrationStep(stepName as MigrationStep);
          setProgressPercent(pct);
          setLogs((prev) => [...prev, logItem]);
        }
      );
      setMigrationResult(result);
      setMigrationStep('completed');
    } catch (err: any) {
      setMigrationStep('failed');
      setMigrationError(err.message || 'Migration encountered an error');
    }
  };

  const handleResetMigration = () => {
    setMigrationStep('idle');
    setProgressPercent(0);
    setLogs([]);
    setMigrationResult(null);
    setMigrationError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar adhering to Top Bar Contract */}
      <Header
        user={user}
        isDemo={isDemo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
        onToggleDemo={() => (isDemo ? setIsTokenModalOpen(true) : handleUseDemo())}
        filesCount={files.length}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Visual Architecture Banner */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Deterministic Git Tree Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-balance">
                Move Applications to GitHub with Preserved Directory Structures
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Atomic Git Data API commits guarantee every folder, nested path, configuration, and dotfile is transferred into your GitHub repository without loss, flattening, or broken dependencies.
              </p>

              {/* Unboxed Metadata with · separator */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400 font-mono">
                <span className="text-slate-300">Target User: shoutinsms</span>
                <span aria-hidden="true">·</span>
                <span>Active Branch: {config.targetBranch}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400">Recursive Git Trees Supported</span>
              </div>
            </div>

            <div className="lg:col-span-4 hidden lg:block">
              <div className="relative overflow-hidden rounded-xl border border-slate-800 shadow-xl group">
                <img
                  src="/src/assets/images/migration_pipeline_hero_1791350373560.jpg"
                  alt="Git Tree Directory Architecture"
                  className="w-full h-36 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-[11px] font-mono text-cyan-300">
                    Recursive Hierarchy Invariant
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        <div className="transition-all">
          {activeTab === 'source' && (
            <AppSourcePicker
              files={files}
              onFilesLoaded={handleFilesLoaded}
              onProceedToTree={() => setActiveTab('tree')}
              sourceName={sourceName}
            />
          )}

          {activeTab === 'tree' && (
            <DirectoryTreeView
              files={files}
              destinationPrefix={destinationPrefix}
              setDestinationPrefix={setDestinationPrefix}
              onPreviewFile={(f) => setInspectingFile(f)}
              onProceedToTarget={() => setActiveTab('target')}
            />
          )}

          {activeTab === 'target' && (
            <RepoTargetSelector
              repos={repos}
              config={{ ...config, destinationPrefix }}
              onChangeConfig={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
              onProceedToMigrate={() => setActiveTab('migrate')}
              onCreateNewRepo={handleCreateNewRepo}
              onOpenAuthModal={() => setIsTokenModalOpen(true)}
              isAuthenticated={!isDemo && !!token}
            />
          )}

          {activeTab === 'migrate' && (
            <MigrationConsole
              files={files}
              config={{ ...config, destinationPrefix }}
              step={migrationStep}
              progressPercent={progressPercent}
              logs={logs}
              result={migrationResult}
              error={migrationError}
              onStartMigration={handleStartMigration}
              onReset={handleResetMigration}
              isDemo={isDemo}
              onOpenCliGuide={() => setIsCliGuideOpen(true)}
            />
          )}

          {activeTab === 'cli' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Command Line Interface (CLI) Commands
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Run standard git commands in your local shell to push with guaranteed folder hierarchy.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <button
                  onClick={() => setIsCliGuideOpen(true)}
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
                >
                  Open Full CLI Command Generator
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-850 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">GitMigrate Studio</span>
            <span aria-hidden="true">·</span>
            <span>Directory-Preserving GitHub Migration Engine</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setIsCliGuideOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Terminal Guide
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsTokenModalOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              GitHub Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        currentAuth={{ token, user, isDemo }}
        onSaveToken={handleSaveToken}
        onUseDemo={handleUseDemo}
        onDisconnect={handleDisconnect}
      />

      <CliGuideModal
        isOpen={isCliGuideOpen}
        onClose={() => setIsCliGuideOpen(false)}
        config={{ ...config, destinationPrefix }}
      />

      <FileViewerModal
        file={inspectingFile}
        onClose={() => setInspectingFile(null)}
      />
    </div>
  );
}
