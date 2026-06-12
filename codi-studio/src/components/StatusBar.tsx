import { useChatStore } from "@/stores/chat";
import { useProjectStore } from "@/stores/project";
import { cn } from "@/lib/utils";
import { Loader2, Wifi, WifiOff, PanelLeft, MessageSquare, Code2, Columns, Activity, Terminal } from "lucide-react";

interface StatusBarProps {
  view: "chat" | "editor" | "split";
  onViewChange: (view: "chat" | "editor" | "split") => void;
  showExplorer: boolean;
  onToggleExplorer: () => void;
  showTimeline: boolean;
  onToggleTimeline: () => void;
  showBottomPanel: boolean;
  onToggleBottomPanel: () => void;
}

export function StatusBar({ view, onViewChange, showExplorer, onToggleExplorer, showTimeline, onToggleTimeline, showBottomPanel, onToggleBottomPanel }: StatusBarProps) {
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isLoading = useChatStore((s) => s.isLoading);
  const error = useChatStore((s) => s.error);
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeConversationId);
  const setMode = useChatStore((s) => s.setMode);
  const rootPath = useProjectStore((s) => s.rootPath);

  const activeConv = conversations.find((c) => c.id === activeId);
  const currentMode = activeConv?.mode || "chat";
  const branch = rootPath?.split("\\").pop() || "main";

  return (
    <div className="h-[22px] px-2 flex items-center justify-between bg-surface-900 text-[11px] text-surface-500 select-none shrink-0 border-t border-surface-850">
      <div className="flex items-center gap-2">
        <button onClick={onToggleExplorer}
          className={cn("hover:text-surface-300 transition-colors", showExplorer && "text-surface-300")}>
          <PanelLeft size={12} />
        </button>
        <span className="text-surface-500">{branch}</span>
        <span className="text-surface-700">·</span>
        <div className="flex gap-0.5">
          {(["chat", "split", "editor"] as const).map((v) => (
            <button key={v} onClick={() => onViewChange(v)}
              className={cn("px-1 hover:text-surface-300 transition-colors capitalize", view === v && "text-surface-300")}>
              {v}
            </button>
          ))}
        </div>
        <span className="text-surface-700">·</span>
        <button onClick={() => activeId && setMode(currentMode === "chat" ? "agent" : "chat")}
          className={cn("hover:text-surface-300 transition-colors", currentMode === "agent" && "text-codi-400")}>
          {currentMode === "agent" ? "Agent" : "Chat"}
        </button>
        <button onClick={onToggleTimeline}
          className={cn("hover:text-surface-300 transition-colors ml-1", showTimeline && "text-surface-300")}>
          Timeline
        </button>
        <button onClick={onToggleBottomPanel}
          className={cn("hover:text-surface-300 transition-colors ml-1", showBottomPanel && "text-surface-300")}>
          Terminal
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-surface-700">{isStreaming || isLoading ? "Working..." : "Ready"}</span>
        <span className={cn("flex items-center gap-1", error ? "text-red-400" : "text-emerald-500")}>
          {error ? <WifiOff size={10} /> : <Wifi size={10} />}
        </span>
      </div>
    </div>
  );
}
