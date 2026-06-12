/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        codi: {
          50: "var(--a-50, #eff6ff)", 100: "var(--a-100, #dbeafe)", 200: "var(--a-200, #bfdbfe)",
          300: "var(--a-300, #93c5fd)", 400: "var(--a-400, #60a5fa)", 500: "var(--a-500, #317CFF)",
          600: "var(--a-600, #2563eb)", 700: "var(--a-700, #1d4ed8)", 800: "var(--a-800, #1e40af)",
          900: "var(--a-900, #1e3a8a)", 950: "var(--a-950, #172554)",
        },
        surface: {
          50: "var(--s-50, #fafafa)", 100: "var(--s-100, #f4f4f5)", 200: "var(--s-200, #e4e4e7)",
          300: "var(--s-300, #d4d4d8)", 400: "var(--s-400, #a1a1aa)", 500: "var(--s-500, #71717a)",
          600: "var(--s-600, #52525b)", 700: "var(--s-700, #3f3f46)", 800: "var(--s-800, #27272a)",
          850: "var(--s-850, #2a2a2d)", 900: "var(--s-900, #18181b)", 925: "var(--s-925, #121214)",
          950: "var(--s-950, #0c0c0d)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        xxs: ["0.6875rem", { lineHeight: "1rem" }],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [typography],
};
