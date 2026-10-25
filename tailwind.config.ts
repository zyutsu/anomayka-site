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
      padding: "1.25rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary, #0a0b0d)",
          accent: "rgb(var(--brand-accent-rgb, 226 59 46) / <alpha-value>)",
          accentHover: "var(--brand-accent-hover, #c92f24)",
          secondary: "var(--brand-secondary, #15171c)",
          surface: "var(--brand-surface, #111317)",
          border: "var(--brand-border, rgba(255, 255, 255, 0.09))",
          text: "var(--brand-text, #f6f6f4)",
          muted: "var(--brand-muted, #9aa0a8)",
        },
      },
      borderRadius: {
        lg: "var(--radius, 16px)",
        md: "calc(var(--radius, 16px) - 4px)",
        sm: "calc(var(--radius, 16px) - 8px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.04)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 5s ease-in-out infinite",
        marquee: "marquee 38s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

