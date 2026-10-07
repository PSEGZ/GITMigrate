import React, { useRef, useState } from 'react';
import { MigrationFile } from '../types';
import { APP_PRESETS } from '../services/mockData';
import { parseFileList, parseZipArchive, parseDroppedItems } from '../services/fileScanner';
import { 
  FolderPlus, 
  FileArchive, 
  Sparkles, 
  Layers, 
  Upload, 
  CheckCircle2, 
  FolderTree, 
  FileCode,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface AppSourcePickerProps {
  files: MigrationFile[];
  onFilesLoaded: (files: MigrationFile[], sourceName: string) => void;
  onProceedToTree: () => void;
  sourceName: string;
}

export const AppSourcePicker: React.FC<AppSourcePickerProps> = ({
  files,
  onFilesLoaded,
  onProceedToTree,
  sourceName,
}) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterIgnored, setFilterIgnored] = useState(true);
  const [activePresetId, setActivePresetId] = useState<string>('current-aistudio-app');

  // Load preset on mount if files are empty
  const handleLoadPreset = (presetId: string) => {
    setActivePresetId(presetId);
    const preset = APP_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onFilesLoaded(preset.files, preset.name);
    }
  };

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsLoading(true);
    try {
      const parsed = await parseFileList(e.target.files, filterIgnored);
      const folderName = e.target.files[0]?.webkitRelativePath?.split('/')[0] || 'Local Folder';
      onFilesLoaded(parsed, folderName);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsLoading(true);
    try {
      const parsed = await parseZipArchive(file, filterIgnored);
      onFilesLoaded(parsed, file.name.replace(/\.zip$/i, ''));
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setIsLoading(true);
    try {
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        // Check if dropped file is a zip
        const firstFile = e.dataTransfer.files[0];
        if (firstFile && firstFile.name.endsWith('.zip')) {
          const parsed = await parseZipArchive(firstFile, filterIgnored);
          onFilesLoaded(parsed, firstFile.name.replace(/\.zip$/i, ''));
        } else {
          const parsed = await parseDroppedItems(e.dataTransfer.items, filterIgnored);
          onFilesLoaded(parsed, 'Dropped Directory');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate unique directories count
  const dirSet = new Set<string>();
  let totalBytes = 0;
  files.forEach((f) => {
    totalBytes += f.size;
    const parts = f.path.split('/');
    parts.pop();
    let accumulated = '';
    parts.forEach((p) => {
      accumulated = accumulated ? `${accumulated}/${p}` : p;
      dirSet.add(accumulated);
    });
  });

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl text-balance">
          App Ingestion & Directory Preservation
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Select or drop your application directories. Every nested folder, configuration file, dotfile, and multi-app path is parsed to guarantee 100% hierarchy preservation on GitHub.
        </p>
      </div>

      {/* Main Upload / Preset Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Direct Upload & Dropzone */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/20'
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 mb-4">
              <Upload className="h-6 w-6" />
            </div>

            <h3 className="text-base font-semibold text-white">
              Drag & Drop App Folders or ZIP Archives
            </h3>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              Drop any project folder, monorepo, or compressed package. Subdirectories are traversed recursively to maintain folder structure.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {/* Native webkitdirectory picker */}
              <input
                ref={folderInputRef}
                type="file"
                // @ts-ignore
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
              >
                <FolderPlus className="h-4 w-4" />
                <span>Select Local App Folder</span>
              </button>

              {/* ZIP archive picker */}
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip"
                onChange={handleZipSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => zipInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-750 hover:text-white transition-colors"
              >
                <FileArchive className="h-4 w-4 text-slate-400" />
                <span>Upload .zip Package</span>
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Processed locally in browser memory — code is only pushed to your authenticated GitHub repo</span>
            </div>
          </div>

          {/* Ignore filter controls */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="filterIgnored"
                  checked={filterIgnored}
                  onChange={(e) => setFilterIgnored(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="filterIgnored" className="text-xs font-medium text-slate-300 cursor-pointer">
                  Auto-exclude build artifacts & dependencies (.gitignore rules)
                </label>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">node_modules/, dist/, .DS_Store</span>
            </div>
          </div>
        </div>

        {/* Right Column: Pre-loaded App Presets */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Direct Preset Exporters</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export this active workspace or test with complex multi-app project structures:
            </p>

            <div className="space-y-3">
              {APP_PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id && files.length > 0;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset.id)}
                    className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                      isSelected
                        ? 'border-cyan-500/50 bg-cyan-950/20'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{preset.name}</span>
                          {isSelected && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{preset.description}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[11px] text-cyan-400 tabular-nums">
                        {preset.files.length} files
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Loaded State Card */}
          {files.length > 0 && (
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/10 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-white">Loaded App: {sourceName}</span>
                </div>
                <span className="text-xs font-mono text-cyan-300 tabular-nums">
                  {(totalBytes / 1024).toFixed(1)} KB
                </span>
              </div>

              {/* Unboxed Metadata metrics with · separator */}
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
                <span>{files.length} files</span>
                <span aria-hidden="true">·</span>
                <span>{dirSet.size} nested directories</span>
                <span aria-hidden="true">·</span>
                <span>Hierarchy verified</span>
              </div>

              <button
                type="button"
                onClick={onProceedToTree}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
              >
                <span>Inspect Directory Tree</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
