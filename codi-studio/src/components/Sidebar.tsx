import { useChatStore, type Conversation } from "@/stores/chat";
import { cn } from "@/lib/utils";
import {
  Plus,
  MessageSquare,
  Trash2,
  Bot,
  Search,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const conversations = useChatStore((s) => s.conversations);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const newConversation = useChatStore((s) => s.newConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-64 flex flex-col bg-surface-50 dark:bg-surface-950 border-r border-surface-200 dark:border-surface-800">
      {/* Header */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-codi-600 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <span className="font-semibold text-lg text-surface-900 dark:text-surface-100">
            CODI
          </span>
        </div>

        <button
          onClick={() => newConversation()}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium
            bg-codi-600 hover:bg-codi-700 text-white rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nuevo chat
        </button>

        <div className="relative mt-2">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
          />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-surface-900
              border border-surface-200 dark:border-surface-700 rounded-lg
              placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-codi-500/50"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 && (
          <p className="text-xs text-surface-400 text-center py-8">
            {search ? "Sin resultados" : "Aun no hay conversaciones"}
          </p>
        )}
        {filtered.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeConversationId}
            onClick={() => setActiveConversation(conv.id)}
            onDelete={() => deleteConversation(conv.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-2 text-xs text-surface-400">
          <span className="flex-1">Codi v1.0</span>
          <button className="hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
            <Settings size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left group",
        isActive
          ? "bg-codi-100 dark:bg-codi-950/50 text-codi-700 dark:text-codi-300"
          : "hover:bg-surface-100 dark:hover:bg-surface-900 text-surface-700 dark:text-surface-300"
      )}
    >
      <MessageSquare size={14} className="shrink-0" />
      <span className="flex-1 truncate">{conversation.title}</span>
      <span className="text-xs text-surface-400">{conversation.mode}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
      >
        <Trash2 size={14} />
      </button>
    </button>
  );
}
