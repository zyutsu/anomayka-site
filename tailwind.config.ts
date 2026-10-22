import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary, #090a0f)",
          accent: "rgb(var(--brand-accent-rgb, 225 29 72) / <alpha-value>)",
          accentHover: "var(--brand-accent-hover, #be123c)",
          secondary: "var(--brand-secondary, #171a24)",
          surface: "var(--brand-surface, #11131a)",
          border: "var(--brand-border, rgba(255, 255, 255, 0.08))",
          text: "var(--brand-text, #f8fafc)",
          muted: "var(--brand-muted, #94a3b8)",
        },
      },
      borderRadius: {
        lg: "var(--radius, 12px)",
        md: "calc(var(--radius, 12px) - 2px)",
        sm: "calc(var(--radius, 12px) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
