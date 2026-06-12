import { useState, useEffect, useRef } from "react";
import { Search, FileText } from "lucide-react";
import { useProjectStore } from "@/stores/project";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickOpen({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const files = useProjectStore((s) => s.files);
  const selectFile = useProjectStore((s) => s.selectFile);

  useEffect(() => {
    if (isOpen) { setQuery(""); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [isOpen]);

  const filtered = query
    ? files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()) || f.path.toLowerCase().includes(query.toLowerCase()))
    : files;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) { selectFile(filtered[selectedIndex].path); onClose(); }
    }
    else if (e.key === "Escape") { onClose(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="w-[500px] bg-surface-900 border border-surface-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-surface-800">
          <Search size={14} className="text-surface-500 shrink-0" />
          <input ref={inputRef} type="text" value={query} onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown} placeholder="Buscar archivo..."
            className="flex-1 bg-transparent border-0 outline-none text-sm text-surface-200 placeholder:text-surface-600" />
        </div>
        <div className="max-h-[260px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="text-center text-surface-500 text-sm py-6">Sin resultados</p>
          ) : (
            filtered.slice(0, 30).map((file, i) => (
              <button key={file.path}
                onClick={() => { selectFile(file.path); onClose(); }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors",
                  i === selectedIndex ? "bg-surface-800" : "hover:bg-surface-800/50")}>
                <FileText size={13} className={cn("shrink-0", file.path.endsWith(".tsx") || file.path.endsWith(".ts") ? "text-codi-400" : "text-surface-500")} />
                <span className="text-surface-300 truncate">{file.name}</span>
                <span className="text-surface-600 text-[10px] ml-auto truncate">{file.path}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
