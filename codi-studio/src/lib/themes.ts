export interface Theme {
  id: string;
  name: string;
  primary: string;
  primaryHover: string;
  bg: string;
  surface: string;
  surfaceBorder: string;
  accent: string;
}

export const themes: Record<string, Theme> = {
  "codi-dark": {
    id: "codi-dark",
    name: "CODI Dark",
    primary: "#f09000",
    primaryHover: "#d47800",
    bg: "#1a1b1e",
    surface: "#252528",
    surfaceBorder: "#2d2d30",
    accent: "#f0a030",
  },
  "codi-amber": {
    id: "codi-amber",
    name: "CODI Ambar",
    primary: "#f59e0b",
    primaryHover: "#d97706",
    bg: "#18181b",
    surface: "#27272a",
    surfaceBorder: "#3f3f46",
    accent: "#fbbf24",
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    primary: "#6366f1",
    primaryHover: "#4f46e5",
    bg: "#0a0a0a",
    surface: "#171717",
    surfaceBorder: "#262626",
    accent: "#818cf8",
  },
  nord: {
    id: "nord",
    name: "Nord",
    primary: "#88c0d0",
    primaryHover: "#81a1c1",
    bg: "#2e3440",
    surface: "#3b4252",
    surfaceBorder: "#434c5e",
    accent: "#5e81ac",
  },
  dracula: {
    id: "dracula",
    name: "Dracula",
    primary: "#bd93f9",
    primaryHover: "#a879f0",
    bg: "#282a36",
    surface: "#44475a",
    surfaceBorder: "#6272a4",
    accent: "#ff79c6",
  },
  solarized: {
    id: "solarized",
    name: "Solarized",
    primary: "#2aa198",
    primaryHover: "#268bd2",
    bg: "#002b36",
    surface: "#073642",
    surfaceBorder: "#586e75",
    accent: "#b58900",
  },
};

export function applyTheme(themeId: string) {
  const theme = themes[themeId] || themes["codi-dark"];
  const root = document.documentElement;

  root.style.setProperty("--codi-primary", theme.primary);
  root.style.setProperty("--codi-primary-hover", theme.primaryHover);
  root.style.setProperty("--codi-bg", theme.bg);
  root.style.setProperty("--codi-surface", theme.surface);
  root.style.setProperty("--codi-surface-border", theme.surfaceBorder);
  root.style.setProperty("--codi-accent", theme.accent);

  localStorage.setItem("codi_theme", themeId);
}

export function getCurrentTheme(): Theme {
  const id = localStorage.getItem("codi_theme") || "codi-dark";
  return themes[id] || themes["codi-dark"];
}
