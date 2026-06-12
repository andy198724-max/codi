import { FolderOpen, GitBranch, Monitor, Server } from "lucide-react";

interface Props {
  onOpenProject: () => void;
  onCreateProject: (template: string) => void;
}

const RECENT_KEY = "codi_recent_projects";

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}

export function WelcomePage({ onOpenProject, onCreateProject }: Props) {
  const recent = getRecent();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 select-none">
      <div className="flex-1" />
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
          <img src="/codi-logo.svg" alt="Codi" className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-semibold text-surface-200 tracking-tight">Codi</h2>
      </div>
      <p className="text-sm text-surface-500 mb-6 text-center max-w-md">
        Start by opening a folder or connecting to a remote server
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6 w-full max-w-lg">
        <button
          onClick={onOpenProject}
          className="flex flex-col items-center gap-2 p-5 rounded-xl border border-surface-800 hover:border-codi-500/40 hover:bg-surface-900/50 transition-all text-center group"
        >
          <FolderOpen size={24} className="text-surface-500 group-hover:text-codi-400 transition-colors" />
          <p className="text-sm font-medium text-surface-200">Open Folder</p>
          <p className="text-xs text-surface-600">Browse an existing project</p>
        </button>
        <button
          className="flex flex-col items-center gap-2 p-5 rounded-xl border border-surface-800 hover:border-codi-500/40 hover:bg-surface-900/50 transition-all text-center group opacity-60 cursor-not-allowed"
        >
          <Server size={24} className="text-surface-500" />
          <p className="text-sm font-medium text-surface-200">Connect to Remote</p>
          <p className="text-xs text-surface-600">SSH or Dev Container</p>
        </button>
      </div>

      {recent.length > 0 && (
        <div className="w-full max-w-lg mb-6">
          <p className="text-xs text-surface-600 uppercase tracking-wider mb-2">Recent Projects</p>
          <div className="space-y-1">
            {recent.map((path) => (
              <button
                key={path}
                onClick={onOpenProject}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-800/50 transition-colors text-sm text-surface-400 hover:text-surface-200 flex items-center gap-2"
              >
                <FolderOpen size={14} className="text-surface-600" />
                <span className="truncate">{path}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />
      <p className="text-xxs text-surface-700 pb-4">
        Codi · LLaVA-NeXT 34B
      </p>
    </div>
  );
}
