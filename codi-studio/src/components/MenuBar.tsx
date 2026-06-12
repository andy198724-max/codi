import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore } from "@/stores/chat";
import { useProjectStore } from "@/stores/project";
import { FileText, FolderOpen, Save, X, RotateCcw, RotateCw, Copy, Scissors, Clipboard, Eye, EyeOff, Maximize2, Minimize2, MessageSquare, Code2, Columns, Terminal, Play, Bot, User, HelpCircle, Keyboard, Info } from "lucide-react";

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  disabled?: boolean;
}

interface Menu {
  label: string;
  items: MenuItem[];
}

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const newConversation = useChatStore((s) => s.newConversation);
  const openProject = useProjectStore((s) => s.openProject);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpenProject = async () => {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({ directory: true });
    if (selected) {
      await openProject(selected);
    }
    setOpenMenu(null);
  };

  const menus: Menu[] = [
    {
      label: "Archivo",
      items: [
        { label: "Nuevo Chat", shortcut: "Ctrl+N", action: () => { newConversation(); setOpenMenu(null); } },
        { label: "Abrir Carpeta", shortcut: "Ctrl+O", action: handleOpenProject },
        { divider: true },
        { label: "Cerrar", shortcut: "Alt+F4", action: () => window.close() },
      ],
    },
    {
      label: "Ver",
      items: [
        { label: "Explorador", shortcut: "Ctrl+B", action: () => { setOpenMenu(null); } },
        { label: "Chat", shortcut: "Ctrl+1", action: () => { setOpenMenu(null); } },
        { label: "Editor", shortcut: "Ctrl+2", action: () => { setOpenMenu(null); } },
        { label: "Split", shortcut: "Ctrl+3", action: () => { setOpenMenu(null); } },
        { divider: true },
        { label: "Pantalla Completa", shortcut: "F11", action: () => { setOpenMenu(null); } },
      ],
    },
    {
      label: "Modo",
      items: [
        { label: "Chat", shortcut: "Ctrl+Shift+C", action: () => { useChatStore.getState().setMode("chat"); setOpenMenu(null); } },
        { label: "Agente", shortcut: "Ctrl+Shift+A", action: () => { useChatStore.getState().setMode("agent"); setOpenMenu(null); } },
      ],
    },
    {
      label: "Ayuda",
      items: [
        { label: "Atajos de Teclado", shortcut: "Ctrl+K Ctrl+S", action: () => { setOpenMenu(null); } },
        { label: "Documentacion", action: () => { setOpenMenu(null); } },
        { divider: true },
        { label: "Acerca de Codi", action: () => { setOpenMenu(null); } },
      ],
    },
  ];

  return (
    <div ref={menuRef} className="h-8 bg-surface-925 border-b border-surface-850 flex items-center px-2 select-none shrink-0 drag-region">
      <div className="flex items-center h-full no-drag">
        {menus.map((menu) => (
          <div key={menu.label} className="relative h-full">
            <button
              onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
              onMouseEnter={() => openMenu && setOpenMenu(menu.label)}
              className={`h-full px-2.5 text-xs text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors ${
                openMenu === menu.label ? "bg-surface-800 text-surface-200" : ""
              }`}
            >
              {menu.label}
            </button>
            {openMenu === menu.label && (
              <div className="absolute top-full left-0 mt-0.5 w-56 bg-surface-900 border border-surface-800 rounded-lg shadow-2xl py-1 z-50 animate-fade-in">
                {menu.items.map((item, i) =>
                  item.divider ? (
                    <div key={i} className="h-px bg-surface-800 my-1" />
                  ) : (
                    <button
                      key={i}
                      onClick={item.action}
                      disabled={item.disabled}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-surface-800 transition-colors disabled:opacity-40 text-left"
                    >
                      <span className="text-surface-300">{item.label}</span>
                      {item.shortcut && (
                        <span className="text-surface-600 text-xxs ml-4">{item.shortcut}</span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex-1 drag-region" />
      <span className="text-xxs text-surface-600 no-drag flex items-center gap-1">
        <img src="/codi-logo.svg" alt="" className="w-3.5 h-3.5" /> Codi
      </span>
    </div>
  );
}
