import { Files, Search, GitBranch, Bug, Puzzle, Bot, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const items = [
  { id: "explorer", icon: Files, label: "Explorador (Ctrl+Shift+E)" },
  { id: "search", icon: Search, label: "Buscar (Ctrl+Shift+F)" },
  { id: "git", icon: GitBranch, label: "Control de Codigo (Ctrl+Shift+G)" },
  { id: "debug", icon: Bug, label: "Ejecutar y Depurar (Ctrl+Shift+D)" },
  { id: "extensions", icon: Puzzle, label: "Extensiones (Ctrl+Shift+X)" },
  { id: "agent", icon: Bot, label: "Agente (Ctrl+Shift+A)" },
];

export function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  return (
    <div className="w-11 flex flex-col items-center bg-surface-925 border-r border-surface-850 py-1 gap-0.5 shrink-0 select-none">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-md transition-colors relative group",
            activeView === item.id
              ? "text-white bg-surface-850"
              : "text-surface-500 hover:text-surface-300 hover:bg-surface-850/50"
          )}
          title={item.label}
        >
          {activeView === item.id && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-codi-500 rounded-r-full" />
          )}
          <item.icon size={20} />
          <div className="absolute left-12 top-1/2 -translate-y-1/2 px-2 py-1 bg-surface-900 border border-surface-800 rounded text-[11px] text-surface-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            {item.label}
          </div>
        </button>
      ))}
      <div className="flex-1" />
      <button
        onClick={() => onViewChange("settings")}
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-md transition-colors",
          activeView === "settings" ? "text-white bg-surface-850" : "text-surface-500 hover:text-surface-300"
        )}
        title="Administrar (Ctrl+,)"
      >
        {activeView === "settings" && (
          <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-codi-500 rounded-r-full" />
        )}
        <Settings size={20} />
      </button>
    </div>
  );
}
