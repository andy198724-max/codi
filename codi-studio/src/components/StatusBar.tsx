import { useChatStore } from "@/stores/chat";
import { useProjectStore } from "@/stores/project";
import { cn } from "@/lib/utils";
import { GitBranch, AlertCircle, CircleAlert, ArrowUp, ArrowDown, Wifi, Settings, ChevronDown, X } from "lucide-react";

interface StatusBarProps {
  view: "chat" | "editor" | "split";
  onViewChange: (view: "chat" | "editor" | "split") => void;
  showExplorer: boolean;
  onToggleExplorer: () => void;
  showTimeline: boolean;
  onToggleTimeline: () => void;
  showBottomPanel: boolean;
  onToggleBottomPanel: () => void;
  onOpenSettings: () => void;
}

export function StatusBar({ onOpenSettings }: StatusBarProps) {
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isLoading = useChatStore((s) => s.isLoading);
  const selectedFilePath = useProjectStore((s) => s.selectedFilePath);
  const rootPath = useProjectStore((s) => s.rootPath);
  const error = useChatStore((s) => s.error);

  const branch = rootPath ? rootPath.split("\\").pop() || "main" : "main";
  const lang = selectedFilePath ? (selectedFilePath.split(".").pop()?.toUpperCase() || "—") : "—";
  const problems = 0; // TODO: get from editor markers
  const warnings = 0;

  const Separator = () => <span className="text-surface-700 mx-1 select-none">·</span>;

  return (
    <div className="h-[22px] px-2 flex items-center justify-between bg-surface-900 text-[11px] select-none shrink-0 border-t border-surface-850">
      <div className="flex items-center">
        <span className="flex items-center gap-1 text-surface-500 hover:text-surface-300 cursor-pointer transition-colors">
          <GitBranch size={11} />
          <span>{branch}</span>
        </span>
        <Separator />
        <span className="flex items-center gap-0.5 text-surface-500">
          <AlertCircle size={11} />
          <span>{problems}</span>
          <ArrowUp size={9} />
          <span>{warnings}</span>
          <ArrowDown size={9} />
        </span>
        <Separator />
        <span className="text-surface-500 hover:text-surface-300 cursor-pointer transition-colors">Ln 1, Col 1</span>
        <Separator />
        <span className="text-surface-500 hover:text-surface-300 cursor-pointer transition-colors">Espacios: 2</span>
        <Separator />
        <span className="text-surface-500 hover:text-surface-300 cursor-pointer transition-colors">UTF-8</span>
        <Separator />
        <span className="text-surface-500 hover:text-surface-300 cursor-pointer transition-colors">{lang}</span>
      </div>

      <div className="flex items-center">
        <span className={cn("flex items-center gap-1 text-surface-500", error ? "text-red-400" : "text-emerald-500")}>
          {isStreaming || isLoading ? "Working..." : "Ready"}
        </span>
        <Separator />
        <button className="hover:text-surface-300 transition-colors text-surface-500 flex items-center gap-0.5">
          Codi 34B <ChevronDown size={10} />
        </button>
        <button onClick={onOpenSettings} className="hover:text-surface-300 transition-colors text-surface-500 ml-1">
          <Settings size={11} />
        </button>
      </div>
    </div>
  );
}
