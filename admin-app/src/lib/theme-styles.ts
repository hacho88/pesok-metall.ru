import type { ThemePreset } from "@/types/page-builder";

/**
 * 4 архитектурных стилевых категории. Каждая тема принадлежит одной из них —
 * категория определяет структуру раскладок, типографику и анимации,
 * а палитра темы — только цвета.
 */
export type ThemeStyle = "minimal" | "bento" | "editorial" | "commerce";

export interface ThemeStyleMeta {
  id: ThemeStyle;
  label: string;
  description: string;
  fontHeading: string;
  fontBody: string;
}

export const THEME_STYLES: Record<ThemeStyle, ThemeStyleMeta> = {
  minimal: {
    id: "minimal",
    label: "Clean & Minimalist",
    description:
      "Luxury, fashion, cosmetics. Oversized typography, huge white space, thin elegant borders, asymmetric galleries, hover-to-reveal interactions.",
    fontHeading: "Manrope",
    fontBody: "Inter",
  },
  bento: {
    id: "bento",
    label: "Bento Grid & Brutalism",
    description:
      "Gadgets, tech, streetwear. Modular rounded tiles of different aspect ratios, glowing neon accents, moving text tickers, bold high-contrast UI.",
    fontHeading: "Space Grotesk",
    fontBody: "Inter",
  },
  editorial: {
    id: "editorial",
    label: "Editorial & Magazine",
    description:
      "Art, decor, boutique coffee, craftsmanship. Serif headings with clean body text, split-screen heroes, lookbook sliders, smooth fade-ins.",
    fontHeading: "Playfair Display",
    fontBody: "Inter",
  },
  commerce: {
    id: "commerce",
    label: "High-Conversion Commerce",
    description:
      "Large catalogs, auto parts, retail. Multi-column structure, persistent filters, discount badges, quick-buy modals, sticky conversion elements.",
    fontHeading: "Manrope",
    fontBody: "Inter",
  },
};

export const THEME_STYLE_OF: Record<ThemePreset, ThemeStyle> = {
  // 1-6: Clean & Minimalist — luxury, fashion, cosmetics
  "clean-minimal": "minimal",
  "paper-mono": "minimal",
  "warm-sand": "minimal",
  "rose-blush": "minimal",
  "peach-cream": "minimal",
  "emerald-light": "minimal",
  // 7-12: Bento Grid & Brutalism — tech, streetwear, gadgets
  "neon-dark": "bento",
  "graphite-dark": "bento",
  "violet-mist": "bento",
  "lime-fresh": "bento",
  "royal-purple": "bento",
  "midnight-navy": "bento",
  // 13-18: Editorial & Magazine — art, decor, coffee, craftsmanship
  "forest-dark": "editorial",
  "crimson-dark": "editorial",
  "ocean-deep": "editorial",
  "sunset-dark": "editorial",
  "wine-dark": "editorial",
  "copper-dark": "editorial",
  // 19-24: High-Conversion Commerce — catalogs, retail, auto parts
  "industrial-orange": "commerce",
  "b2b-dark-slate": "commerce",
  "cool-sky": "commerce",
  "amber-sunset": "commerce",
  "teal-fresh": "commerce",
  "steel-dark": "commerce",
  // ВИ — клон vseinstrumenti.ru (high-conversion commerce)
  vi: "commerce",
  // City-Met — клон city-met.ru (плотный каталог-спредшит)
  "city-met": "commerce",
  // Aurora Forge Pro — премиальный тёмный bento (стекло, свечение, blueprint)
  "aurora-forge": "bento",
  // Идеал — премиальный светлый гибрид (Apple + Linear + B2B marketplace)
  ideal: "minimal",
  // Arena — тёмная «торговая арена» (brutal bento, scoreboard, прожекторы)
  arena: "bento",
};

export function getThemeStyle(theme: ThemePreset): ThemeStyle {
  return THEME_STYLE_OF[theme] ?? "commerce";
}

export function getThemeStyleMeta(theme: ThemePreset): ThemeStyleMeta {
  return THEME_STYLES[getThemeStyle(theme)];
}
