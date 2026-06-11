import { useAgentStore } from "@/stores/agent";
import { X, Check, Loader2, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Props {
  onClose: () => void;
}

const toolIcons: Record<string, string> = {
  create_folder: "\ud83d\udcc1",
  write_file: "\u270f\ufe0f",
  read_file: "\ud83d\udcc4",
  list_directory: "\ud83d\udcc2",
  delete_file: "\ud83d\uddd1\ufe0f",
  run_command: "\u26a1",
  check_port: "\ud83d\udd0c",
  init_project: "\ud83d\ude80",
  install_deps: "\ud83d\udce6",
  start_server: "\u25b6\ufe0f",
};

const statusStyles: Record<string, string> = {
  pending: "text-surface-500",
  approved: "text-codi-400",
  executing: "text-blue-400 animate-pulse",
  done: "text-emerald-400",
  error: "text-red-400",
};

export function AgentTimeline({ onClose }: Props) {
  const actions = useAgentStore((s) => s.actions);
  const clearActions = useAgentStore((s) => s.clearActions);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (actions.length === 0) {
    return (
      <div className="panel border-t border-surface-850">
        <div className="panel-header">
          <span>Linea de Tiempo</span>
          <button onClick={onClose} className="btn-ghost p-0.5">
            <X size={12} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-surface-500 text-xs p-4">
          Sin acciones aun. Envia una tarea en Modo Agente para ver la linea de tiempo.
        </div>
      </div>
    );
  }

  return (
    <div className="panel border-t border-surface-850 animate-fade-in">
      <div className="panel-header shrink-0">
        <div className="flex items-center gap-2">
          <span>Linea de Tiempo</span>
          <span className="text-surface-600 text-xxs bg-surface-800 px-1.5 py-0.5 rounded">
            {actions.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearActions} className="btn-ghost text-xxs p-0.5 px-1.5" title="Limpiar todo">
            Limpiar
          </button>
          <button onClick={onClose} className="btn-ghost p-0.5">
            <X size={12} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {actions.map((action) => {
          const isExpanded = expanded[action.id] || false;
          return (
            <div key={action.id} className="rounded bg-surface-900/50 overflow-hidden">
              <button
                onClick={() => setExpanded((p) => ({ ...p, [action.id]: !isExpanded }))}
                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-surface-800/50 transition-colors text-left"
              >
                <span className="shrink-0">
                  {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                </span>
                <span className="text-xs">{toolIcons[action.tool] || "\ud83d\udd27"}</span>
                <span className="text-xs text-surface-300 truncate flex-1">{action.tool}</span>
                <span className={statusStyles[action.status] + " text-xxs"}>
                  {action.status === "done" && <Check size={10} className="inline" />}
                  {action.status === "executing" && <Loader2 size={10} className="inline animate-spin" />}
                  {action.status === "error" && <AlertCircle size={10} className="inline" />}
                  {action.status === "pending" && "\u23f3"}
                </span>
              </button>
              {isExpanded && (
                <div className="px-4 py-1.5 border-t border-surface-850/50 text-xs text-surface-400 space-y-1">
                  <div>
                    <span className="text-surface-600">params: </span>
                    <code className="text-surface-300">{JSON.stringify(action.params)}</code>
                  </div>
                  {action.result && (
                    <div>
                      <span className="text-surface-600">resultado: </span>
                      <code className={action.result.success ? "text-emerald-400" : "text-red-400"}>
                        {JSON.stringify(action.result).slice(0, 200)}
                      </code>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
