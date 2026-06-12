import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ArrowRight, Command as CmdIcon, FileText, Settings, FolderOpen, MessageSquare, Bot, Code2, Columns, Maximize2, Palette, Terminal, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ElementType;
  shortcut?: string;
  category: string;
  action: () => void;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export function CommandPalette({ isOpen, onClose, commands }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  const categories = [...new Set(filtered.map((c) => c.category))];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div
        className="w-[560px] bg-surface-900 border border-surface-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-800">
          <Search size={16} className="text-surface-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar comandos..."
            className="flex-1 bg-transparent border-0 outline-none text-sm text-surface-200 placeholder:text-surface-600"
          />
        </div>
        <div className="max-h-[320px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-center text-surface-500 text-sm py-8">Sin resultados</p>
          ) : (
            categories.map((cat) => {
              const catCommands = filtered.filter((c) => c.category === cat);
              if (catCommands.length === 0) return null;
              const globalIndex = filtered.indexOf(catCommands[0]);
              return (
                <div key={cat}>
                  <p className="text-xxs text-surface-500 uppercase tracking-wider px-3 py-1.5">{cat}</p>
                  {catCommands.map((cmd, i) => {
                    const absIndex = globalIndex + i;
                    const isSelected = absIndex === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => { cmd.action(); onClose(); }}
                        onMouseEnter={() => setSelectedIndex(absIndex)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          isSelected ? "bg-surface-800" : "hover:bg-surface-800/50"
                        )}
                      >
                        {cmd.icon && <cmd.icon size={16} className="text-surface-500" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-surface-200">{cmd.label}</p>
                          {cmd.description && (
                            <p className="text-xs text-surface-500 mt-0.5">{cmd.description}</p>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <span className="text-xxs text-surface-600 whitespace-nowrap">{cmd.shortcut}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export const defaultCommands: Command[] = [
  { id: "new-chat", label: "Nuevo Chat", description: "Crear nueva conversacion", icon: MessageSquare, shortcut: "Ctrl+L", category: "Chat", action: () => {} },
  { id: "open-folder", label: "Abrir Carpeta", description: "Abrir proyecto", icon: FolderOpen, shortcut: "Ctrl+O", category: "Archivo", action: () => {} },
  { id: "toggle-explorer", label: "Explorador", description: "Mostrar/ocultar explorador", icon: Code2, shortcut: "Ctrl+B", category: "Ver", action: () => {} },
  { id: "toggle-split", label: "Vista Dividida", description: "Chat + Editor", icon: Columns, shortcut: "Ctrl+\\", category: "Ver", action: () => {} },
  { id: "agent-mode", label: "Modo Agente", description: "Activar agente autonomo", icon: Bot, shortcut: "Ctrl+Shift+A", category: "Modo", action: () => {} },
  { id: "chat-mode", label: "Modo Chat", description: "Cambiar a chat normal", icon: MessageSquare, shortcut: "Ctrl+Shift+C", category: "Modo", action: () => {} },
  { id: "settings", label: "Configuracion", description: "Abrir panel de configuracion", icon: Settings, shortcut: "Ctrl+,", category: "Sistema", action: () => {} },
  { id: "theme", label: "Cambiar Tema", description: "Seleccionar tema visual", icon: Palette, category: "Apariencia", action: () => {} },
  { id: "terminal", label: "Terminal", description: "Abrir terminal integrado", icon: Terminal, shortcut: "Ctrl+`", category: "Herramientas", action: () => {} },
  { id: "zen-mode", label: "Modo Zen", description: "Editor sin distracciones", icon: Maximize2, shortcut: "Ctrl+K Z", category: "Ver", action: () => {} },
];
