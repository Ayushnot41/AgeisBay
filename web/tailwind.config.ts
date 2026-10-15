import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#07090E",
          deep: "#040609",
        },
        panel: {
          DEFAULT: "#0D111A",
          hover: "#111724",
        },
        card: {
          DEFAULT: "#151C28",
          elevated: "#192231",
        },
        hairline: {
          DEFAULT: "#1E293B",
          light: "#2A384F",
        },
        status: {
          pass: "#10B981",
          fail: "#EF4444",
          warn: "#F59E0B",
          cyan: "#06B6D4",
          enclave: "#3B82F6",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        recessed: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(0, 0, 0, 0.25)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
        specular: "inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        glowCyan: "0 0 15px -3px rgba(6, 182, 212, 0.3)",
        glowPass: "0 0 15px -3px rgba(16, 185, 129, 0.3)",
        glowFail: "0 0 15px -3px rgba(239, 68, 68, 0.3)",
      },
    },
  },
  plugins: [],
} satisfies Config;
