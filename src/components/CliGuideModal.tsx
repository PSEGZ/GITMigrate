import React, { useState } from 'react';
import { MigrationConfig } from '../types';
import { Terminal, Copy, Check, X, FolderTree, ArrowRight, ShieldCheck } from 'lucide-react';

interface CliGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MigrationConfig;
}

export const CliGuideModal: React.FC<CliGuideModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const repoUrl = `https://github.com/${config.repoOwner || 'YOUR_USER'}/${config.repoName || 'YOUR_REPO'}.git`;
  const branch = config.targetBranch || 'main';
  const prefix = config.destinationPrefix ? config.destinationPrefix.replace(/^\/+/, '').replace(/\/+$/, '') : '';

  const fullScript = prefix
    ? `# 1. Navigate to your app directory
cd /path/to/your-app

# 2. Initialize git repository if not already done
git init

# 3. Create destination subfolder to preserve hierarchy in monorepo
mkdir -p ${prefix}
# Move your files into ${prefix} (preserving subfolders)
rsync -av --exclude 'node_modules' --exclude '.git' ./ ${prefix}/

# 4. Stage all files (preserves all nested directories and dotfiles)
git add .

# 5. Commit with descriptive message
git commit -m "${config.commitMessage || 'feat: migrate apps with preserved directory structure'}"

# 6. Set main branch and remote
git branch -M ${branch}
git remote add origin ${repoUrl}

# 7. Push all directories to GitHub
git push -u origin ${branch}`
    : `# 1. Navigate to your app directory
cd /path/to/your-app

# 2. Initialize git repository
git init

# 3. Stage all files recursively (preserves full folder hierarchy)
git add .

# 4. Create initial commit
git commit -m "${config.commitMessage || 'feat: migrate apps with preserved directory structure'}"

# 5. Ensure branch matches target
git branch -M ${branch}

# 6. Add your GitHub remote repository
git remote add origin ${repoUrl}

# 7. Push to GitHub with full directory tree
git push -u origin ${branch}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(fullScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">
              Terminal / Git CLI Migration Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="text-xs font-semibold text-white mb-1">
              How Git Maintains Directory Structure
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              In Git, directories are not stored as physical files—they are tree objects defined by the relative paths of files. When you run <code className="text-cyan-300 bg-slate-800 px-1 py-0.5 rounded font-mono">git add .</code>, every subdirectory is automatically captured down to arbitrary nesting levels.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                Customized CLI Commands for <code className="text-cyan-400 font-mono">{config.repoName}</code>:
              </span>
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                {copiedScript ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedScript ? 'Copied script' : 'Copy All Commands'}</span>
              </button>
            </div>

            <pre className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
              {fullScript}
            </pre>
          </div>

          <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-4 space-y-2">
            <h4 className="text-xs font-semibold text-cyan-300">Tips for multi-app monorepos:</h4>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Keep root-level configurations (<code className="font-mono text-slate-300">package.json</code>, <code className="font-mono text-slate-300">.gitignore</code>) at the root.</li>
              <li>Nest applications in <code className="font-mono text-slate-300">apps/frontend</code> and <code className="font-mono text-slate-300">apps/backend</code>.</li>
              <li>Empty directories require a <code className="font-mono text-slate-300">.gitkeep</code> file to be tracked by Git.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-800 px-6 py-3 bg-slate-900/60">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
