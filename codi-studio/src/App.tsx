import { useState, useEffect, useCallback } from "react";
import { useChatStore } from "@/stores/chat";
import { useProjectStore } from "@/stores/project";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { FileExplorer } from "@/components/explorer/FileExplorer";
import { StatusBar } from "@/components/StatusBar";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { AgentTimeline } from "@/components/agent/AgentTimeline";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

type View = "chat" | "editor" | "split";

export default function App() {
  const [view, setView] = useState<View>("split");
  const [showExplorer, setShowExplorer] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const mode = useChatStore((s) => {
    const conv = s.conversations.find((c) => c.id === s.activeConversationId);
    return conv?.mode || "chat";
  });
  const newConversation = useChatStore((s) => s.newConversation);
  const openProject = useProjectStore((s) => s.openProject);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "l") { e.preventDefault(); newConversation(); }
      if (mod && e.key === ",") { e.preventDefault(); setShowSettings(true); }
      if (mod && e.key === "b") { e.preventDefault(); setShowExplorer((v) => !v); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [newConversation]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          useChatStore.getState().sendMessage("Analiza esta imagen:", [reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface-950" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <PanelGroup direction="horizontal" className="flex-1">

        {showExplorer && (
          <>
            <Panel defaultSize={18} minSize={14} maxSize={30}>
              <FileExplorer width={240} onResize={() => {}} />
            </Panel>
            <PanelResizeHandle className="w-px bg-surface-850 hover:bg-codi-500/50 transition-colors cursor-col-resize" />
          </>
        )}

        <Panel minSize={20}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize={view === "chat" ? 100 : view === "editor" ? 0 : 55} minSize={30}>
              <EditorPanel />
            </Panel>

            {(view === "split" || view === "chat") && (
              <>
                <PanelResizeHandle className="w-px bg-surface-850 hover:bg-codi-500/50 transition-colors cursor-col-resize" />
                <Panel defaultSize={view === "chat" ? 0 : 45} minSize={25}>
                  <div className="flex flex-col h-full">
                    <div className="flex-1 min-h-0">
                      <ChatPanel />
                    </div>
                    {mode === "agent" && showTimeline && (
                      <>
                        <PanelResizeHandle className="h-px bg-surface-850 hover:bg-codi-500/50 transition-colors cursor-row-resize" />
                        <div className="h-48">
                          <AgentTimeline onClose={() => setShowTimeline(false)} />
                        </div>
                      </>
                    )}
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        </Panel>
      </PanelGroup>

      <StatusBar
        view={view}
        onViewChange={setView}
        showExplorer={showExplorer}
        onToggleExplorer={() => setShowExplorer((v) => !v)}
        onOpenSettings={() => setShowSettings(true)}
        showTimeline={showTimeline}
        onToggleTimeline={() => setShowTimeline((v) => !v)}
      />

      {showSettings && (
        <SettingsDialog onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
