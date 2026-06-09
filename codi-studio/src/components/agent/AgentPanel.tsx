import { useState, useCallback } from "react";
import { useChatStore } from "@/stores/chat";
import { cn } from "@/lib/utils";
import {
  Bot,
  Shield,
  ShieldCheck,
  FileCode,
  FolderOpen,
  Terminal,
  AlertTriangle,
} from "lucide-react";

interface AgentAction {
  type: "read" | "write" | "delete" | "rename" | "command" | "search";
  description: string;
  path?: string;
  status: "pending" | "approved" | "executing" | "done" | "error";
}

export function AgentPanel() {
  const [autoApprove, setAutoApprove] = useState(false);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const mode = useChatStore((s) =>
    s.conversations.find((c) => c.id === s.activeConversationId)?.mode
  );

  const isAgent = mode === "agent";

  if (!isAgent) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-surface-950 border-r border-surface-200 dark:border-surface-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={16} className="text-codi-500" />
          <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
            Agent Mode
          </span>
        </div>
        <label className="flex items-center gap-2 text-xs text-surface-500 cursor-pointer">
          <input
            type="checkbox"
            checked={autoApprove}
            onChange={(e) => setAutoApprove(e.target.checked)}
            className="rounded border-surface-300 text-codi-600 focus:ring-codi-500"
          />
          Auto-approve actions
        </label>
      </div>

      {/* Actions */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {actions.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <Shield size={24} className="mx-auto mb-2 text-surface-300 dark:text-surface-700" />
            <p className="text-xs text-surface-400">
              Agent actions will appear here
            </p>
            <p className="text-xs text-surface-500 mt-1">
              CODI will ask before modifying files
            </p>
          </div>
        ) : (
          actions.map((action, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 space-y-2"
            >
              <div className="flex items-start gap-2">
                <ActionIcon type={action.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-surface-700 dark:text-surface-300">
                    {action.description}
                  </p>
                  {action.path && (
                    <p className="text-[10px] text-surface-400 truncate mt-0.5 font-mono">
                      {action.path}
                    </p>
                  )}
                </div>
                <ActionStatus status={action.status} />
              </div>

              {action.status === "pending" && (
                <div className="flex gap-2 pt-1">
                  <button className="btn-primary text-[10px] px-3 py-1">
                    Approve
                  </button>
                  <button className="btn-secondary text-[10px] px-3 py-1">
                    Deny
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ActionIcon({ type }: { type: AgentAction["type"] }) {
  const icons = {
    read: FileCode,
    write: FileCode,
    delete: AlertTriangle,
    rename: FolderOpen,
    command: Terminal,
    search: FolderOpen,
  };
  const Icon = icons[type];
  return <Icon size={16} className="text-surface-500 mt-0.5" />;
}

function ActionStatus({ status }: { status: AgentAction["status"] }) {
  const styles = {
    pending: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
    approved: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
    executing: "text-codi-500 bg-codi-50 dark:bg-codi-950/30",
    done: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    error: "text-red-500 bg-red-50 dark:bg-red-950/30",
  };

  return (
    <span
      className={cn(
        "text-[10px] font-medium px-1.5 py-0.5 rounded",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}
