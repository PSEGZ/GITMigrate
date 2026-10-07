import React, { useRef, useEffect } from 'react';
import { MigrationConfig, MigrationFile, MigrationLog, MigrationResult, MigrationStep } from '../types';
import { 
  Play, 
  RotateCw, 
  CheckCircle2, 
  ExternalLink, 
  GitCommit, 
  Terminal, 
  Copy, 
  Check, 
  AlertCircle,
  FolderTree,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface MigrationConsoleProps {
  files: MigrationFile[];
  config: MigrationConfig;
  step: MigrationStep;
  progressPercent: number;
  logs: MigrationLog[];
  result: MigrationResult | null;
  error: string | null;
  onStartMigration: () => void;
  onReset: () => void;
  isDemo: boolean;
  onOpenCliGuide: () => void;
}

export const MigrationConsole: React.FC<MigrationConsoleProps> = ({
  files,
  config,
  step,
  progressPercent,
  logs,
  result,
  error,
  onStartMigration,
  onReset,
  isDemo,
  onOpenCliGuide,
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [copiedLog, setCopiedLog] = React.useState(false);

  // Auto-scroll log console
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message} ${l.details || ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const stepsList = [
    { key: 'validating', label: '1. Path & Tree Validation' },
    { key: 'creating_blobs', label: '2. Upload Git Blobs' },
    { key: 'building_tree', label: '3. Construct Recursive Tree' },
    { key: 'creating_commit', label: '4. Atomic Commit Creation' },
    { key: 'updating_ref', label: '5. Update Branch Ref' },
    { key: 'verifying', label: '6. Remote Hierarchy Verification' },
  ];

  const getStepStatus = (itemKey: string) => {
    const order = ['validating', 'creating_blobs', 'building_tree', 'creating_commit', 'updating_ref', 'verifying', 'completed'];
    const currentIdx = order.indexOf(step);
    const itemIdx = order.indexOf(itemKey);

    if (step === 'completed') return 'completed';
    if (step === 'failed' && currentIdx === itemIdx) return 'failed';
    if (currentIdx > itemIdx) return 'completed';
    if (currentIdx === itemIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Migration Execution Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Atomic push to GitHub repository with 100% directory hierarchy preservation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {step === 'completed' || step === 'failed' ? (
            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Start New Run</span>
            </button>
          ) : step === 'idle' ? (
            <button
              onClick={onStartMigration}
              disabled={files.length === 0}
              className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Execute Migration Now</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/20 text-xs font-mono text-cyan-300">
              <RotateCw className="h-3.5 w-3.5 animate-spin" />
              <span>Processing...</span>
            </div>
          )}

          <button
            onClick={onOpenCliGuide}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>CLI Equivalent</span>
          </button>
        </div>
      </div>

      {/* Target Spec Summary Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-500">Target Repo:</span>
            <span className="font-mono font-semibold text-white">
              {config.repoOwner}/{config.repoName}
            </span>
            <span className="text-slate-600">/</span>
            <span className="font-mono text-cyan-300">{config.targetBranch}</span>
          </div>

          {/* Unboxed Metadata with · separator */}
          <div className="flex items-center gap-3 text-slate-400 font-mono tabular-nums">
            <span>{files.length} files queued</span>
            <span aria-hidden="true">·</span>
            <span>Mount: {config.destinationPrefix || '/ (root)'}</span>
            <span aria-hidden="true">·</span>
            <span>{isDemo ? 'Sandbox Simulation' : 'Live GitHub API'}</span>
          </div>
        </div>
      </div>

      {/* Pipeline Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            {step === 'completed'
              ? 'Migration Succeeded'
              : step === 'failed'
              ? 'Migration Interrupted'
              : step === 'idle'
              ? 'Ready to dispatch'
              : 'Uploading Git Database Objects...'}
          </span>
          <span className="text-cyan-400 tabular-nums">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              step === 'failed'
                ? 'bg-rose-500'
                : step === 'completed'
                ? 'bg-emerald-400'
                : 'bg-cyan-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {stepsList.map((s) => {
          const status = getStepStatus(s.key);
          return (
            <div
              key={s.key}
              className={`rounded-lg border p-2.5 text-xs transition-all ${
                status === 'completed'
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                  : status === 'active'
                  ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-200'
                  : status === 'failed'
                  ? 'border-rose-500/50 bg-rose-950/20 text-rose-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1.5 font-medium truncate">
                {status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                {status === 'active' && <RotateCw className="h-3.5 w-3.5 animate-spin shrink-0" />}
                {status === 'failed' && <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                <span className="truncate">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Result View */}
      {result && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Migration Completed Successfully!
                </h3>
                <p className="text-xs text-slate-300">
                  Directory hierarchy and all nested paths were preserved in the atomic commit.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={result.treeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-400 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-300 transition-colors"
              >
                <span>View Tree on GitHub</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-emerald-500/20 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[11px]">Commit SHA</span>
              <a
                href={result.commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 hover:underline inline-flex items-center gap-1"
              >
                <span>{result.commitSha.slice(0, 10)}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Verified Hierarchy</span>
              <span className="text-emerald-300 tabular-nums">
                {result.filesCount} files · {result.directoriesCount} folders
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Payload Transferred</span>
              <span className="text-slate-200 tabular-nums">
                {(result.totalBytes / 1024).toFixed(1)} KB (100% intact)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Live Log Console */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 bg-slate-900/60">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>git-database-api.log</span>
          </div>

          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            {copiedLog ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedLog ? 'Copied' : 'Copy Logs'}</span>
          </button>
        </div>

        <div
          ref={logContainerRef}
          className="h-64 overflow-y-auto p-4 font-mono text-xs space-y-1.5 bg-slate-950 text-slate-300 selection:bg-cyan-500/30"
        >
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">
              Console idle. Click "Execute Migration Now" to start transferring directory structure to GitHub.
            </div>
          ) : (
            logs.map((log) => {
              const color =
                log.level === 'success'
                  ? 'text-emerald-400'
                  : log.level === 'warn'
                  ? 'text-amber-400'
                  : log.level === 'error'
                  ? 'text-rose-400'
                  : 'text-slate-300';
              return (
                <div key={log.id} className="leading-relaxed">
                  <span className="text-slate-600 mr-2">[{log.timestamp}]</span>
                  <span className={color}>{log.message}</span>
                  {log.details && (
                    <span className="text-slate-500 block ml-6 text-[11px]">{log.details}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
