import { useState, useRef } from "react";
import type { Message, ContentPart } from "@/lib/api";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Bot, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState<string | null>(null);
  const codeBlockRefs = useRef<Map<number, string>>(new Map());

  const getText = () => {
    return message.content
      .filter((p): p is ContentPart & { type: "text" } => p.type === "text")
      .map((p) => p.text)
      .join("");
  };

  const getImages = () => {
    return message.content.filter(
      (p): p is ContentPart & { type: "image_url" } => p.type === "image_url"
    );
  };

  const text = getText();
  const images = getImages();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!text && images.length === 0) return null;

  return (
    <div className={cn("px-4 py-3", isUser ? "bg-surface-925/50" : "")}>
      <div className="flex gap-3 max-w-full">
        <div className={cn(
          "w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5",
          isUser ? "bg-surface-700 text-surface-300 text-xxs font-bold" : "bg-codi-500/20 text-codi-400"
        )}>
          {isUser ? "U" : <Bot size={13} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-surface-400">
              {isUser ? "You" : "CODI"}
            </span>
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {images.map((img, i) => (
                <img key={i} src={img.image_url.url} alt={`Upload ${i + 1}`}
                  className="max-w-[200px] max-h-[150px] object-cover rounded border border-surface-850" />
              ))}
            </div>
          )}

          {text && !isUser ? (
            <div className="codi-prose">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeStr = String(children).replace(/\n$/, "");
                    const blockKey = codeStr.slice(0, 40);

                    if (match) {
                      const isCopied = copied === blockKey;
                      return (
                        <div className="relative group/code my-2 rounded-lg overflow-hidden border border-surface-850">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-surface-900">
                            <span className="text-xxs text-surface-500 uppercase tracking-wider">{match[1]}</span>
                            <button
                              onClick={() => handleCopy(blockKey)}
                              className="flex items-center gap-1 text-xxs text-surface-500 hover:text-surface-300 transition-colors"
                            >
                              {isCopied ? <Check size={11} /> : <Copy size={11} />}
                              {isCopied ? "Copied" : "Copy"}
                            </button>
                          </div>
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.8125rem" }}
                          >
                            {codeStr}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }

                    return (
                      <code className="bg-surface-800 text-codi-300 px-1 py-0.5 rounded text-xs" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre({ children }) {
                    return <>{children}</>;
                  },
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-surface-200 whitespace-pre-wrap break-words leading-relaxed">{text}</p>
          )}
        </div>
      </div>
    </div>
  );
}
