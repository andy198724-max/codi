import { useState } from "react";
import type { Message, ContentPart } from "@/lib/api";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  User,
  Bot,
  Copy,
  Check,
  Wand2,
  RefreshCw,
  Sparkles,
  FileCode,
  Terminal,
} from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

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

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const extractCodeBlocks = (md: string) => {
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    const blocks: { lang: string; code: string }[] = [];
    let match;
    while ((match = regex.exec(md)) !== null) {
      blocks.push({ lang: match[1] || "text", code: match[2] });
    }
    return blocks;
  };

  const codeBlocks = !isUser ? extractCodeBlocks(text) : [];

  return (
    <div
      className={cn(
        "group px-6 py-4 hover:bg-surface-50/50 dark:hover:bg-surface-900/30 transition-colors",
        isUser ? "bg-surface-50/30 dark:bg-surface-900/20" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-4xl mx-auto flex gap-4">
        {/* Avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1",
            isUser
              ? "bg-surface-200 dark:bg-surface-800"
              : "bg-codi-600"
          )}
        >
          {isUser ? (
            <User size={16} className="text-surface-600 dark:text-surface-400" />
          ) : (
            <Bot size={16} className="text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-surface-400 mb-1">
            {isUser ? "You" : "CODI"}
          </div>

          {/* Images */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.image_url.url}
                  alt={`Uploaded ${i + 1}`}
                  className="max-w-xs max-h-48 rounded-lg border border-surface-200 dark:border-surface-700"
                />
              ))}
            </div>
          )}

          {/* Text + Code Blocks */}
          {text && !isUser ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeStr = String(children).replace(/\n$/, "");

                    if (match) {
                      return (
                        <div className="relative group/code my-3">
                          <div className="flex items-center justify-between px-4 py-1.5 bg-surface-800 dark:bg-surface-900 rounded-t-lg border-b border-surface-700">
                            <span className="text-xs text-surface-400">
                              {match[1]}
                            </span>
                            <button
                              onClick={() => handleCopy(codeStr, codeBlocks.indexOf({ lang: match[1], code: codeStr }))}
                              className="flex items-center gap-1 text-xs text-surface-400 hover:text-surface-200 transition-colors"
                            >
                              {copiedIndex === codeBlocks.indexOf({ lang: match[1], code: codeStr }) ? (
                                <Check size={12} />
                              ) : (
                                <Copy size={12} />
                              )}
                              {copiedIndex === codeBlocks.indexOf({ lang: match[1], code: codeStr })
                                ? "Copied"
                                : "Copy"}
                            </button>
                          </div>
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: "0 0 0.5rem 0.5rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            {codeStr}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }

                    return (
                      <code
                        className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-codi-600 dark:text-codi-400 text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-sm text-surface-900 dark:text-surface-100 whitespace-pre-wrap">
              {text}
            </div>
          )}

          {/* Quick Actions (non-user messages) */}
          {!isUser && text && isHovered && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-surface-100 dark:border-surface-800">
              <QuickActionButton icon={Wand2} label="Improve" />
              <QuickActionButton icon={RefreshCw} label="Simplify" />
              <QuickActionButton icon={Sparkles} label="Optimize" />
              <QuickActionButton icon={FileCode} label="Explain" />
              <QuickActionButton icon={Terminal} label="Run" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button className="flex items-center gap-1 px-2 py-1 text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-all">
      <Icon size={12} />
      {label}
    </button>
  );
}
