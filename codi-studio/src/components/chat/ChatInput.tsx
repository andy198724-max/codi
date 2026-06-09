import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Send,
  Image,
  Paperclip,
  Zap,
  MessageSquare,
} from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onPaste: () => void;
  onImageSelect: () => void;
  disabled?: boolean;
  mode: "chat" | "agent";
  hasImages?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onPaste,
  onImageSelect,
  disabled,
  mode,
  hasImages,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
    }
  }, [value]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files.length) {
        onPaste();
        e.preventDefault();
      }
    };
    const ta = textareaRef.current;
    ta?.addEventListener("paste", handlePaste);
    return () => ta?.removeEventListener("paste", handlePaste);
  }, [onPaste]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onSend();
      }
    },
    [onSend]
  );

  return (
    <div
      className={cn(
        "flex items-end gap-2 p-2 rounded-xl border transition-colors",
        "bg-white dark:bg-surface-900",
        hasImages
          ? "border-codi-400 dark:border-codi-600"
          : "border-surface-200 dark:border-surface-700 focus-within:border-codi-400 dark:focus-within:border-codi-600"
      )}
    >
      {/* Input Area */}
      <div className="flex-1 flex flex-col gap-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "agent"
              ? "Ask CODI to do anything (Ctrl+Enter to send)..."
              : "Ask CODI anything (Ctrl+Enter to send)..."
          }
          rows={1}
          className="w-full resize-none bg-transparent text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 outline-none font-sans leading-relaxed py-1 px-1"
          disabled={disabled}
        />

        {/* Toolbar */}
        <div className="flex items-center gap-1">
          <button
            onClick={onImageSelect}
            className="flex items-center gap-1 px-2 py-1 text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-colors"
            title="Attach Image"
          >
            <Image size={14} />
            Image
          </button>
          <span className="text-xs text-surface-300 dark:text-surface-600">
            Ctrl+Enter to send
          </span>
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={onSend}
        disabled={disabled || (!value.trim() && !hasImages)}
        className={cn(
          "shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-all",
          value.trim() || hasImages
            ? "bg-codi-600 hover:bg-codi-700 text-white shadow-sm shadow-codi-500/20"
            : "bg-surface-100 dark:bg-surface-800 text-surface-400"
        )}
      >
        <Send size={16} />
      </button>
    </div>
  );
}
