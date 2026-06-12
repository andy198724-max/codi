export interface ThemeColors {
  surface: Record<string, string>;
  accent: Record<string, string>;
  editor: { bg: string; fg: string; lineHighlight: string; selection: string; cursor: string; gutter: string; guide: string };
  syntax: { comment: string; string: string; number: string; keyword: string; func: string; variable: string; type: string; class: string; operator: string; constant: string };
  statusBar: { bg: string; fg: string; activeBg: string };
  menuBar: { bg: string; fg: string; hover: string };
  chat: { userBubble: string; assistantBubble: string; codeBlock: string };
  explorer: { bg: string; hoverBg: string; activeBg: string };
  input: { bg: string; border: string; fg: string; placeholder: string };
}

export interface ThemeDefinition {
  id: string;
  name: string;
  type: "dark" | "light";
  colors: ThemeColors;
}

let currentThemeId = "codi-dark";

export function getCurrentThemeId(): string {
  return localStorage.getItem("codi_theme_id") || "codi-dark";
}

export function setCurrentThemeId(id: string) {
  currentThemeId = id;
  localStorage.setItem("codi_theme_id", id);
}

export function applyTheme(theme: ThemeDefinition) {
  const root = document.documentElement;
  const c = theme.colors;
  const vars: Record<string, string> = {
    "--s-50": c.surface[50], "--s-100": c.surface[100], "--s-200": c.surface[200],
    "--s-300": c.surface[300], "--s-400": c.surface[400], "--s-500": c.surface[500],
    "--s-600": c.surface[600], "--s-700": c.surface[700], "--s-800": c.surface[800],
    "--s-850": c.surface[850] || c.surface[800], "--s-900": c.surface[900],
    "--s-925": c.surface[925] || c.surface[900], "--s-950": c.surface[950],
    "--a-50": c.accent[50], "--a-100": c.accent[100], "--a-200": c.accent[200],
    "--a-300": c.accent[300], "--a-400": c.accent[400], "--a-500": c.accent[500],
    "--a-600": c.accent[600], "--a-700": c.accent[700], "--a-800": c.accent[800],
    "--a-900": c.accent[900], "--a-950": c.accent[950],
    "--editor-bg": c.editor.bg, "--editor-fg": c.editor.fg,
    "--editor-line": c.editor.lineHighlight, "--editor-sel": c.editor.selection,
    "--editor-cursor": c.editor.cursor, "--editor-gutter": c.editor.gutter,
    "--editor-guide": c.editor.guide,
    "--syn-comment": c.syntax.comment, "--syn-string": c.syntax.string,
    "--syn-number": c.syntax.number, "--syn-keyword": c.syntax.keyword,
    "--syn-func": c.syntax.func, "--syn-var": c.syntax.variable,
    "--syn-type": c.syntax.type, "--syn-class": c.syntax.class,
    "--syn-op": c.syntax.operator, "--syn-const": c.syntax.constant,
    "--sb-bg": c.statusBar.bg, "--sb-fg": c.statusBar.fg, "--sb-active": c.statusBar.activeBg,
    "--mb-bg": c.menuBar.bg, "--mb-fg": c.menuBar.fg, "--mb-hover": c.menuBar.hover,
    "--chat-user": c.chat.userBubble, "--chat-asst": c.chat.assistantBubble,
    "--chat-code": c.chat.codeBlock,
    "--exp-bg": c.explorer.bg, "--exp-hover": c.explorer.hoverBg, "--exp-active": c.explorer.activeBg,
    "--inp-bg": c.input.bg, "--inp-border": c.input.border, "--inp-fg": c.input.fg,
    "--inp-placeholder": c.input.placeholder,
  };

  Object.entries(vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });

  if (theme.type === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
  }

  setCurrentThemeId(theme.id);
}

export function getThemeCSSVars(): string {
  return Object.entries(document.documentElement.style)
    .filter(([k]) => k.startsWith("--"))
    .map(([k, v]) => `${k}: ${v};`)
    .join("\n");
}
