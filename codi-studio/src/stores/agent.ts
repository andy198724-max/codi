import { create } from "zustand";
import { generateId } from "@/lib/utils";
import { api } from "@/lib/api";

export type AgentActionType =
  | "read"
  | "write"
  | "delete"
  | "rename"
  | "command"
  | "search";

export type AgentActionStatus =
  | "pending"
  | "approved"
  | "executing"
  | "done"
  | "error";

export interface AgentAction {
  id: string;
  type?: AgentActionType;
  tool?: string;
  params?: Record<string, any>;
  result?: Record<string, any> | null;
  description?: string;
  path?: string;
  content?: string;
  status: AgentActionStatus;
  timestamp: number;
}

interface AgentState {
  actions: AgentAction[];
  autoApprove: boolean;
  isExecuting: boolean;
  workspace: string;

  addAction: (action: Omit<AgentAction, "id" | "status" | "timestamp">) => string;
  updateAction: (id: string, updates: Partial<AgentAction>) => void;
  approveAction: (id: string) => void;
  denyAction: (id: string) => void;
  setAutoApprove: (value: boolean) => void;
  clearActions: () => void;
  executeAction: (action: AgentAction) => Promise<void>;
}

async function executeAgentAction(action: AgentAction): Promise<string> {
  switch (action.type) {
    case "read": {
      if (!action.path) throw new Error("No path specified");
      return await api.readFile(action.path);
    }
    case "write": {
      if (!action.path || action.content === undefined) throw new Error("No path or content specified");
      await api.writeFile(action.path, action.content);
      return `Written to ${action.path}`;
    }
    case "command": {
      if (!action.content) throw new Error("No command specified");
      const result = await api.chat(
        [{ role: "user", content: [{ type: "text", text: `Execute command and return output: ${action.content}` }] }],
        { temperature: 0.1, maxTokens: 1024 }
      );
      return result;
    }
    case "search": {
      if (!action.content) throw new Error("No search query specified");
      return await api.chat(
        [{ role: "user", content: [{ type: "text", text: `Search for: ${action.content}` }] }],
        { temperature: 0.1, maxTokens: 1024 }
      );
    }
    default:
      return `Action ${action.type} completed`;
  }
}

export const useAgentStore = create<AgentState>((set, get) => ({
  actions: [],
  autoApprove: false,
  isExecuting: false,
  workspace: "",

  addAction: (action: Partial<AgentAction> & { id?: string }) => {
    const id = action.id || generateId();
    const newAction: AgentAction = {
      ...action,
      id,
      status: action.status || "pending",
      timestamp: Date.now(),
    };

    set((state) => ({
      actions: [...state.actions, newAction],
      isExecuting: true,
    }));

    if (get().autoApprove) {
      setTimeout(() => get().approveAction(id), 100);
    }

    return id;
  },

  updateAction: (id, updates) => {
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
  },

  approveAction: (id) => {
    const action = get().actions.find((a) => a.id === id);
    if (!action) return;

    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === id ? { ...a, status: "executing" } : a
      ),
    }));

    get().executeAction(action);
  },

  executeAction: async (action) => {
    try {
      const result = await executeAgentAction(action);
      set((state) => ({
        actions: state.actions.map((a) =>
          a.id === action.id ? { ...a, status: "done", content: result } : a
        ),
        isExecuting: state.actions.some(
          (a) => a.status === "executing" || a.status === "pending"
        ),
      }));
    } catch (err: any) {
      set((state) => ({
        actions: state.actions.map((a) =>
          a.id === action.id ? { ...a, status: "error", content: err.message } : a
        ),
        isExecuting: state.actions.some(
          (a) => a.status === "executing" || a.status === "pending"
        ),
      }));
    }
  },

  denyAction: (id) => {
    set((state) => ({
      actions: state.actions.filter((a) => a.id !== id),
      isExecuting: state.actions.some(
        (a) => a.id !== id && (a.status === "executing" || a.status === "pending")
      ),
    }));
  },

  setAutoApprove: (autoApprove) => set({ autoApprove }),
  clearActions: () => set({ actions: [], isExecuting: false }),
  setActionResult: (id: string, result: Record<string, any> | null) => {
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === id ? { ...a, result, status: result?.success ? "done" as const : "error" as const } : a
      ),
    }));
  },
}));
