import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "#0b0f17",
        panel: "#111827",
        border: "#1f2937",
        muted: "#64748b",
        accent: "#22d3ee",
        good: "#10b981",
        warn: "#f59e0b",
        bad: "#ef4444",
      },
    },
  },
  plugins: [],
};
export default config;
