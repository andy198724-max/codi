import { useChatStore } from "@/stores/chat";
import { useProjectStore } from "@/stores/project";
import { cn } from "@/lib/utils";
import { GitBranch, AlertCircle, Wifi, WifiOff, Settings, ChevronDown, PanelLeft, Activity, Terminal, MessageSquare, Code2, Columns } from "lucide-react";

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

export function StatusBar({ view, onViewChange, showExplorer, onToggleExplorer, showTimeline, onToggleTimeline, showBottomPanel, onToggleBottomPanel, onOpenSettings }: StatusBarProps) {
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isLoading = useChatStore((s) => s.isLoading);
  const error = useChatStore((s) => s.error);
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeConversationId);
  const setMode = useChatStore((s) => s.setMode);
  const rootPath = useProjectStore((s) => s.rootPath);
  const selectedFilePath = useProjectStore((s) => s.selectedFilePath);

  const activeConv = conversations.find((c) => c.id === activeId);
  const currentMode = activeConv?.mode || "chat";
  const branch = "main";
  const lang = selectedFilePath?.split(".").pop()?.toUpperCase() || "—";

  const leftItems = [
    { icon: GitBranch, label: branch, action: undefined, color: "text-surface-500" },
    { icon: AlertCircle, label: "0▲ 0▼", action: undefined, color: "text-surface-500" },
    { icon: undefined, label: "·", action: undefined, color: "text-surface-700" },
    ...(["chat", "split", "editor"] as const).map((v) => ({ icon: undefined, label: v, action: () => onViewChange(v),
      color: view === v ? "text-surface-300" : "text-surface-500" })),
    { icon: undefined, label: "·", action: undefined, color: "text-surface-700" },
    { icon: Activity, label: currentMode, action: () => activeId && setMode(currentMode === "chat" ? "agent" : "chat"),
      color: currentMode === "agent" ? "text-codi-400" : "text-surface-500" },
  ];

  return (
    <div className="h-[22px] px-2 flex items-center justify-between bg-surface-900 text-[11px] select-none shrink-0 border-t border-surface-850">
      <div className="flex items-center gap-1.5">
        {leftItems.map((item, i) => (
          item.action ? (
            <button key={i} onClick={item.action}
              className={cn("hover:text-surface-300 transition-colors capitalize flex items-center gap-0.5", item.color)}>
              {item.icon && <item.icon size={11} />}
              {item.label}
            </button>
          ) : (
            <span key={i} className={item.color + " flex items-center gap-0.5"}>
              {item.icon && <item.icon size={11} />}
              {item.label}
            </span>
          )
        ))}
        <span className="text-surface-700 mx-0.5">Línea 1, Col 1</span>
        <span className="text-surface-700">·</span>
        <span className="text-surface-500">Espacios: 2</span>
        <span className="text-surface-700">·</span>
        <span className="text-surface-500">UTF-8</span>
        <span className="text-surface-700">·</span>
        <span className="text-surface-500">{lang}</span>
        <button onClick={onToggleTimeline} className={cn("hover:text-surface-300 ml-1", showTimeline && "text-surface-300")}>L.Tiempo</button>
        <button onClick={onToggleBottomPanel} className={cn("hover:text-surface-300 ml-1", showBottomPanel && "text-surface-300")}>Terminal</button>
      </div>
      <div className="flex items-center gap-1.5">
        {isStreaming || isLoading ? (
          <span className="text-surface-500 animate-pulse">Working...</span>
        ) : (
          <span className="text-emerald-500 flex items-center gap-1"><Wifi size={10} /> Ready</span>
        )}
        <span className="text-surface-700">·</span>
        <button className="hover:text-surface-300 transition-colors text-surface-500 flex items-center gap-0.5">
          Codi 34B <ChevronDown size={10} />
        </button>
        <button onClick={onOpenSettings} className="hover:text-surface-300 transition-colors text-surface-500">
          <Settings size={11} />
        </button>
      </div>
    </div>
  );
}
