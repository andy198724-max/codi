import { useChatStore } from "@/stores/chat";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Code2,
  Columns,
  PanelLeft,
  Settings,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";

interface StatusBarProps {
  view: "chat" | "editor" | "split";
  onViewChange: (view: "chat" | "editor" | "split") => void;
  showExplorer: boolean;
  onToggleExplorer: () => void;
  onOpenSettings: () => void;
}

export function StatusBar({
  view,
  onViewChange,
  showExplorer,
  onToggleExplorer,
  onOpenSettings,
}: StatusBarProps) {
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isLoading = useChatStore((s) => s.isLoading);
  const error = useChatStore((s) => s.error);
  const activeConversationId = useChatStore((s) => s.activeConversationId);

  const isConnected = !error;

  return (
    <div className="h-8 px-3 flex items-center justify-between bg-surface-100 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 text-xs text-surface-500 dark:text-surface-400 select-none">
      {/* Left */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleExplorer}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors",
            showExplorer && "text-codi-600 dark:text-codi-400"
          )}
          title="Toggle Explorer"
        >
          <PanelLeft size={14} />
        </button>

        <div className="w-px h-4 bg-surface-300 dark:bg-surface-700" />

        {/* View Toggle */}
        <button
          onClick={() => onViewChange("chat")}
          className={cn(
            "px-2 py-1 rounded hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors",
            view === "chat" && "text-codi-600 dark:text-codi-400"
          )}
          title="Chat Only"
        >
          <MessageSquare size={14} />
        </button>
        <button
          onClick={() => onViewChange("split")}
          className={cn(
            "px-2 py-1 rounded hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors",
            view === "split" && "text-codi-600 dark:text-codi-400"
          )}
          title="Split View"
        >
          <Columns size={14} />
        </button>
        <button
          onClick={() => onViewChange("editor")}
          className={cn(
            "px-2 py-1 rounded hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors",
            view === "editor" && "text-codi-600 dark:text-codi-400"
          )}
          title="Editor Only"
        >
          <Code2 size={14} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div className="flex items-center gap-1.5">
          {isStreaming ? (
            <Loader2 size={12} className="animate-spin text-codi-500" />
          ) : isConnected ? (
            <Wifi size={12} className="text-emerald-500" />
          ) : (
            <WifiOff size={12} className="text-red-500" />
          )}
          <span
            className={cn(
              isConnected
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {isStreaming
              ? "Streaming"
              : isConnected
              ? "Connected"
              : "Disconnected"}
          </span>
        </div>

        <div className="w-px h-4 bg-surface-300 dark:bg-surface-700" />

        {/* Mode */}
        <span className="text-surface-500">
          {activeConversationId ? "Agent" : "Chat"}
        </span>

        <div className="w-px h-4 bg-surface-300 dark:bg-surface-700" />

        <button
          onClick={onOpenSettings}
          className="px-2 py-1 rounded hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
          title="Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}
