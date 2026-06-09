import { Bot, Sparkles, Code2, Eye, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  onNewChat: () => void;
}

export function EmptyState({ onNewChat }: EmptyStateProps) {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        {/* Logo */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-codi-500 to-codi-700 flex items-center justify-center shadow-lg shadow-codi-500/20">
          <Bot size={32} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">
          Welcome to CODI Studio
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-8">
          Your AI-powered coding assistant with vision capabilities.
          <br />
          Ask questions, write code, analyze images, or let CODI work as your agent.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <FeatureCard
            icon={Code2}
            title="Code"
            description="Write, refactor, explain code"
            color="text-codi-500"
          />
          <FeatureCard
            icon={Eye}
            title="Vision"
            description="Analyze images & screenshots"
            color="text-emerald-500"
          />
          <FeatureCard
            icon={Sparkles}
            title="Agent Mode"
            description="CODI works on your files"
            color="text-amber-500"
          />
          <FeatureCard
            icon={ArrowRight}
            title="Smart Context"
            description="Understands your project"
            color="text-purple-500"
          />
        </div>

        {/* CTA */}
        <button
          onClick={onNewChat}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium
            bg-codi-600 hover:bg-codi-700 text-white rounded-xl transition-all
            shadow-lg shadow-codi-500/25 hover:shadow-codi-500/40"
        >
          <Sparkles size={16} />
          Start New Chat
        </button>

        <p className="mt-4 text-xs text-surface-400">
          Ctrl+L for new chat · Ctrl+K for settings
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-left">
      <Icon size={20} className={`${color} mb-1`} />
      <h3 className="text-sm font-medium text-surface-900 dark:text-surface-100">
        {title}
      </h3>
      <p className="text-xs text-surface-500">{description}</p>
    </div>
  );
}
