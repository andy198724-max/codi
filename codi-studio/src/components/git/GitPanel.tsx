import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Plus,
  Circle,
  Check,
  X,
  RefreshCw,
  FileCode,
} from "lucide-react";

interface GitChange {
  path: string;
  status: "modified" | "added" | "deleted" | "renamed";
  staged: boolean;
}

export function GitPanel() {
  const [commitMessage, setCommitMessage] = useState("");
  const [changes] = useState<GitChange[]>([]);
  const [branch] = useState("main");

  const statusColors = {
    modified: "text-amber-500",
    added: "text-emerald-500",
    deleted: "text-red-500",
    renamed: "text-blue-500",
  };

  const statusLabels = {
    modified: "M",
    added: "A",
    deleted: "D",
    renamed: "R",
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-surface-950">
      {/* Header */}
      <div className="px-3 py-2 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch size={14} className="text-surface-500" />
            <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
              {branch}
            </span>
          </div>
          <button className="btn-ghost p-1">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Changes */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {changes.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <GitCommit
              size={24}
              className="mx-auto mb-2 text-surface-300 dark:text-surface-700"
            />
            <p className="text-xs text-surface-400">No changes yet</p>
          </div>
        ) : (
          changes.map((change, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-900 cursor-pointer group"
            >
              <span
                className={cn(
                  "text-[10px] font-mono font-bold w-4",
                  statusColors[change.status]
                )}
              >
                {statusLabels[change.status]}
              </span>
              <FileCode size={14} className="text-surface-400 shrink-0" />
              <span className="flex-1 text-xs truncate text-surface-700 dark:text-surface-300">
                {change.path}
              </span>
              <Circle
                size={12}
                className={cn(
                  "shrink-0",
                  change.staged
                    ? "text-emerald-500 fill-emerald-500"
                    : "text-surface-300 dark:text-surface-700"
                )}
              />
            </div>
          ))
        )}
      </div>

      {/* Commit Area */}
      <div className="p-3 border-t border-surface-200 dark:border-surface-800 space-y-2">
        <input
          type="text"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Commit message..."
          className="input text-xs"
        />
        <div className="flex gap-2">
          <button
            disabled={!commitMessage.trim()}
            className="btn-primary text-xs flex-1"
          >
            <GitCommit size={14} />
            Commit
          </button>
          <button className="btn-secondary text-xs">
            <GitPullRequest size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
