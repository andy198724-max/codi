import { useState, useEffect, useCallback } from "react";
import { useChatStore } from "@/stores/chat";
import { useProjectStore } from "@/stores/project";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { FileExplorer } from "@/components/explorer/FileExplorer";
import { StatusBar } from "@/components/StatusBar";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { AgentTimeline } from "@/components/agent/AgentTimeline";
import { SplashScreen } from "@/components/onboarding/SplashScreen";
import { CustomizePanel } from "@/components/onboarding/CustomizePanel";
import { MenuBar } from "@/components/MenuBar";
import { applyTheme, getCurrentThemeId } from "@/themes/engine";
import { getThemeById } from "@/themes/registry";
import { WelcomePage } from "@/components/WelcomePage";
import { CommandPalette, defaultCommands } from "@/components/CommandPalette";
import { BottomPanel } from "@/components/BottomPanel";
import { ActivityBar } from "@/components/ActivityBar";
import { QuickOpen } from "@/components/QuickOpen";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

type View = "chat" | "editor" | "split";

type AppPhase = "splash" | "customize" | "main";

export default function App() {
  const done = localStorage.getItem("codi_onboarding_completed");
  const [phase, setPhase] = useState<AppPhase>(done === "true" ? "main" : "splash");
  const [view, setView] = useState<View>("split");
  const [showExplorer, setShowExplorer] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [showQuickOpen, setShowQuickOpen] = useState(false);

  const mode = useChatStore((s) => {
    const conv = s.conversations.find((c) => c.id === s.activeConversationId);
    return conv?.mode || "chat";
  });
  const newConversation = useChatStore((s) => s.newConversation);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const openProject = useProjectStore((s) => s.openProject);
  const rootPath = useProjectStore((s) => s.rootPath);

  useEffect(() => {
    const themeId = getCurrentThemeId();
    const theme = getThemeById(themeId || "windsurf-dark");
    applyTheme(theme);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "l") { e.preventDefault(); newConversation(); }
      if (mod && e.key === ",") { e.preventDefault(); setShowSettings(true); }
      if (mod && e.key === "b") { e.preventDefault(); setShowExplorer((v) => !v); }
      if (mod && e.key === "p") { e.preventDefault(); setShowQuickOpen((v) => !v); }
      if (mod && e.shiftKey && e.key === "P") { e.preventDefault(); setShowCommandPalette((v) => !v); }
      if (e.key === "Escape") { setShowCommandPalette(false); }
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

  if (phase === "splash") {
    return <SplashScreen onComplete={() => setPhase("customize")} />;
  }

  if (phase === "customize") {
    return <CustomizePanel onComplete={() => {
      setPhase("main");
      window.location.reload();
    }} />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface-950" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <MenuBar />
      {!rootPath && !activeConversationId ? (
        <div className="flex-1 flex">
          <ActivityBar activeView="explorer" onViewChange={(v) => { if (v === "settings") setShowSettings(true); }} />
          <WelcomePage
            onOpenProject={async () => {
              const { open } = await import("@tauri-apps/plugin-dialog");
              const selected = await open({ directory: true });
              if (selected) await openProject(selected);
            }}
            onCreateProject={() => newConversation()}
          />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <ActivityBar activeView="explorer" onViewChange={(v) => { if (v === "explorer") setShowExplorer(v => !v); if (v === "settings") setShowSettings(true); }} />
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
      <QuickOpen isOpen={showQuickOpen} onClose={() => setShowQuickOpen(false)} />
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
      {showBottomPanel && (
        <div className="h-48 shrink-0">
          <BottomPanel onClose={() => setShowBottomPanel(false)} />
        </div>
      )}
      <StatusBar
        view={view}
        onViewChange={setView}
        showExplorer={showExplorer}
        onToggleExplorer={() => setShowExplorer((v) => !v)}
        showTimeline={showTimeline}
        onToggleTimeline={() => setShowTimeline((v) => !v)}
        showBottomPanel={showBottomPanel}
        onToggleBottomPanel={() => setShowBottomPanel((v) => !v)}
        onOpenSettings={() => setShowSettings(true)}
      />
        </div>
      )}

      {showSettings && (
        <SettingsDialog onClose={() => setShowSettings(false)} />
      )}

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={defaultCommands}
      />
    </div>
  );
}
