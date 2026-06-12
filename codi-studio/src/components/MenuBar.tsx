import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chat";
import { useProjectStore } from "@/stores/project";
import { FileText, FolderOpen, Save, Search, Replace, Code2, Columns, Maximize2, Terminal, Play, Settings, Keyboard, Info, Copy, Scissors, Clipboard, GitBranch, Bug, Puzzle, PanelLeft } from "lucide-react";

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
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
  const rootPath = useProjectStore((s) => s.rootPath);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleOpenProject = async () => {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({ directory: true });
    if (selected) await openProject(selected);
    setOpenMenu(null);
  };

  const menus: Menu[] = [
    {
      label: "Archivo",
      items: [
        { label: "Nuevo Chat", shortcut: "Ctrl+N", action: () => { newConversation(); setOpenMenu(null); } },
        { label: "Abrir Carpeta", shortcut: "Ctrl+O", action: handleOpenProject },
        { label: "Abrir Reciente", shortcut: "Ctrl+R" },
        { divider: true },
        { label: "Guardar", shortcut: "Ctrl+S" },
        { label: "Cerrar Editor", shortcut: "Ctrl+W" },
        { divider: true },
        { label: "Preferencias", shortcut: "Ctrl+," },
        { label: "Salir", shortcut: "Alt+F4", action: () => window.close() },
      ],
    },
    {
      label: "Editar",
      items: [
        { label: "Deshacer", shortcut: "Ctrl+Z" },
        { label: "Rehacer", shortcut: "Ctrl+Y" },
        { divider: true },
        { label: "Cortar", shortcut: "Ctrl+X" },
        { label: "Copiar", shortcut: "Ctrl+C" },
        { label: "Pegar", shortcut: "Ctrl+V" },
        { divider: true },
        { label: "Buscar", shortcut: "Ctrl+F" },
        { label: "Reemplazar", shortcut: "Ctrl+H" },
        { label: "Buscar en Archivos", shortcut: "Ctrl+Shift+F" },
      ],
    },
    {
      label: "Seleccion",
      items: [
        { label: "Seleccionar Todo", shortcut: "Ctrl+A" },
        { label: "Expandir Seleccion" },
        { divider: true },
        { label: "Duplicar Linea", shortcut: "Shift+Alt+Down" },
        { label: "Mover Linea Arriba", shortcut: "Alt+Up" },
        { label: "Mover Linea Abajo", shortcut: "Alt+Down" },
        { label: "Comentar Linea", shortcut: "Ctrl+/" },
      ],
    },
    {
      label: "Ver",
      items: [
        { label: "Explorador", shortcut: "Ctrl+B", action: () => { setOpenMenu(null); } },
        { label: "Busqueda", shortcut: "Ctrl+Shift+F" },
        { label: "Git", shortcut: "Ctrl+Shift+G" },
        { label: "Terminal", shortcut: "Ctrl+`" },
        { divider: true },
        { label: "Problemas", shortcut: "Ctrl+Shift+M" },
        { label: "Output", shortcut: "Ctrl+Shift+U" },
        { label: "Linea de Tiempo" },
        { divider: true },
        { label: "Pantalla Completa", shortcut: "F11" },
        { label: "Acercar", shortcut: "Ctrl+=" },
        { label: "Alejar", shortcut: "Ctrl+-" },
      ],
    },
    {
      label: "Ir",
      items: [
        { label: "Archivo", shortcut: "Ctrl+P" },
        { label: "Simbolo en Archivo", shortcut: "Ctrl+Shift+O" },
        { label: "Ir a Linea", shortcut: "Ctrl+G" },
        { divider: true },
        { label: "Ir a Definicion", shortcut: "F12" },
        { label: "Ir a Referencias", shortcut: "Shift+F12" },
        { divider: true },
        { label: "Atras", shortcut: "Alt+Left" },
        { label: "Adelante", shortcut: "Alt+Right" },
      ],
    },
    {
      label: "Ejecutar",
      items: [
        { label: "Modo Chat", shortcut: "Ctrl+Shift+C", action: () => { useChatStore.getState().setMode("chat"); setOpenMenu(null); } },
        { label: "Modo Agente", shortcut: "Ctrl+Shift+A", action: () => { useChatStore.getState().setMode("agent"); setOpenMenu(null); } },
        { divider: true },
        { label: "Iniciar Debugging", shortcut: "F5" },
        { label: "Ejecutar Tests", shortcut: "Ctrl+Shift+T" },
      ],
    },
    {
      label: "Terminal",
      items: [
        { label: "Nuevo Terminal", shortcut: "Ctrl+Shift+`" },
        { label: "Dividir Terminal", shortcut: "Ctrl+Shift+5" },
        { divider: true },
        { label: "Matar Terminal" },
      ],
    },
    {
      label: "Ayuda",
      items: [
        { label: "Documentacion" },
        { label: "Atajos de Teclado", shortcut: "Ctrl+K Ctrl+S" },
        { divider: true },
        { label: "Acerca de Codi" },
      ],
    },
  ];

  return (
    <div ref={menuRef} className="h-7 bg-surface-925 border-b border-surface-850 flex items-center px-1 select-none shrink-0 drag-region">
      <div className="h-full no-drag">
        {menus.map((menu) => (
          <div key={menu.label} className="relative inline-block h-full">
            <button
              onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
              onMouseEnter={() => openMenu && setOpenMenu(menu.label)}
              className={`h-full px-2.5 text-[11px] text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors ${openMenu === menu.label ? "bg-surface-800 text-surface-200" : ""}`}
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
                      className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] hover:bg-surface-800 transition-colors text-left text-surface-300"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && <span className="text-surface-600 ml-4">{item.shortcut}</span>}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex-1 drag-region" />
    </div>
  );
}
