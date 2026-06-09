import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { type FileEntry, api } from "@/lib/api";

interface ProjectState {
  rootPath: string | null;
  files: FileEntry[];
  selectedFilePath: string | null;
  fileContent: string | null;
  isDirty: boolean;
  isLoading: boolean;

  openProject: (path: string) => Promise<void>;
  navigateTo: (path: string) => Promise<void>;
  selectFile: (path: string) => Promise<void>;
  saveFile: (content: string) => Promise<void>;
  createFile: (path: string, content?: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  rootPath: null,
  files: [],
  selectedFilePath: null,
  fileContent: null,
  isDirty: false,
  isLoading: false,

  openProject: async (path: string) => {
    set({ rootPath: path, isLoading: true });
    try {
      const files = await api.listDirectory(path);
      set({ files, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  navigateTo: async (path: string) => {
    set({ isLoading: true });
    try {
      const files = await api.listDirectory(path);
      set({ files, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  selectFile: async (path: string) => {
    set({ selectedFilePath: path, isLoading: true });
    try {
      const content = await api.readFile(path);
      set({ fileContent: content, isDirty: false, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  saveFile: async (content: string) => {
    const { selectedFilePath } = get();
    if (!selectedFilePath) return;
    await api.writeFile(selectedFilePath, content);
    set({ fileContent: content, isDirty: false });
  },

  createFile: async (path: string, content = "") => {
    await api.writeFile(path, content);
    const { rootPath } = get();
    if (rootPath) {
      const files = await api.listDirectory(rootPath);
      set({ files });
    }
  },

  deleteFile: async (path: string) => {
    await invoke("delete_file", { path });
    const { rootPath } = get();
    if (rootPath) {
      const files = await api.listDirectory(rootPath);
      set({ files });
    }
  },

  renameFile: async (oldPath: string, newPath: string) => {
    await invoke("rename_file", { oldPath, newPath });
    const { rootPath } = get();
    if (rootPath) {
      const files = await api.listDirectory(rootPath);
      set({ files });
    }
  },
}));
