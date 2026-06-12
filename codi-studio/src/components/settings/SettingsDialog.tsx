import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useChatStore } from "@/stores/chat";
import { cn } from "@/lib/utils";
import {
  X,
  Settings,
  Sliders,
  Palette,
  Wifi,
  Info,
  Check,
  Cloud,
} from "lucide-react";
import { themes, applyTheme } from "@/lib/themes";

interface SettingsDialogProps {
  onClose: () => void;
}

type SettingsTab = "model" | "appearance" | "connection" | "storage" | "about";

export function SettingsDialog({ onClose }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("model");
  const temperature = useChatStore((s) => s.temperature);
  const maxTokens = useChatStore((s) => s.maxTokens);
  const setTemperature = useChatStore((s) => s.setTemperature);
  const setMaxTokens = useChatStore((s) => s.setMaxTokens);
  const [apiUrl, setApiUrl] = useState("https://7zya4zzok7kirr.api.runpod.ai");
  const [saved, setSaved] = useState(false);

  const [r2Enabled, setR2Enabled] = useState(false);
  const [r2AccountId, setR2AccountId] = useState("");
  const [r2AccessKey, setR2AccessKey] = useState("");
  const [r2SecretKey, setR2SecretKey] = useState("");
  const [r2Bucket, setR2Bucket] = useState("codi-models");
  const [r2ModelPath, setR2ModelPath] = useState("llava-v1.6-34b-hf");

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "model", label: "Modelo", icon: Sliders },
    { id: "appearance", label: "Apariencia", icon: Palette },
    { id: "connection", label: "Conexion", icon: Wifi },
    { id: "storage", label: "Almacenamiento", icon: Cloud },
    { id: "about", label: "Acerca de", icon: Info },
  ];

  const handleSaveConnection = async () => {
    try {
      await invoke("set_api_url", { url: apiUrl });
    } catch (e) {
      console.error("Failed to set API URL:", e);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveR2 = async () => {
    try {
      await invoke("set_r2_config", {
        config: {
          enabled: r2Enabled,
          account_id: r2AccountId,
          access_key_id: r2AccessKey,
          secret_access_key: r2SecretKey,
          bucket: r2Bucket,
          model_path: r2ModelPath,
        },
      });
    } catch (e) {
      console.error("Failed to save R2 config:", e);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[560px] max-h-[600px] bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-surface-500" />
            <h2 className="font-semibold text-surface-900 dark:text-surface-100">
              Configuracion
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <X size={18} className="text-surface-400" />
          </button>
        </div>

        <div className="flex h-[400px]">
          {/* Sidebar */}
          <div className="w-36 p-3 border-r border-surface-200 dark:border-surface-800 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                  activeTab === tab.id
                    ? "bg-codi-100 dark:bg-codi-950/50 text-codi-700 dark:text-codi-300"
                    : "text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "model" && (
              <div className="space-y-6">
                <div className="p-3 bg-surface-50 dark:bg-surface-950 rounded-lg mb-4">
                  <p className="text-xs text-surface-500">
                    Modelo activo: <strong>codi-llava</strong> (LLaVA-1.6 34B)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Temperature: {temperature.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-codi-600"
                  />
                  <p className="text-xs text-surface-400 mt-1">
                    Menor = mas determinista, mayor = mas creativo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Max Tokens: {maxTokens}
                  </label>
                  <input
                    type="range"
                    min="1024"
                    max="32768"
                    step="1024"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full accent-codi-600"
                  />
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Tema
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(themes).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => applyTheme(theme.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        localStorage.getItem("codi_theme") === theme.id || (!localStorage.getItem("codi_theme") && theme.id === "codi-dark")
                          ? "border-codi-500 ring-2 ring-codi-500/20"
                          : "border-surface-800 hover:border-surface-700"
                      }`}
                    >
                      <div className="h-10 rounded-md mb-2 flex items-end gap-1 p-1" style={{ backgroundColor: theme.bg }}>
                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: theme.primary }} />
                        <div className="w-4 h-1 rounded-sm" style={{ backgroundColor: theme.surface }} />
                      </div>
                      <p className="text-[10px] font-medium text-surface-300 leading-tight">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "connection" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    URL de la API
                  </label>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="input"
                    placeholder="https://7zya4zzok7kirr.api.runpod.ai"
                  />
                  <p className="text-xs text-surface-400 mt-1">
                    Direccion del servidor CODI Core
                  </p>
                </div>
                <button onClick={handleSaveConnection} className="btn-primary">
                  {saved ? (
                    <>
                      <Check size={14} />
                      Guardado
                    </>
                  ) : (
                    "Guardar conexion"
                  )}
                </button>
              </div>
            )}

            {activeTab === "storage" && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-surface-900 dark:text-surface-100">
                  Almacenamiento Cloudflare R2
                </h3>
                <p className="text-xs text-surface-400">
                  Almacena el modelo LLaVA en Cloudflare R2 en vez de localmente.
                  Requiere credenciales R2 de tu panel de Cloudflare.
                </p>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={r2Enabled}
                    onChange={(e) => setR2Enabled(e.target.checked)}
                    className="rounded border-surface-300"
                  />
                  <span className="text-sm text-surface-700 dark:text-surface-300">
                    Habilitar R2
                  </span>
                </label>

                {r2Enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">
                        ID de cuenta
                      </label>
                      <input
                        type="text"
                        value={r2AccountId}
                        onChange={(e) => setR2AccountId(e.target.value)}
                        className="input w-full text-xs"
                        placeholder="ID de cuenta Cloudflare R2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">
                        ID de clave de acceso
                      </label>
                      <input
                        type="text"
                        value={r2AccessKey}
                        onChange={(e) => setR2AccessKey(e.target.value)}
                        className="input w-full text-xs"
                        placeholder="ID de clave de acceso R2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">
                        Clave de acceso secreta
                      </label>
                      <input
                        type="password"
                        value={r2SecretKey}
                        onChange={(e) => setR2SecretKey(e.target.value)}
                        className="input w-full text-xs"
                        placeholder="Clave de acceso secreta R2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">
                          Bucket
                        </label>
                        <input
                          type="text"
                          value={r2Bucket}
                          onChange={(e) => setR2Bucket(e.target.value)}
                          className="input w-full text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">
                          Ruta del modelo
                        </label>
                        <input
                          type="text"
                          value={r2ModelPath}
                          onChange={(e) => setR2ModelPath(e.target.value)}
                          className="input w-full text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={handleSaveR2} className="btn-primary">
                  {saved ? (
                    <>
                      <Check size={14} />
                      Guardado
                    </>
                  ) : (
                    "Guardar configuracion R2"
                  )}
                </button>
              </div>
            )}

            {activeTab === "about" && (
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-medium text-surface-900 dark:text-surface-100">
                    CODI Studio
                  </h3>
                  <p className="text-surface-400 text-xs mt-1">Version 1.0.0</p>
                </div>
                <div className="p-3 bg-surface-50 dark:bg-surface-950 rounded-lg">
                  <p className="text-xs text-surface-500">
                    CODI es un asistente de IA para programacion con capacidades de vision
                    impulsado por LLaVA-1.6 34B. Construido con Tauri, React y TypeScript.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
