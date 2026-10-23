import type { Config } from "tailwindcss";

const colour = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: { DEFAULT: colour("canvas"), deep: colour("canvas") },
        panel: { DEFAULT: colour("surface"), hover: colour("hover") },
        card: { DEFAULT: colour("surface"), elevated: colour("raised") },
        hairline: { DEFAULT: colour("line"), light: colour("line-strong") },
        ink: colour("ink"), body: colour("body"), muted: colour("muted"),
        accent: { DEFAULT: colour("accent"), hover: colour("accent-hover"), contrast: colour("on-accent") },
        status: {
          pass: colour("pass"), fail: colour("fail"), warn: colour("warn"),
          cyan: colour("accent"), enclave: colour("accent"),
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-code)", "Consolas", "monospace"],
      },
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.5" }],
        sm: ["0.9375rem", { lineHeight: "1.6" }],
      },
      boxShadow: {
        recessed: "inset 0 1px 3px rgb(0 0 0 / .06)",
        card: "var(--shadow-panel)",
        specular: "none", glowCyan: "none", glowPass: "none", glowFail: "none",
      },
    },
  },
  plugins: [],
} satisfies Config;
