import { useChatStore } from "@/stores/chat";
import { cn } from "@/lib/utils";
import { MessageSquare, Code2, Columns, PanelLeft, Settings, Wifi, WifiOff, Loader2, Activity, Terminal } from "lucide-react";

interface StatusBarProps {
  view: "chat" | "editor" | "split";
  onViewChange: (view: "chat" | "editor" | "split") => void;
  showExplorer: boolean;
  onToggleExplorer: () => void;
  onOpenSettings: () => void;
  showTimeline: boolean;
  onToggleTimeline: () => void;
  showBottomPanel: boolean;
  onToggleBottomPanel: () => void;
}

export function StatusBar({ view, onViewChange, showExplorer, onToggleExplorer, onOpenSettings, showTimeline, onToggleTimeline, showBottomPanel, onToggleBottomPanel }: StatusBarProps) {
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isLoading = useChatStore((s) => s.isLoading);
  const error = useChatStore((s) => s.error);
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeConversationId);
  const setMode = useChatStore((s) => s.setMode);

  const activeConv = conversations.find((c) => c.id === activeId);
  const currentMode = activeConv?.mode || "chat";
  const isConnected = !error;

  return (
    <div className="h-7 px-2 flex items-center justify-between bg-codi-500 text-white text-xxs select-none shrink-0">
      <div className="flex items-center gap-0.5">
        <button onClick={onToggleExplorer}
          className={cn("px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors flex items-center gap-1",
            showExplorer && "bg-white/15")}>
          <PanelLeft size={12} />
        </button>
        <div className="flex rounded overflow-hidden ml-1">
          {(["chat", "split", "editor"] as const).map((v) => (
            <button key={v} onClick={() => onViewChange(v)}
              className={cn("px-2 py-0.5 hover:bg-white/10 transition-colors capitalize",
                view === v && "bg-white/15")}>
              {v}
            </button>
          ))}
        </div>
        <span className="w-px h-3 bg-white/20 mx-1" />
        <button onClick={() => activeId && setMode(currentMode === "chat" ? "agent" : "chat")}
          className={cn("px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors flex items-center gap-1",
            currentMode === "agent" && "bg-amber-400/30")}>
          {currentMode === "agent" ? "Agent" : "Chat"}
        </button>
        <button onClick={onToggleTimeline}
          className={cn("px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors flex items-center gap-1 ml-1",
            showTimeline && "bg-white/15")}>
          <Activity size={11} /> L.Tiempo
        </button>
        <button onClick={onToggleBottomPanel}
          className={cn("px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors flex items-center gap-1 ml-1",
            showBottomPanel && "bg-white/15")}>
          <Terminal size={11} /> Terminal
        </button>
      </div>

      <div className="flex items-center gap-0.5">
        {isStreaming || isLoading ? (
          <span className="flex items-center gap-1 px-1.5"><Loader2 size={10} className="animate-spin" /> Trabajando</span>
        ) : (
          <span className="flex items-center gap-1 px-1.5">
            {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
            Codi
          </span>
        )}
        <button onClick={onOpenSettings} className="px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors">
          <Settings size={11} />
        </button>
      </div>
    </div>
  );
}
