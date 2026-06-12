import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Monitor } from "lucide-react";
import { themeRegistry } from "@/themes/registry";
import { applyTheme } from "@/themes/engine";

interface Props {
  onComplete: () => void;
}

type Tab = "light" | "dark" | "other";

export function CustomizePanel({ onComplete }: Props) {
  const [tab, setTab] = useState<Tab>("light");
  const [selected, setSelected] = useState("codi-light");

  const lightThemes = themeRegistry.filter((t) => t.type === "light");
  const darkThemes = themeRegistry.filter((t) => t.type === "dark");
  const otherThemes = themeRegistry.filter((t) => t.type !== "light" && t.type !== "dark");

  const currentThemes = tab === "light" ? lightThemes : tab === "dark" ? darkThemes : otherThemes;

  const handleSelect = (id: string) => {
    setSelected(id);
    const t = themeRegistry.find((th) => th.id === id);
    if (t) applyTheme(t);
  };

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
    <div className="h-screen flex flex-col items-center justify-center bg-white px-8">
      <div className="w-full max-w-[680px]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <img src="/codi-logo.svg" alt="Codi" className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-semibold text-[#1a1a1a] tracking-tight mb-1">Personalizar Codi</h2>
          <p className="text-sm text-[#737373]">Elige un tema y tus preferencias</p>
        </div>

        <div className="flex justify-center gap-1 mb-6 bg-[#f5f5f5] rounded-lg p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-white text-[#1a1a1a] shadow-sm"
                  : "text-[#737373] hover:text-[#1a1a1a]"
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
                  isActive ? "border-[#f09000] ring-2 ring-[#f09000]/20" : "border-[#e5e5e5] hover:border-[#d4d4d4]"
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#f09000] flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                )}
                <div className="rounded-md overflow-hidden border border-[#e5e5e5] mb-2">
                  <div className="h-3" style={{ backgroundColor: c.editor.bg }} />
                  <div className="px-1.5 py-1" style={{ backgroundColor: c.editor.bg }}>
                    <div className="h-1 rounded-sm mb-0.5 w-3/4" style={{ backgroundColor: c.syntax.keyword }} />
                    <div className="h-1 rounded-sm mb-0.5 w-1/2" style={{ backgroundColor: c.syntax.func }} />
                    <div className="h-1 rounded-sm w-2/3" style={{ backgroundColor: c.syntax.string }} />
                  </div>
                  <div className="h-2" style={{ backgroundColor: c.statusBar.bg }} />
                </div>
                <p className="text-[11px] font-medium text-[#1a1a1a] leading-tight truncate">{theme.name}</p>
              </button>
            );
          })}
        </div>

        <div className="space-y-2 mb-6">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#e5e5e5] text-left hover:bg-[#f5f5f5] transition-colors">
            <Monitor size={18} className="text-[#a3a3a3]" />
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">Instalar comando en terminal</p>
              <code className="text-xs text-[#a3a3a3]">codi</code>
            </div>
            <span className="ml-auto text-xs text-[#f09000] bg-[#fff8eb] px-2 py-0.5 rounded font-medium">Proximamente</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#e5e5e5] text-left hover:bg-[#f5f5f5] transition-colors">
            <Monitor size={18} className="text-[#a3a3a3]" />
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">Importar configuracion</p>
              <p className="text-xs text-[#a3a3a3]">Desde VS Code o Cursor</p>
            </div>
            <span className="ml-auto text-xs text-[#f09000] bg-[#fff8eb] px-2 py-0.5 rounded font-medium">Proximamente</span>
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleOpen}
          className="w-full py-3 rounded-xl bg-[#f09000] hover:bg-[#d47800] text-white font-semibold text-sm transition-colors"
        >
          Abrir Codi
        </motion.button>
      </div>
    </div>
  );
}
