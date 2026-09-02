import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#0F1214",
          surface: "#171B1E",
          surface2: "#1E2327",
          border: "#2B3136",
          text: "#EDEFF1",
          muted: "#9AA3AA",
          faint: "#6B747B",
        },
        accent: {
          DEFAULT: "#F2A93B",
          dim: "#8A5F1F",
        },
        status: {
          pending: "#9AA3AA",
          assigned: "#4B9FD6",
          onway: "#B98CE8",
          progress: "#F2A93B",
          completed: "#4CAF6D",
          cancelled: "#E5484D",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
