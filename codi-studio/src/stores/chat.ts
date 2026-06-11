import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Message, type ContentPart, api } from "@/lib/api";
import { generateId, formatDate } from "@/lib/utils";

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  mode: "chat" | "agent";
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  temperature: number;
  maxTokens: number;

  // Actions
  newConversation: (mode?: "chat" | "agent") => string;
  setActiveConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  sendMessage: (content: string, images?: string[]) => Promise<void>;
  sendStreamMessage: (
    content: string,
    images?: string[],
    onChunk?: (chunk: string) => void
  ) => Promise<void>;
  setTemperature: (temp: number) => void;
  setMaxTokens: (tokens: number) => void;
  setMode: (mode: "chat" | "agent") => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isLoading: false,
      isStreaming: false,
      error: null,
      temperature: 0.7,
      maxTokens: 8192,

      newConversation: (mode = "chat") => {
        const id = generateId();
        const now = formatDate(new Date());
        const conversation: Conversation = {
          id,
          title: "New Chat",
          messages: [
            {
              role: "system",
              content: [
                {
                  type: "text",
                  text: "You are CODI, an advanced AI coding assistant with vision capabilities. You can analyze code, images, and provide expert-level assistance.",
                },
              ],
            },
          ],
          createdAt: now,
          updatedAt: now,
          mode,
        };

        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
        }));

        return id;
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id, error: null });
      },

      deleteConversation: (id) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id);
          const newActive =
            state.activeConversationId === id
              ? filtered[0]?.id || null
              : state.activeConversationId;
          return { conversations: filtered, activeConversationId: newActive };
        });
      },

      addMessage: (message) => {
        set((state) => {
          const conv = state.conversations.find(
            (c) => c.id === state.activeConversationId
          );
          if (!conv) return state;

          conv.messages.push(message);
          conv.updatedAt = formatDate(new Date());

          if (conv.messages.length === 2 && message.role === "user") {
            const textPart = message.content.find(
              (p) => p.type === "text"
            ) as ContentPart & { type: "text" };
            if (textPart) {
              conv.title = textPart.text.slice(0, 50);
            }
          }

          return { conversations: [...state.conversations] };
        });
      },

      updateLastMessage: (content) => {
        set((state) => {
          const conv = state.conversations.find(
            (c) => c.id === state.activeConversationId
          );
          if (!conv) return state;

          const lastMsg = conv.messages[conv.messages.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            lastMsg.content = [{ type: "text", text: content }];
          }

          return { conversations: [...state.conversations] };
        });
      },

      sendMessage: async (content, images = []) => {
        const { activeConversationId, conversations, temperature, maxTokens } =
          get();
        const conv = conversations.find((c) => c.id === activeConversationId);
        if (!conv) return;

        const parts: ContentPart[] = [{ type: "text", text: content }];
        for (const img of images) {
          parts.push({ type: "image_url", image_url: { url: img } });
        }

        const userMsg: Message = { role: "user", content: parts };
        get().addMessage(userMsg);
        set({ isLoading: true, error: null });

        try {
          if (conv.mode === "agent") {
            const { useAgentStore } = await import("@/stores/agent");
            const agentStore = useAgentStore.getState();
            const allMsgs = [...conv.messages, userMsg];

            const assistantMsg: Message = {
              role: "assistant",
              content: [{ type: "text", text: "" }],
            };
            get().addMessage(assistantMsg);

            let fullAgentOutput = "";

            await api.agentRun(allMsgs, agentStore.workspace, (event) => {
              if (event.type === "action") {
                agentStore.addAction({
                  id: `action-${Date.now()}-${event.tool}`,
                  tool: event.tool,
                  params: event.params,
                  status: agentStore.autoApprove ? "approved" : "pending",
                  result: null,
                  timestamp: Date.now(),
                });

                if (agentStore.autoApprove) {
                  setTimeout(() => {
                    agentStore.approveAction(
                      `action-${Date.now()}-${event.tool}`
                    );
                  }, 100);
                }
              } else if (event.type === "result") {
                const lastAction = agentStore.actions[agentStore.actions.length - 1];
                if (lastAction) {
                  agentStore.setActionResult(lastAction.id, event.result);
                }
              } else if (event.type === "done" || event.type === "response") {
                fullAgentOutput = event.message || event.content || "";
                get().updateLastMessage(fullAgentOutput || "TAREA COMPLETADA");
              } else if (event.type === "error") {
                fullAgentOutput = `Error: ${event.message}`;
                get().updateLastMessage(fullAgentOutput);
              } else if (event.type === "status") {
                // status updates - could log to console
              }
            }, { temperature, maxTokens });
          } else {
            const response = await api.chat(conv.messages, {
              temperature,
              maxTokens,
            });

            const assistantMsg: Message = {
              role: "assistant",
              content: [{ type: "text", text: response }],
            };
            get().addMessage(assistantMsg);
          }
        } catch (err) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      sendStreamMessage: async (content, images = [], onChunk) => {
        const { activeConversationId, conversations, temperature, maxTokens } =
          get();
        const conv = conversations.find((c) => c.id === activeConversationId);
        if (!conv) return;

        const parts: ContentPart[] = [{ type: "text", text: content }];
        for (const img of images) {
          parts.push({ type: "image_url", image_url: { url: img } });
        }

        const userMsg: Message = { role: "user", content: parts };
        get().addMessage(userMsg);

        const assistantMsg: Message = {
          role: "assistant",
          content: [{ type: "text", text: "" }],
        };
        get().addMessage(assistantMsg);
        set({ isStreaming: true, error: null });

        try {
          let fullContent = "";
          await api.chatStream(
            conv.messages.slice(0, -1),
            (chunk) => {
              fullContent += chunk;
              get().updateLastMessage(fullContent);
              onChunk?.(chunk);
            },
            { temperature, maxTokens }
          );
        } catch (err) {
          set({
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        } finally {
          set({ isStreaming: false });
        }
      },

      setTemperature: (temperature) => set({ temperature }),
      setMaxTokens: (maxTokens) => set({ maxTokens }),
      setMode: (mode) => {
        set((state) => {
          const conv = state.conversations.find(
            (c) => c.id === state.activeConversationId
          );
          if (conv) conv.mode = mode;
          return { conversations: [...state.conversations] };
        });
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: "codi-chat-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
      }),
    }
  )
);
