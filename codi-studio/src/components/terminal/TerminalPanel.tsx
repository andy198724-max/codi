import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Terminal, X, Plus, Trash2 } from "lucide-react";

interface TerminalTab {
  id: string;
  name: string;
  output: string[];
}

export function TerminalPanel() {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: "1", name: "bash", output: ["Welcome to CODI Terminal"] },
  ]);
  const [activeTab, setActiveTab] = useState("1");
  const [command, setCommand] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [tabs]);

  const activeTerminal = tabs.find((t) => t.id === activeTab) || tabs[0];

  const handleCommand = useCallback(async () => {
    if (!command.trim()) return;

    const newOutput = [...activeTerminal.output, `$ ${command}`];

    try {
      const { Command } = await import("@tauri-apps/plugin-shell");
      const cmd = Command.create("cmd", ["/c", command]);
      const result = await cmd.execute();
      newOutput.push(result.stdout || result.stderr || "Command executed");
    } catch (err) {
      newOutput.push(`Error: ${err}`);
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab ? { ...t, output: newOutput } : t
      )
    );
    setCommand("");
  }, [command, activeTab, activeTerminal]);

  const addTab = () => {
    const id = String(Date.now());
    setTabs((prev) => [
      ...prev,
      { id, name: `terminal-${prev.length + 1}`, output: [] },
    ]);
    setActiveTab(id);
  };

  const removeTab = (id: string) => {
    if (tabs.length <= 1) return;
    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-950 text-green-400 font-mono text-xs">
      {/* Tabs */}
      <div className="flex items-center bg-surface-900 border-b border-surface-800">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 cursor-pointer border-r border-surface-800 select-none",
              tab.id === activeTab
                ? "bg-surface-950 text-green-300"
                : "text-surface-500 hover:text-surface-300 hover:bg-surface-850"
            )}
          >
            <Terminal size={12} />
            <span>{tab.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}
              className="p-0.5 hover:text-red-400"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <button
          onClick={addTab}
          className="px-2 py-1.5 text-surface-500 hover:text-surface-300 hover:bg-surface-800"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Output */}
      <div ref={outputRef} className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {activeTerminal.output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            {line}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 bg-surface-900 border-t border-surface-800">
        <span className="text-green-500">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCommand();
          }}
          className="flex-1 bg-transparent outline-none text-green-300 placeholder:text-surface-600"
          placeholder="Type a command..."
        />
      </div>
    </div>
  );
}
