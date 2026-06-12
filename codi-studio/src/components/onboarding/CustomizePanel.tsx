import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Monitor } from "lucide-react";
import { themeRegistry } from "@/themes/registry";
import { applyTheme, setCurrentThemeId } from "@/themes/engine";

interface Props {
  onComplete: () => void;
}

type Tab = "light" | "dark" | "other";

export function CustomizePanel({ onComplete }: Props) {
  const [tab, setTab] = useState<Tab>("light");
  const [selected, setSelected] = useState("windsurf-dark");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  useEffect(() => {
    const t = themeRegistry.find((th) => th.id === selected);
    if (t) { applyTheme(t); setCurrentThemeId(t.id); }
  }, [selected]);

  const handleImportSettings = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({ directory: true, title: "Selecciona carpeta .vscode o .cursor" });
      if (!selected) return;
      const { invoke } = await import("@tauri-apps/api/core");
      const content = await invoke<string>("read_file", { path: `${selected}/settings.json` }).catch(() => null);
      if (content) {
        const settings = JSON.parse(content);
        localStorage.setItem("codi_imported_settings", JSON.stringify(settings));
        if (settings["editor.fontSize"]) {
          localStorage.setItem("codi_editor_fontSize", String(settings["editor.fontSize"]));
        }
        setImportStatus("Configuracion importada correctamente");
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus("No se encontro settings.json en esa carpeta");
        setTimeout(() => setImportStatus(null), 3000);
      }
    } catch (e: any) {
      setImportStatus(`Error: ${e}`);
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const handleInstallCommand = async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("install_terminal_command");
      setInstallStatus("Comando 'codi' instalado. Abre una terminal nueva.");
      setTimeout(() => setInstallStatus(null), 4000);
    } catch (e: any) {
      setInstallStatus("Instalacion no disponible en esta version");
      setTimeout(() => setInstallStatus(null), 4000);
    }
  };

  const lightThemes = themeRegistry.filter((t) => t.type === "light");
  const darkThemes = themeRegistry.filter((t) => t.type === "dark");
  const otherThemes = themeRegistry.filter((t) => t.type !== "light" && t.type !== "dark");

  const currentThemes = tab === "light" ? lightThemes : tab === "dark" ? darkThemes : otherThemes;

  const handleSelect = (id: string) => { setSelected(id); };

  const handleOpen = () => {
    localStorage.setItem("codi_onboarding_completed", "true");
    onComplete();
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "light", label: "Claro" },
    { id: "dark", label: "Oscuro" },
    { id: "other", label: "Otros" },
  ];

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-surface-950 px-8 transition-colors duration-500">
      <div className="w-full max-w-[680px]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <img src="/codi-logo.svg" alt="Codi" className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-semibold text-surface-800 tracking-tight mb-1">Personalizar Codi</h2>
          <p className="text-sm text-surface-500">Elige un tema y tus preferencias</p>
        </div>

        <div className="flex justify-center gap-1 mb-6 bg-surface-100 rounded-lg p-0.5 transition-colors duration-300">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-surface-950 text-surface-800 shadow-sm"
                  : "text-surface-500 hover:text-surface-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3 max-h-[340px] overflow-y-auto pr-1 mb-6">
          {currentThemes.map((theme) => {
            const isActive = selected === theme.id;
            const c = theme.colors;
            return (
              <button
                key={theme.id}
                onClick={() => handleSelect(theme.id)}
                className={`relative p-2 rounded-xl border-2 transition-all text-left group ${
                  isActive ? "border-codi-500 ring-2 ring-codi-500/20" : "border-surface-200 hover:border-surface-400"
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-codi-500 flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                )}
                <div className="rounded-md overflow-hidden border border-surface-200 mb-2">
                  <div className="h-3" style={{ backgroundColor: c.editor.bg }} />
                  <div className="px-1.5 py-1" style={{ backgroundColor: c.editor.bg }}>
                    <div className="h-1 rounded-sm mb-0.5 w-3/4" style={{ backgroundColor: c.syntax.keyword }} />
                    <div className="h-1 rounded-sm mb-0.5 w-1/2" style={{ backgroundColor: c.syntax.func }} />
                    <div className="h-1 rounded-sm w-2/3" style={{ backgroundColor: c.syntax.string }} />
                  </div>
                  <div className="h-2" style={{ backgroundColor: c.statusBar.bg }} />
                </div>
                <p className="text-[11px] font-medium text-surface-800 leading-tight truncate">{theme.name}</p>
              </button>
            );
          })}
        </div>

        <div className="space-y-2 mb-6">
          <button onClick={handleInstallCommand} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-200 text-left hover:bg-surface-100 transition-colors">
            <Monitor size={18} className="text-surface-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-800">Instalar comando en terminal</p>
              <code className="text-xs text-surface-500">codi</code>
            </div>
            {installStatus ? (
              <span className="text-xs text-emerald-500 font-medium">{installStatus}</span>
            ) : (
              <span className="text-xs text-codi-500 hover:underline font-medium">Instalar</span>
            )}
          </button>
          <button onClick={handleImportSettings} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-200 text-left hover:bg-surface-100 transition-colors">
            <Monitor size={18} className="text-surface-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-800">Importar configuracion</p>
              <p className="text-xs text-surface-500">Desde VS Code o Cursor</p>
            </div>
            {importStatus ? (
              <span className="text-xs text-emerald-500 font-medium">{importStatus}</span>
            ) : (
              <span className="text-xs text-codi-500 hover:underline font-medium">Importar</span>
            )}
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleOpen}
          className="w-full py-3 rounded-xl bg-codi-500 hover:bg-codi-600 text-white font-semibold text-sm transition-colors"
        >
          Abrir Codi
        </motion.button>
      </div>
    </div>
  );
}
