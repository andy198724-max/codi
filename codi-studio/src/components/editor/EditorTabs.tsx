import { useState, useCallback } from "react";
import { X, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorTabsProps {
  openTabs: { path: string; isDirty: boolean; isActive: boolean }[];
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function EditorTabs({ openTabs, onSelectTab, onCloseTab, onReorder }: EditorTabsProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex) {
      onReorder(dragIndex, toIndex);
    }
    setDragIndex(null);
  };

  if (openTabs.length === 0) return null;

  return (
    <div className="flex items-center bg-surface-925 border-b border-surface-850 overflow-x-auto shrink-0">
      {openTabs.map((tab, i) => {
        const name = tab.path.split("\\").pop() || tab.path;
        return (
          <div
            key={tab.path}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            onDragEnd={() => setDragIndex(null)}
            onClick={() => onSelectTab(tab.path)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs border-r border-surface-850 transition-colors shrink-0 max-w-[180px] cursor-pointer group select-none",
              tab.isActive
                ? "bg-surface-900 text-surface-200 border-t-2 border-t-codi-500"
                : "text-surface-500 hover:bg-surface-900/50",
              dragIndex === i && "opacity-50"
            )}
          >
            <span className="truncate flex-1">{name}</span>
            {tab.isDirty && <Circle size={8} className="text-amber-400 fill-amber-400 shrink-0" />}
            <span
              onClick={(e) => { e.stopPropagation(); onCloseTab(tab.path); }}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 rounded p-0.5 ml-1 shrink-0"
            >
              <X size={10} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function Breadcrumbs({ path }: { path: string | null }) {
  if (!path) return null;
  const parts = path.replace(/\\/g, "/").split("/").filter(Boolean);
  return (
    <div className="flex items-center px-2 py-0.5 text-xxs text-surface-500 bg-surface-925 border-b border-surface-850 shrink-0 overflow-x-auto">
      {parts.map((part, i) => (
        <span key={i} className="flex items-center">
          {i > 0 && <span className="mx-1 text-surface-700">&gt;</span>}
          <span className={i === parts.length - 1 ? "text-surface-300" : "hover:text-surface-400 cursor-pointer"}>
            {part}
          </span>
        </span>
      ))}
    </div>
  );
}
