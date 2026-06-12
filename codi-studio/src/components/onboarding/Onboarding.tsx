import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Zap, Palette, Wifi, Rocket, FolderOpen, Monitor } from "lucide-react";
import { themeRegistry } from "@/themes/registry";
import { applyTheme, getCurrentThemeId } from "@/themes/engine";

const STEPS = [
  { id: "welcome", icon: Zap, title: "Bienvenido a CODI Studio" },
  { id: "theme", icon: Palette, title: "Elige tu tema" },
  { id: "connection", icon: Wifi, title: "Conecta tu API" },
  { id: "ready", icon: Rocket, title: "Todo listo" },
];

interface Props {
  onComplete: (theme: string, apiUrl: string) => void;
}

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState("codi-dark");
  const [apiUrl, setApiUrl] = useState("https://7zya4zzok7kirr.api.runpod.ai");
  const [apiKey, setApiKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "error" | null>(null);

  const currentStep = STEPS[step];

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const resp = await fetch(`${apiUrl}/ping`, {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      });
      if (resp.ok) {
        setTestResult("ok");
      } else {
        setTestResult("error");
      }
    } catch {
      setTestResult("error");
    }
    setTesting(false);
  };

  const handleNext = () => {
    if (step === STEPS.length - 1) {
      localStorage.setItem("codi_onboarding_completed", "true");
      const t = themeRegistry.find(th => th.id === selectedTheme) || themeRegistry[0];
      applyTheme(t);
      localStorage.setItem("codi_api_url", apiUrl);
      localStorage.setItem("codi_api_key", apiKey);
      onComplete(selectedTheme, apiUrl);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-surface-950">
      <div className="w-full max-w-lg px-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? "bg-codi-500 w-8" : "bg-surface-800 w-4"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="w-14 h-14 rounded-xl bg-codi-500/10 flex items-center justify-center mx-auto mb-5 ring-1 ring-codi-500/20">
              <currentStep.icon size={24} className="text-codi-400" />
            </div>
            <h2 className="text-xl font-semibold text-surface-100 mb-2">{currentStep.title}</h2>

            {/* WELCOME */}
            {step === 0 && (
              <div className="space-y-3 mt-6">
                <p className="text-sm text-surface-400">
                  CODI Studio es tu asistente de IA para programacion.
                  Antes de empezar, configuremos algunas cosas.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => { /* start fresh */ }}
                    className="p-4 rounded-xl border border-surface-800 hover:border-codi-500/50 transition-all text-left group"
                  >
                    <FolderOpen size={20} className="text-surface-500 group-hover:text-codi-400 mb-2" />
                    <p className="text-sm font-medium text-surface-200">Empezar limpio</p>
                    <p className="text-xs text-surface-500 mt-1">Configurar desde cero</p>
                  </button>
                  <button
                    className="p-4 rounded-xl border border-surface-800 hover:border-codi-500/50 transition-all text-left group opacity-50 cursor-not-allowed"
                  >
                    <Monitor size={20} className="text-surface-500 mb-2" />
                    <p className="text-sm font-medium text-surface-200">Importar config</p>
                    <p className="text-xs text-surface-500 mt-1">Desde VS Code / Cursor</p>
                  </button>
                </div>
              </div>
            )}

            {/* THEME */}
            {step === 1 && (
              <div className="grid grid-cols-3 gap-2 mt-6 max-h-[300px] overflow-y-auto pr-1">
                {themeRegistry.slice(0, 9).map((theme) => {
                  const isActive = selectedTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-2.5 rounded-xl border-2 transition-all text-left ${
                        isActive
                          ? "border-codi-500 ring-2 ring-codi-500/20"
                          : "border-surface-800 hover:border-surface-700"
                      }`}
                    >
                      <div className="h-8 rounded-md mb-1.5 flex items-end gap-1 p-1" style={{ backgroundColor: theme.colors.editor.bg }}>
                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: theme.colors.accent[500] }} />
                        <div className="w-3 h-1 rounded-sm" style={{ backgroundColor: theme.colors.surface[900] }} />
                      </div>
                      <p className="text-[10px] font-medium text-surface-300 leading-tight truncate">{theme.name}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* CONNECTION */}
            {step === 2 && (
              <div className="space-y-4 mt-6 text-left">
                <div>
                  <label className="block text-xs font-medium text-surface-400 mb-1">URL de la API</label>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://xxx.api.runpod.ai"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-400 mb-1">API Key (opcional)</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Tu API key de RunPod"
                    className="input"
                  />
                </div>
                <button
                  onClick={handleTestConnection}
                  disabled={testing || !apiUrl}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                    testResult === "ok"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : testResult === "error"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-surface-800 text-surface-300 hover:bg-surface-700"
                  }`}
                >
                  {testing ? "Probando..." : testResult === "ok" ? "Conectado" : testResult === "error" ? "Error de conexion" : "Probar conexion"}
                </button>
              </div>
            )}

            {/* READY */}
            {step === 3 && (
              <div className="mt-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"
                >
                  <Check size={32} className="text-emerald-400" />
                </motion.div>
                <p className="text-sm text-surface-300">
                  Todo esta configurado. CODI Studio esta listo para usar.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-surface-900/50 border border-surface-800 text-left">
                  <p className="text-xs text-surface-500">
                    <span className="text-surface-400">Tema:</span> {themeRegistry.find((t) => t.id === selectedTheme)?.name || selectedTheme}
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    <span className="text-surface-400">API:</span> {apiUrl}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-8">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="btn-secondary">
            <ChevronLeft size={14} /> Atras
          </button>
        )}
        <button onClick={handleNext} className="btn-primary flex items-center gap-1">
          {step === STEPS.length - 1 ? (
            <>Abrir CODI Studio <Rocket size={14} /></>
          ) : (
            <>Siguiente <ChevronRight size={14} /></>
          )}
        </button>
      </div>
    </div>
  );
}
