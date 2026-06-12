import type { ThemeDefinition } from "./engine";

const DARK_SURFACE = {
  50: "#f6f6f6", 100: "#e7e7e7", 200: "#d1d1d1", 300: "#b0b0b0", 400: "#888888",
  500: "#6d6d6d", 600: "#5d5d5d", 700: "#4f4f4f", 800: "#454545", 850: "#2d2d30",
  900: "#252528", 925: "#212226", 950: "#1a1b1e",
};

const LIGHT_SURFACE = {
  50: "#fafafa", 100: "#f5f5f5", 200: "#e5e5e5", 300: "#d4d4d4", 400: "#a3a3a3",
  500: "#737373", 600: "#525252", 700: "#404040", 800: "#262626", 850: "#e5e5e5",
  900: "#fafafa", 925: "#f5f5f5", 950: "#ffffff",
};

const DS = DARK_SURFACE;
const LS = LIGHT_SURFACE;

function dark(bg: string, fg: string, accent: Record<string, string>, extra?: Partial<ThemeDefinition["colors"]>): ThemeColors {
  return {
    surface: DS,
    accent,
    editor: { bg, fg, lineHighlight: accent[950] + "30", selection: accent[500] + "40", cursor: accent[400], gutter: DS[900], guide: DS[850] },
    syntax: { comment: "#6a9955", string: "#ce9178", number: "#b5cea8", keyword: "#569cd6", func: "#dcdcaa", variable: "#9cdcfe", type: "#4ec9b0", class: "#4ec9b0", operator: "#d4d4d4", constant: "#569cd6" },
    statusBar: { bg: accent[600], fg: "#ffffff", activeBg: accent[500] },
    menuBar: { bg: DS[925], fg: DS[400], hover: DS[850] },
    chat: { userBubble: DS[800], assistantBubble: DS[925], codeBlock: DS[900] },
    explorer: { bg: DS[925], hoverBg: DS[850], activeBg: accent[950] + "30" },
    input: { bg: DS[950], border: DS[850], fg: DS[200], placeholder: DS[500] },
    ...extra,
  };
}

function light(bg: string, fg: string, accent: Record<string, string>, extra?: Partial<ThemeDefinition["colors"]>): ThemeColors {
  return {
    surface: LS,
    accent,
    editor: { bg, fg, lineHighlight: accent[100], selection: accent[200], cursor: accent[500], gutter: LS[200], guide: LS[300] },
    syntax: { comment: "#6a9955", string: "#a31515", number: "#098658", keyword: "#0000ff", func: "#795e26", variable: "#001080", type: "#267f99", class: "#267f99", operator: "#000000", constant: "#0070c1" },
    statusBar: { bg: accent[600], fg: "#ffffff", activeBg: accent[500] },
    menuBar: { bg: LS[950], fg: LS[600], hover: LS[200] },
    chat: { userBubble: LS[100], assistantBubble: LS[950], codeBlock: LS[100] },
    explorer: { bg: LS[900], hoverBg: LS[200], activeBg: accent[100] },
    input: { bg: LS[950], border: LS[300], fg: LS[700], placeholder: LS[400] },
    ...extra,
  };
}

const ACCENT_CODI = { 50: "#fff8eb", 100: "#ffecce", 200: "#ffd69c", 300: "#ffb94d", 400: "#ffa620", 500: "#f09000", 600: "#d47800", 700: "#b05a00", 800: "#8e4600", 900: "#753b00", 950: "#3f1d00" };
const ACCENT_BLUE = { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a", 950: "#172554" };
const ACCENT_PURPLE = { 50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 300: "#d8b4fe", 400: "#c084fc", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce", 800: "#6b21a8", 900: "#581c87", 950: "#3b0764" };
const ACCENT_GREEN = { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac", 400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d", 950: "#052e16" };
const ACCENT_RED = { 50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 300: "#fca5a5", 400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c", 800: "#991b1b", 900: "#7f1d1d", 950: "#450a0a" };
const ACCENT_CYAN = { 50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9", 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490", 800: "#155e75", 900: "#164e63", 950: "#083344" };
const ACCENT_TEAL = { 50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4", 400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e", 800: "#115e59", 900: "#134e4a", 950: "#042f2e" };
const ACCENT_ROSE = { 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337", 950: "#4c0519" };
const ACCENT_AMBER = { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f", 950: "#451a03" };
const ACCENT_INDIGO = { 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81", 950: "#1e1b4b" };

export const themeRegistry: ThemeDefinition[] = [
  { id: "codi-dark", name: "CODI Dark", type: "dark", colors: dark("#1a1b1e", "#e0e0e0", ACCENT_CODI) },
  { id: "codi-amber", name: "CODI Amber", type: "dark", colors: dark("#1a1b1e", "#e0e0e0", ACCENT_AMBER) },
  { id: "codi-ocean", name: "CODI Ocean", type: "dark", colors: dark("#0f172a", "#e2e8f0", ACCENT_CYAN) },
  { id: "codi-midnight", name: "CODI Midnight", type: "dark", colors: dark("#09090b", "#d4d4d8", ACCENT_INDIGO) },
  { id: "codi-forest", name: "CODI Forest", type: "dark", colors: dark("#0a1c0f", "#d1d5db", ACCENT_GREEN) },
  { id: "codi-sunset", name: "CODI Sunset", type: "dark", colors: dark("#1c0a0a", "#e5e5e5", ACCENT_ROSE) },
  { id: "one-dark-pro", name: "One Dark Pro", type: "dark", colors: dark("#282c34", "#abb2bf", ACCENT_CYAN) },
  { id: "dracula", name: "Dracula", type: "dark", colors: dark("#282a36", "#f8f8f2", ACCENT_PURPLE) },
  { id: "nord", name: "Nord", type: "dark", colors: dark("#2e3440", "#d8dee9", ACCENT_CYAN) },
  { id: "tokyo-night", name: "Tokyo Night", type: "dark", colors: dark("#1a1b26", "#a9b1d6", ACCENT_BLUE) },
  { id: "catppuccin", name: "Catppuccin Mocha", type: "dark", colors: dark("#1e1e2e", "#cdd6f4", ACCENT_ROSE) },
  { id: "github-dark", name: "GitHub Dark", type: "dark", colors: dark("#0d1117", "#e6edf3", ACCENT_BLUE) },
  { id: "monokai", name: "Monokai", type: "dark", colors: dark("#272822", "#f8f8f2", ACCENT_AMBER) },
  { id: "monokai-pro", name: "Monokai Pro", type: "dark", colors: dark("#2d2a2e", "#fcfcfa", ACCENT_PURPLE) },
  { id: "gruvbox-dark", name: "Gruvbox Dark", type: "dark", colors: dark("#282828", "#ebdbb2", ACCENT_AMBER) },
  { id: "minimal-dark", name: "Minimal Dark", type: "dark", colors: dark("#0a0a0a", "#a0a0a0", ACCENT_INDIGO) },
  { id: "vscode-dark-plus", name: "Dark+ (VS Code)", type: "dark", colors: dark("#1e1e1e", "#cccccc", ACCENT_BLUE) },
  { id: "vscode-dark-modern", name: "Dark Modern", type: "dark", colors: dark("#181818", "#cccccc", ACCENT_BLUE) },
  { id: "high-contrast", name: "High Contrast", type: "dark", colors: dark("#000000", "#ffffff", ACCENT_BLUE) },
  { id: "cascadia", name: "Cascadia", type: "dark", colors: dark("#0d1117", "#c9d1d9", ACCENT_TEAL) },
  { id: "windsurf-dark", name: "Windsurf Dark", type: "dark", colors: dark("#0c0c0d", "#e0e0e0", ACCENT_BLUE) },
  { id: "cursor-dark", name: "Cursor Dark", type: "dark", colors: dark("#1a1a1a", "#e0e0e0", ACCENT_PURPLE) },
  { id: "palenight", name: "Palenight", type: "dark", colors: dark("#292d3e", "#a6accd", ACCENT_PURPLE) },
  { id: "material-darker", name: "Material Darker", type: "dark", colors: dark("#212121", "#eeffff", ACCENT_TEAL) },
  { id: "shades-of-purple", name: "Shades of Purple", type: "dark", colors: dark("#2d2b55", "#ffffff", ACCENT_AMBER) },
  { id: "ayu-dark", name: "Ayu Dark", type: "dark", colors: dark("#0a0e14", "#bfbdb6", ACCENT_AMBER) },
  { id: "solarized-dark", name: "Solarized Dark", type: "dark", colors: dark("#002b36", "#839496", ACCENT_CYAN) },
  { id: "noctis", name: "Noctis", type: "dark", colors: dark("#15232c", "#b1b7c0", ACCENT_TEAL) },
  { id: "github-light", name: "GitHub Light", type: "light", colors: light("#ffffff", "#24292e", ACCENT_BLUE) },
  { id: "solarized-light", name: "Solarized Light", type: "light", colors: light("#fdf6e3", "#657b83", ACCENT_CYAN) },
  { id: "minimal-light", name: "Minimal Light", type: "light", colors: light("#ffffff", "#1a1a1a", ACCENT_INDIGO) },
  { id: "vscode-light-plus", name: "Light+ (VS Code)", type: "light", colors: light("#ffffff", "#1e1e1e", ACCENT_BLUE) },
  { id: "vscode-light-modern", name: "Light Modern", type: "light", colors: light("#ffffff", "#3b3b3b", ACCENT_BLUE) },
  { id: "winter-coming", name: "Winter is Coming", type: "light", colors: light("#f5f5f5", "#333333", ACCENT_BLUE) },
  { id: "codi-light", name: "CODI Light", type: "light", colors: light("#ffffff", "#1a1b1e", ACCENT_CODI) },
];

export function getThemeById(id: string): ThemeDefinition {
  return themeRegistry.find(t => t.id === id) || themeRegistry[0];
}
