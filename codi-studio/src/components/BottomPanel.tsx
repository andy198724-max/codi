import { useState, useCallback } from "react";
import { Terminal, AlertCircle, GitBranch, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

type PanelTab = "terminal" | "problems" | "git" | "output";

interface BottomPanelProps {
  onClose: () => void;
}

export function BottomPanel({ onClose }: BottomPanelProps) {
  const [tab, setTab] = useState<PanelTab>("terminal");
  const [commands, setCommands] = useState<{ input: string; output: string }[]>([]);
  const [currentInput, setCurrentInput] = useState("");

  const tabs: { id: PanelTab; label: string; icon: React.ElementType }[] = [
    { id: "terminal", label: "Terminal", icon: Terminal },
    { id: "problems", label: "Problems", icon: AlertCircle },
    { id: "git", label: "Git", icon: GitBranch },
    { id: "output", label: "Output", icon: FileText },
  ];

  const handleCommand = useCallback(async () => {
    if (!currentInput.trim()) return;
    const cmd = currentInput.trim();
    setCommands((prev) => [...prev, { input: cmd, output: "" }]);
    setCurrentInput("");
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const result = await invoke<string>("run_command", { command: cmd, cwd: "." });
      setCommands((prev) => prev.map((c, i) => i === prev.length - 1 ? { ...c, output: result } : c));
    } catch (e: any) {
      setCommands((prev) => prev.map((c, i) => i === prev.length - 1 ? { ...c, output: `Error: ${e}` } : c));
    }
  }, [currentInput]);

  return (
    <div className="h-full flex flex-col bg-surface-925 border-t border-surface-850 text-xs">
      <div className="flex items-center justify-between border-b border-surface-850 shrink-0">
        <div className="flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors border-r border-surface-850",
                tab === t.id
                  ? "bg-surface-900 text-surface-200 border-t-2 border-t-codi-500"
                  : "text-surface-500 hover:text-surface-300 hover:bg-surface-900/50"
              )}
            >
              <t.icon size={12} />
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="btn-ghost p-1 mr-1">
          <X size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {tab === "terminal" && (
          <div className="space-y-1">
            {commands.map((cmd, i) => (
              <div key={i}>
                <div className="text-codi-400">$ {cmd.input}</div>
                {cmd.output && <div className="text-surface-300 whitespace-pre-wrap">{cmd.output}</div>}
              </div>
            ))}
            <div className="flex items-center gap-1 text-codi-400">
              <span>$</span>
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCommand()}
                className="flex-1 bg-transparent border-0 outline-none text-surface-200 font-mono text-xs"
                placeholder="Comando..."
              />
            </div>
          </div>
        )}
        {tab === "problems" && (
          <div className="text-surface-500 p-4 text-center">Sin problemas detectados</div>
        )}
        {tab === "git" && (
          <div className="text-surface-500 p-4 text-center">Panel de Git</div>
        )}
        {tab === "output" && (
          <div className="text-surface-500 p-4 text-center">Sin output del agente</div>
        )}
      </div>
    </div>
  );
}
