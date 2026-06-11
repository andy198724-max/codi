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
          <div className="w-12 h-12 rounded-xl bg-codi-500/10 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-codi-400">C</span>
          </div>
          <h2 className="text-lg font-semibold text-surface-200 mb-2">CODI Studio</h2>
          <p className="text-sm text-surface-500 mb-6 max-w-sm">
            Tu asistente de programacion con IA. Escribe un mensaje para empezar.
          </p>
          <ChatInput onSend={handleSend} isLoading={false} isAgent={mode === "agent"} />
        </div>
        <div className="px-4 py-2 text-center text-xs text-surface-600">
          CODI 34B · LLaVA-NeXT · 4-bit
        </div>
      </div>
    );
  }

  return (
    <div className="panel h-full">
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-surface-500 text-sm p-8">
            Envia un mensaje para comenzar...
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
