import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./admin-app/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Atlas tokens (CSS variables set inline by AtlasTokensProvider)
        atlas: {
          bg: "var(--atlas-bg)",
          surface: "var(--atlas-surface)",
          "surface-2": "var(--atlas-surface-2)",
          text: "var(--atlas-text)",
          "text-muted": "var(--atlas-text-muted)",
          border: "var(--atlas-border)",
          primary: "var(--atlas-primary)",
          "primary-fg": "var(--atlas-primary-fg)",
          secondary: "var(--atlas-secondary)",
          "secondary-fg": "var(--atlas-secondary-fg)",
          accent: "var(--atlas-accent)",
          success: "var(--atlas-success)",
          warning: "var(--atlas-warning)",
          danger: "var(--atlas-danger)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Atlas radii
        "atlas-sm": "var(--atlas-radius-sm)",
        "atlas-md": "var(--atlas-radius-md)",
        "atlas-lg": "var(--atlas-radius-lg)",
        "atlas-xl": "var(--atlas-radius-xl)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        "atlas-heading": ["var(--atlas-font-heading)", "system-ui", "sans-serif"],
        "atlas-body": ["var(--atlas-font-body)", "system-ui", "sans-serif"],
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
  plugins: [animate],
};

export default config;
