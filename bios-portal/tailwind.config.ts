import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bios: {
          navy: "#0a1c2e",
          blue: "#2563eb",
          cyan: "#06b6d4",
          green: "#10b981",
          ink: "#172033",
          line: "#dbe4f0",
          "accent-1": "#1e3a8a",
          "accent-2": "#3b82f6",
          bg: "#f6f8fb",
        },
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      boxShadow: {
        sm: "0 2px 8px rgba(0,0,0,0.08)",
        md: "0 8px 20px rgba(0,0,0,0.12)",
        lg: "0 16px 40px rgba(0,0,0,0.16)",
        xl: "0 24px 60px rgba(0,0,0,0.20)",
        panel: "0 18px 48px -34px rgba(15,23,42,0.45)",
        "dark-panel": "0 22px 60px -34px rgba(10,28,46,0.75)",
        "blue-glow": "0 8px 24px rgba(37,99,235,0.35)",
      },
      animation: {
        "page-enter": "pageEnter 520ms ease both",
        "skeleton-pulse": "skeletonPulse 1.8s ease-in-out infinite",
        "fade-in": "fadeIn 300ms ease both",
      },
      keyframes: {
        pageEnter: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        skeletonPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
