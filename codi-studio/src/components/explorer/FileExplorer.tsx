import { useState, useCallback } from "react";
import { useProjectStore } from "@/stores/project";
import { cn, formatFileSize } from "@/lib/utils";
import type { FileEntry } from "@/lib/api";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Image,
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  RefreshCw,
  FileJson,
  Terminal,
  Globe,
} from "lucide-react";

interface FileExplorerProps {
  width: number;
  onResize: (width: number) => void;
}

export function FileExplorer({ width, onResize }: FileExplorerProps) {
  const rootPath = useProjectStore((s) => s.rootPath);
  const files = useProjectStore((s) => s.files);
  const selectedFilePath = useProjectStore((s) => s.selectedFilePath);
  const isLoading = useProjectStore((s) => s.isLoading);
  const openProject = useProjectStore((s) => s.openProject);
  const navigateTo = useProjectStore((s) => s.navigateTo);
  const selectFile = useProjectStore((s) => s.selectFile);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [newItemInput, setNewItemInput] = useState<{
    path: string;
    type: "file" | "folder";
  } | null>(null);

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
    navigateTo(path);
  };

  const handleFileClick = (entry: FileEntry) => {
    if (entry.is_dir) {
      toggleDir(entry.path);
    } else {
      selectFile(entry.path);
    }
  };

  const handleOpenProject = async () => {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({ directory: true });
    if (selected) {
      await openProject(selected);
    }
  };

  const isSelected = (entry: FileEntry) => entry.path === selectedFilePath;
  const isExpanded = (path: string) => expandedDirs.has(path);

  const getFileIcon = (entry: FileEntry) => {
    if (entry.is_dir) {
      return isExpanded(entry.path) ? (
        <FolderOpen size={16} className="text-amber-500" />
      ) : (
        <Folder size={16} className="text-amber-400" />
      );
    }

    const ext = entry.name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "ts":
      case "tsx":
        return <FileCode size={16} className="text-codi-500" />;
      case "js":
      case "jsx":
        return <FileCode size={16} className="text-yellow-500" />;
      case "json":
        return <FileJson size={16} className="text-green-500" />;
      case "rs":
        return <FileCode size={16} className="text-purple-500" />;
      case "py":
        return <FileCode size={16} className="text-blue-500" />;
      case "html":
        return <Globe size={16} className="text-orange-500" />;
      case "css":
      case "scss":
        return <FileCode size={16} className="text-pink-500" />;
      case "md":
        return <FileText size={16} className="text-surface-500" />;
      case "png":
      case "jpg":
      case "svg":
        return <Image size={16} className="text-rose-500" />;
      case "sh":
      case "bat":
        return <Terminal size={16} className="text-surface-500" />;
      default:
        return <FileText size={16} className="text-surface-400" />;
    }
  };

  return (
    <div
      className="flex flex-col bg-surface-925 select-none"
      style={{ width }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-surface-850">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
            Explorador
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleOpenProject}
              className="btn-ghost p-1"
              title="Abrir Carpeta"
            >
              <FolderOpen size={14} />
            </button>
              <button className="btn-ghost p-1" title="Nuevo archivo">
              <Plus size={14} />
            </button>
              <button className="btn-ghost p-1" title="Refrescar">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
        {rootPath && (
          <div className="text-xs text-surface-400 truncate" title={rootPath}>
            {rootPath.split("\\").pop()}
          </div>
        )}
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {!rootPath ? (
          <div className="px-4 py-12 text-center">
            <Folder size={32} className="mx-auto mb-3 text-surface-600" />
            <p className="text-sm text-surface-400 mb-1">Sin carpeta abierta</p>
            <p className="text-xs text-surface-600 mb-4">Abre un proyecto para explorar archivos</p>
            <button onClick={handleOpenProject} className="btn-primary text-xs">
              Abrir Carpeta
            </button>
          </div>
        ) : isLoading ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-surface-400">Cargando...</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {files.map((entry) => (
              <FileTreeItem
                key={entry.path}
                entry={entry}
                selected={isSelected(entry)}
                expanded={isExpanded(entry.path)}
                onClick={() => handleFileClick(entry)}
                icon={getFileIcon(entry)}
                depth={0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-codi-500/50 transition-colors"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startWidth = width;
          const handleMouseMove = (e: MouseEvent) => {
            const newWidth = Math.max(180, Math.min(600, startWidth + e.clientX - startX));
            onResize(newWidth);
          };
          const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
          };
          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }}
      />
    </div>
  );
}

function FileTreeItem({
  entry,
  selected,
  expanded,
  onClick,
  icon,
  depth,
}: {
  entry: FileEntry;
  selected: boolean;
  expanded: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  depth: number;
}) {
  return (
    <div>
      <div
        onClick={onClick}
        className={cn(
          "flex items-center gap-1 px-2 py-1 mx-1 rounded-md cursor-pointer text-xs transition-colors group",
          selected
            ? "bg-codi-100 dark:bg-codi-950/50 text-codi-700 dark:text-codi-300"
            : "hover:bg-surface-100 dark:hover:bg-surface-900 text-surface-700 dark:text-surface-300",
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {icon}
        <span className="flex-1 truncate">{entry.name}</span>
        {!entry.is_dir && (
          <span className="text-[10px] text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatFileSize(entry.size)}
          </span>
        )}
      </div>
    </div>
  );
}
