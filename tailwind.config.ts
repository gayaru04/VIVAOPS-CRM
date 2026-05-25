import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        surface:     "hsl(var(--surface))",
        "surface-2": "hsl(var(--surface-2))",
        "surface-3": "hsl(var(--surface-3))",
        hover:       "hsl(var(--hover))",
        "text-2":    "hsl(var(--text-2))",
        "text-3":    "hsl(var(--text-3))",
        "text-4":    "hsl(var(--text-4))",
        border:         "hsl(var(--border))",
        "border-strong":"hsl(var(--border-strong))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        /* status dot colours */
        "st-blue":   "hsl(var(--st-blue))",
        "st-green":  "hsl(var(--st-green))",
        "st-amber":  "hsl(var(--st-amber))",
        "st-red":    "hsl(var(--st-red))",
        "st-violet": "hsl(var(--st-violet))",
        "st-slate":  "hsl(var(--st-slate))",
        "st-pink":   "hsl(var(--st-pink))",
        "st-cyan":   "hsl(var(--st-cyan))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px", letterSpacing: "0.05em" }],
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "20px" }],
        base: ["14px", { lineHeight: "20px" }],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10,10,20,0.04), 0 1px 1px rgba(10,10,20,0.03)",
        pop:  "0 12px 32px -12px rgba(10,10,20,0.18), 0 2px 6px rgba(10,10,20,0.06)",
        card: "0 1px 3px rgba(10,10,20,0.06), 0 1px 2px rgba(10,10,20,0.04)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
