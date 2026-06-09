import { useMemo } from "react";
import { diffChars, diffLines, diffWords } from "diff";
import { cn } from "@/lib/utils";

interface DiffViewProps {
  original: string;
  modified: string;
  language?: string;
  mode?: "lines" | "words" | "chars";
}

export function DiffView({
  original,
  modified,
  mode = "lines",
}: DiffViewProps) {
  const changes = useMemo(() => {
    switch (mode) {
      case "chars":
        return diffChars(original, modified);
      case "words":
        return diffWords(original, modified);
      default:
        return diffLines(original, modified);
    }
  }, [original, modified, mode]);

  return (
    <div className="font-mono text-xs leading-5 border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-2 bg-surface-100 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-500/80" />
          <span className="text-xs text-surface-500">Original</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500/80" />
          <span className="text-xs text-surface-500">Modified</span>
        </span>
      </div>

      {/* Diff Content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {changes.map((part, i) => {
              const lines = part.value.split("\n");
              const hasTrailingNewline = part.value.endsWith("\n");
              const lineCount = hasTrailingNewline ? lines.length - 1 : lines.length;

              return Array.from({ length: lineCount }).map((_, lineIdx) => {
                const line = lines[lineIdx];
                return (
                  <tr
                    key={`${i}-${lineIdx}`}
                    className={cn(
                      part.added && "bg-emerald-50 dark:bg-emerald-950/30",
                      part.removed && "bg-red-50 dark:bg-red-950/30"
                    )}
                  >
                    <td className="w-12 px-2 text-right text-surface-400 select-none border-r border-surface-200 dark:border-surface-800">
                      {lineIdx + 1}
                    </td>
                    <td className="px-4 whitespace-pre text-surface-800 dark:text-surface-200">
                      {line}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
