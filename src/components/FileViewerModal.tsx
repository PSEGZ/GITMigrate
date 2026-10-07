import React from 'react';
import { MigrationFile } from '../types';
import { FileCode, X, Copy, Check, Hash } from 'lucide-react';

interface FileViewerModalProps {
  file: MigrationFile | null;
  onClose: () => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ file, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!file) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = file.content ? file.content.split('\n').length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-3.5 bg-slate-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileCode className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="font-mono text-xs font-semibold text-white truncate">
              {file.path}
            </span>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-mono tabular-nums">
              <span aria-hidden="true">·</span>
              <span>{lineCount} lines</span>
              <span aria-hidden="true">·</span>
              <span>{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed">
          {file.isBinary ? (
            <div className="text-center py-12 text-slate-500">
              Binary asset (base64 encoded for Git Blob creation, {file.size} bytes).
            </div>
          ) : (
            <pre className="whitespace-pre overflow-x-auto selection:bg-cyan-500/20">
              {file.content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
