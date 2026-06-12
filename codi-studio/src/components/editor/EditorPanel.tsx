import { useProjectStore } from "@/stores/project";
import { useChatStore } from "@/stores/chat";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { EditorTabs, Breadcrumbs } from "./EditorTabs";
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
      <div className="h-full flex items-center justify-center bg-surface-925">
        <div className="text-center">
          <FileCode size={40} className="mx-auto mb-3 text-surface-600" />
          <p className="text-sm text-surface-400">Selecciona un archivo para editar</p>
          <p className="text-xs text-surface-600 mt-1">Usa el explorador de la izquierda</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-surface-925",
        isFullscreen ? "fixed inset-0 z-50" : "h-full"
      )}
    >
      {/* Breadcrumbs + Tabs */}
      <Breadcrumbs path={selectedFilePath} />
      <div className="flex items-center px-2 h-8 bg-surface-925 border-b border-surface-850 gap-1">
        <div className="flex items-center gap-1.5 px-2 py-0.5">
          <FileCode size={12} className="text-codi-500" />
          <span className="text-xs text-surface-400">{selectedFilePath.split("\\").pop()}</span>
        </div>
        <div className="flex-1" />
        <button onClick={handleSave} className="btn-ghost p-1" title="Guardar">
          <Save size={13} />
        </button>
        <button onClick={() => setIsFullscreen(!isFullscreen)} className="btn-ghost p-1" title="Pantalla completa">
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
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
            minimap: { enabled: false },
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
            folding: true,
            guides: { indentation: true, bracketPairs: true },
            wordWrap: "off",
            suggest: { showWords: true, showSnippets: true },
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            glyphMargin: false,
            contextmenu: false,
          }}
        />
      </div>
    </div>
  );
}
