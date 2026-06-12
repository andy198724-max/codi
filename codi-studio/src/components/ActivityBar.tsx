import { Files, Search, GitBranch, Puzzle, Settings, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const items = [
  { id: "explorer", icon: Files, label: "Explorer" },
  { id: "search", icon: Search, label: "Search" },
  { id: "git", icon: GitBranch, label: "Git" },
  { id: "agent", icon: Bot, label: "Agent" },
  { id: "extensions", icon: Puzzle, label: "Extensions" },
];

export function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  return (
    <div className="w-12 flex flex-col items-center bg-surface-925 border-r border-surface-850 py-2 gap-1 shrink-0 select-none">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-lg transition-colors relative group",
            activeView === item.id
              ? "text-white"
              : "text-surface-500 hover:text-surface-300"
          )}
          title={item.label}
        >
          {activeView === item.id && (
            <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-codi-500 rounded-r-full" />
          )}
          <item.icon size={20} />
        </button>
      ))}
      <div className="flex-1" />
      <button
        onClick={() => onViewChange("settings")}
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-lg transition-colors",
          activeView === "settings" ? "text-white" : "text-surface-500 hover:text-surface-300"
        )}
        title="Settings"
      >
        {activeView === "settings" && (
          <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-codi-500 rounded-r-full" />
        )}
        <Settings size={20} />
      </button>
    </div>
  );
}
