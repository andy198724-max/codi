import { useState, useEffect, useCallback } from "react";
import { useChatStore } from "@/stores/chat";
import { useProjectStore } from "@/stores/project";
import { Sidebar } from "@/components/Sidebar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { FileExplorer } from "@/components/explorer/FileExplorer";
import { StatusBar } from "@/components/StatusBar";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { cn } from "@/lib/utils";
import { Panel, PanelGroup, PanelResizeHandle } from "./components/ui/PanelLayout";

type View = "chat" | "editor" | "split";

export default function App() {
  const [view, setView] = useState<View>("split");
  const [showExplorer, setShowExplorer] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light" | "corporate">("dark");
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);

  const isStreaming = useChatStore((s) => s.isStreaming);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const newConversation = useChatStore((s) => s.newConversation);
  const rootPath = useProjectStore((s) => s.rootPath);
  const openProject = useProjectStore((s) => s.openProject);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "corporate");
    if (theme === "corporate") {
      root.classList.add("dark");
      root.style.setProperty("--codi-primary", "#0ea5e9");
    } else {
      root.classList.add(theme);
      root.style.removeProperty("--codi-primary");
    }
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault();
        newConversation();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSettings(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [newConversation]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const items = Array.from(e.dataTransfer.items);
    const files = Array.from(e.dataTransfer.files);

    for (const item of items) {
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry();
        const dirEntry = entry as FileSystemDirectoryEntry | null;
        if (dirEntry && dirEntry.isDirectory) {
          const reader = dirEntry.createReader();
          const fileEntries = await new Promise<FileSystemEntry[]>((resolve) => {
            reader.readEntries((results: FileSystemEntry[]) => resolve(results));
          });
          if (fileEntries.length > 0) {
            const firstFile = fileEntries[0] as any;
            if (firstFile.name) {
              const folderPath = dirEntry.fullPath || dirEntry.name;
              openProject(folderPath.replace(/^\//, ""));
              return;
            }
          }
        }
      }
    }

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          useChatStore.getState().sendStreamMessage(
            "Analyze this image:",
            [reader.result as string]
          );
        };
        reader.readAsDataURL(file);
      }
    }
    }, [openProject]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        {showExplorer && (
          <>
            <FileExplorer
              width={leftPanelWidth}
              onResize={setLeftPanelWidth}
            />
            <div className="w-px bg-surface-200 dark:bg-surface-800" />
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <PanelGroup direction="horizontal">
            {/* Chat Panel */}
            {(view === "chat" || view === "split") && (
              <>
                <Panel defaultSize={view === "split" ? 40 : 100} minSize={30}>
                  <ChatPanel />
                </Panel>
                {view === "split" && (
                  <PanelResizeHandle className="w-1 bg-surface-200 dark:bg-surface-800 hover:bg-codi-500/50 transition-colors cursor-col-resize" />
                )}
              </>
            )}

            {/* Editor Panel */}
            {(view === "editor" || view === "split") && (
              <Panel defaultSize={view === "split" ? 60 : 100} minSize={30}>
                <EditorPanel />
              </Panel>
            )}
          </PanelGroup>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        view={view}
        onViewChange={setView}
        showExplorer={showExplorer}
        onToggleExplorer={() => setShowExplorer(!showExplorer)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Settings Dialog */}
      {showSettings && (
        <SettingsDialog
          theme={theme}
          onThemeChange={setTheme}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
