import { useProjectStore } from "@/stores/project";
import { useChatStore } from "@/stores/chat";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  FileCode,
  Save,
  Undo2,
  Redo2,
  GitBranch,
  GitCommit,
  Download,
  Maximize2,
  Minimize2,
} from "lucide-react";

export function EditorPanel() {
  const selectedFilePath = useProjectStore((s) => s.selectedFilePath);
  const fileContent = useProjectStore((s) => s.fileContent);
  const isDirty = useProjectStore((s) => s.isDirty);
  const saveFile = useProjectStore((s) => s.saveFile);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<"vs-dark" | "vs">("vs-dark");
  const [currentContent, setCurrentContent] = useState<string>("");

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editor.focus();
  };

  const handleChange: OnChange = (value) => {
    if (value !== undefined) {
      setCurrentContent(value);
    }
  };

  const handleSave = useCallback(async () => {
    if (currentContent) {
      await saveFile(currentContent);
    }
  }, [currentContent, saveFile]);

  const getLanguage = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase();
    const map: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      rs: "rust",
      py: "python",
      json: "json",
      yaml: "yaml",
      yml: "yaml",
      md: "markdown",
      css: "css",
      scss: "scss",
      html: "html",
      sql: "sql",
      sh: "shell",
      toml: "ini",
      kt: "kotlin",
      java: "java",
      go: "go",
    };
    return map[ext || ""] || "plaintext";
  };

  if (!selectedFilePath) {
    return (
      <div className="h-full flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="text-center">
          <FileCode
            size={48}
            className="mx-auto mb-3 text-surface-300 dark:text-surface-700"
          />
          <p className="text-sm text-surface-400">
            Select a file to start editing
          </p>
          <p className="text-xs text-surface-400 mt-1">
            Files appear in the explorer panel on the left
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-surface-50 dark:bg-surface-950",
        isFullscreen ? "fixed inset-0 z-50" : "h-full"
      )}
    >
      {/* Editor Tabs */}
      <div className="flex items-center px-3 h-10 bg-surface-100 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 gap-1">
        <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-surface-800 rounded-t border border-b-0 border-surface-200 dark:border-surface-700 -mb-px">
          <FileCode size={14} className="text-codi-500" />
          <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
            {selectedFilePath.split("\\").pop()}
          </span>
          {isDirty && <span className="w-2 h-2 rounded-full bg-amber-500" />}
        </div>

        <div className="flex-1" />

        <button onClick={handleSave} className="btn-ghost" title="Save">
          <Save size={14} />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="btn-ghost"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          defaultLanguage={getLanguage(selectedFilePath)}
          language={getLanguage(selectedFilePath)}
          value={currentContent || fileContent || ""}
          onChange={handleChange}
          theme={theme}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            renderWhitespace: "selection",
            tabSize: 2,
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            padding: { top: 8 },
          }}
        />
      </div>
    </div>
  );
}
