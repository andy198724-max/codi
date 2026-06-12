import { FolderOpen, GitBranch, Rocket, Code2, Globe, Database, FileText, Terminal } from "lucide-react";

interface Props {
  onOpenProject: () => void;
  onCreateProject: (template: string) => void;
}

const TEMPLATES = [
  { id: "react", name: "React App", desc: "Vite + React + TypeScript", icon: Code2 },
  { id: "next", name: "Next.js", desc: "App Router + Tailwind", icon: Globe },
  { id: "python", name: "Python API", desc: "FastAPI + SQLAlchemy", icon: Terminal },
  { id: "empty", name: "Vacio", desc: "Proyecto en blanco", icon: FileText },
];

export function WelcomePage({ onOpenProject, onCreateProject }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 select-none">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-codi-500/10 flex items-center justify-center mx-auto mb-4 ring-1 ring-codi-500/20">
            <span className="text-3xl font-bold text-codi-400">C</span>
          </div>
          <h1 className="text-xl font-semibold text-surface-100 mb-1">Codi</h1>
          <p className="text-sm text-surface-500">Asistente de IA para programacion</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={onOpenProject}
            className="flex items-center gap-3 p-4 rounded-xl border border-surface-800 hover:border-codi-500/40 hover:bg-surface-900/50 transition-all text-left group"
          >
            <FolderOpen size={22} className="text-surface-500 group-hover:text-codi-400 transition-colors shrink-0" />
            <div>
              <p className="text-sm font-medium text-surface-200">Abrir Carpeta</p>
              <p className="text-xs text-surface-500 mt-0.5">Explora un proyecto existente</p>
            </div>
          </button>

          <button
            className="flex items-center gap-3 p-4 rounded-xl border border-surface-800 hover:border-codi-500/40 hover:bg-surface-900/50 transition-all text-left group opacity-50 cursor-not-allowed"
          >
            <GitBranch size={22} className="text-surface-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-surface-200">Clonar Repositorio</p>
              <p className="text-xs text-surface-500 mt-0.5">Git clone desde URL</p>
            </div>
          </button>
        </div>

        {/* Templates */}
        <div>
          <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">Nuevo Proyecto</p>
          <div className="grid grid-cols-4 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => onCreateProject(t.id)}
                className="p-3 rounded-xl border border-surface-800 hover:border-codi-500/40 hover:bg-surface-900/50 transition-all text-center group"
              >
                <t.icon size={20} className="text-surface-500 group-hover:text-codi-400 mx-auto mb-2 transition-colors" />
                <p className="text-xs font-medium text-surface-300">{t.name}</p>
                <p className="text-[10px] text-surface-600 mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xxs text-surface-700 mt-8">
          Codi v3.0 · LLaVA-NeXT 34B · 4-bit quantization
        </p>
      </div>
    </div>
  );
}
