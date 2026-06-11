import { useState, useRef, useEffect } from "react";
import { Send, Image, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (content: string, images: string[]) => void;
  isLoading: boolean;
  isAgent: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, isAgent, placeholder }: Props) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && images.length === 0) return;
    if (isLoading) return;
    onSend(trimmed || "Analiza esta imagen", images);
    setText("");
    setImages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => setImages((p) => [...p, reader.result as string]);
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleImagePick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => setImages((p) => [...p, reader.result as string]);
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const showImageZone = images.length > 0;

  return (
    <div className={cn("p-3", showImageZone && "bg-codi-500/5 rounded-t-lg")}>
      {images.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <div key={i} className="relative shrink-0 group">
              <img src={img} alt="" className="h-16 w-16 object-cover rounded border border-surface-850" />
              <button
                onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xxs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={cn(
        "flex items-end gap-2 rounded-lg border transition-colors duration-150 px-3 py-2",
        showImageZone ? "border-codi-500/40 bg-surface-900/50" : "border-surface-850 bg-surface-900/30",
        "focus-within:border-codi-500/50 focus-within:bg-surface-900/60"
      )}>
        <div className="flex gap-1 items-center mb-1.5">
          <button onClick={handleImagePick} className="btn-ghost p-1" title="Add image (Ctrl+V to paste)">
            <Image size={15} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder || (isAgent ? "Describe la tarea a ejecutar..." : "Escribe un mensaje...  / para comandos  @ para archivos")}
          rows={1}
          className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-surface-100 placeholder:text-surface-600 py-1.5 font-sans"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() && images.length === 0}
          className={cn(
            "shrink-0 p-1.5 rounded transition-all duration-150 mb-0.5",
            (text.trim() || images.length > 0) && !isLoading
              ? "bg-codi-500 text-white hover:bg-codi-400"
              : "bg-surface-800 text-surface-600"
          )}
        >
          <Send size={14} />
        </button>
      </div>
      <div className="flex items-center gap-3 mt-1.5 px-1">
        <span className="text-xxs text-surface-600">
          {isAgent ? "Agent" : "Chat"} · Ctrl+Enter enviar · Shift+Enter nueva linea
        </span>
        <span className="text-xxs text-surface-700 ml-auto">CODI 34B</span>
      </div>
    </div>
  );
}
