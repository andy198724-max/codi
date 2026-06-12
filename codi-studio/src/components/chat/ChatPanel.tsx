import { useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Loader2 } from "lucide-react";

export function ChatPanel() {
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeConversationId);
  const isLoading = useChatStore((s) => s.isLoading);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const error = useChatStore((s) => s.error);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const newConversation = useChatStore((s) => s.newConversation);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conv = conversations.find((c) => c.id === activeId);
  const mode = conv?.mode || "chat";
  const messages = conv?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = (content: string, images: string[]) => {
    if (!activeId) {
      newConversation(mode);
      setTimeout(() => sendMessage(content, images), 100);
      return;
    }
    sendMessage(content, images);
  };

  if (!activeId) {
    return (
      <div className="panel h-full">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="flex items-center gap-3 mb-5">
            <img src="/codi-logo.svg" alt="Codi" className="w-12 h-12" />
            <h2 className="text-2xl font-bold text-surface-100 tracking-tight">Codi</h2>
          </div>
          <p className="text-sm text-surface-500 mb-8 max-w-xs leading-relaxed">
            Asistente de IA para programacion. Escribe, sube imagenes o activa el modo agente.
          </p>
          <ChatInput onSend={handleSend} isLoading={false} isAgent={mode === "agent"} />
        </div>
      </div>
    );
  }

  return (
    <div className="panel h-full">
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-surface-600 text-sm p-8">
            Envia un mensaje para comenzar
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {(isLoading || isStreaming) && (
          <div className="px-4 py-3 flex gap-3">
            <div className="w-6 h-6 rounded bg-codi-500/20 flex items-center justify-center shrink-0">
              <Loader2 size={13} className="text-codi-400 animate-spin" />
            </div>
            <div className="flex gap-1 items-center py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-codi-400 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-codi-400 animate-pulse" style={{ animationDelay: "0.15s" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-codi-400 animate-pulse" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="px-4 py-2 mx-3 mb-1 rounded text-xs bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}
      <ChatInput
        onSend={handleSend}
        isLoading={isLoading}
        isAgent={mode === "agent"}
      />
    </div>
  );
}
