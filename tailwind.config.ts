import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#10b981", // emerald-500 (Nigerian green)
          dark: "#059669", // emerald-600
          light: "#34d399", // emerald-400
        },
        secondary: {
          DEFAULT: "#1e293b", // slate-800
          light: "#475569", // slate-600
        },
        accent: {
          DEFAULT: "#f59e0b", // amber-500
        },
        success: "#22c55e", // green-500
        warning: "#eab308", // yellow-500
        error: "#ef4444", // red-500
        background: {
          DEFAULT: "#ffffff",
          muted: "#f8fafc", // slate-50
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

