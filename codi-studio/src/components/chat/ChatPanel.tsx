import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore } from "@/stores/chat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, Bot } from "lucide-react";

export function ChatPanel() {
  const [input, setInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const conversations = useChatStore((s) => s.conversations);
  const isLoading = useChatStore((s) => s.isLoading);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const error = useChatStore((s) => s.error);
  const sendStreamMessage = useChatStore((s) => s.sendStreamMessage);
  const newConversation = useChatStore((s) => s.newConversation);
  const clearError = useChatStore((s) => s.clearError);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConv?.messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() && images.length === 0) return;
    const msg = input.trim() || "Analyze this image";
    const imgs = [...images];
    setInput("");
    setImages([]);

    if (!activeConversationId) {
      newConversation();
    }

    await sendStreamMessage(msg, imgs);
  }, [input, images, activeConversationId, sendStreamMessage, newConversation]);

  const handlePaste = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = () => {
              setImages((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    } catch {}
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => {
            setImages((prev) => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        }
      }
    },
    []
  );

  const messages = activeConv?.messages.filter((m) => m.role !== "system") || [];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-surface-950">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-800 flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-codi-600 flex items-center justify-center">
          <Bot size={14} className="text-white" />
        </div>
        <span className="font-medium text-sm text-surface-900 dark:text-surface-100">
          {activeConv?.mode === "agent" ? "Agent Mode" : "Chat"}
        </span>
        {activeConv?.mode && (
          <span className="ml-auto text-xs text-surface-400">
            {activeConv.mode === "agent" ? "Modo agente" : "Modo chat"}
          </span>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {!activeConv || messages.length === 0 ? (
          <EmptyState onNewChat={() => newConversation()} />
        ) : (
          <div className="py-4 space-y-1">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isLoading && !isStreaming && (
              <div className="px-6 py-4 flex items-center gap-2 text-surface-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Images Preview */}
        {images.length > 0 && (
          <div className="px-6 pb-2 flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img}
                  alt={`Image ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-surface-200 dark:border-surface-700"
                />
                <button
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-surface-200 dark:border-surface-800">
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onPaste={handlePaste}
          onImageSelect={() => fileInputRef.current?.click()}
          disabled={isLoading || isStreaming}
          mode={activeConv?.mode || "chat"}
          hasImages={images.length > 0}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}
