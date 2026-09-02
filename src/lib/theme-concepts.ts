import type { ThemePreset } from "@/types/page-builder";
import { THEME_STYLE_OF, type ThemeStyle } from "@/lib/theme-styles";

/**
 * 4 визуальные концепции витрины. Каждая тема принадлежит одной концепции —
 * концепция определяет структуру раскладки, типографику, радиусы и анимации,
 * а палитра темы — только цвета.
 *
 * 1. silk     — Silk Luxury / Premium B2B   (темы 1-6)
 * 2. bento    — Cyber Bento Tech            (темы 7-12)
 * 3. editorial— Editorial Studio / Vogue    (темы 13-18)
 * 4. hyper    — High-Conversion Hyper-Grid  (темы 19-24)
 */
export type ThemeConcept = "silk" | "bento" | "editorial" | "hyper" | "vi" | "arena";

export interface ThemeConceptMeta {
  id: ThemeConcept;
  label: string;
  description: string;
  fontHeading: string;
  fontBody: string;
  radius: number; // базовый радиус скругления, px
  /** CSS-переменная шрифта заголовков (next/font variable) */
  headingVar: string;
  /** CSS-переменная шрифта текста */
  bodyVar: string;
}

export const THEME_CONCEPTS: Record<ThemeConcept, ThemeConceptMeta> = {
  silk: {
    id: "silk",
    label: "Silk Luxury / Premium B2B",
    description:
      "Apple-like luxury minimalism: massive whitespace, oversized typography, ultra-thin borders, glassmorphism, asymmetric masonry, text-pills.",
    fontHeading: "Manrope",
    fontBody: "Inter",
    radius: 4,
    headingVar: "var(--font-manrope)",
    bodyVar: "var(--font-sans)",
  },
  bento: {
    id: "bento",
    label: "Cyber Bento Tech",
    description:
      "Futuristic dashboard: rounded tiles 20-24px, neon glow, animated custom selects, ticker marquees, dense bento mosaic.",
    fontHeading: "Space Grotesk",
    fontBody: "Inter",
    radius: 22,
    headingVar: "var(--font-space-grotesk)",
    bodyVar: "var(--font-sans)",
  },
  editorial: {
    id: "editorial",
    label: "Editorial Studio / Industrial Vogue",
    description:
      "Fashion/architecture magazine: bold serif headers, split-screen, lookbook vertical streams, floating geometric attribute grids.",
    fontHeading: "Playfair Display",
    fontBody: "Inter",
    radius: 2,
    headingVar: "var(--font-playfair)",
    bodyVar: "var(--font-sans)",
  },
  hyper: {
    id: "hyper",
    label: "High-Conversion Hyper-Grid",
    description:
      "Shopify Premium / Amazon 2026: sticky multi-level filters, promo sliders, dense tables, quick-buy modals, row selectors, sticky cart bar.",
    fontHeading: "Manrope",
    fontBody: "Inter",
    radius: 10,
    headingVar: "var(--font-manrope)",
    bodyVar: "var(--font-sans)",
  },
  vi: {
    id: "vi",
    label: "ВИ (ВсеИнструменты)",
    description:
      "Клон vseinstrumenti.ru: фирменный красный, светлый фон, карточки с рейтингом, скидкой и кнопкой «В корзину».",
    fontHeading: "Manrope",
    fontBody: "Inter",
    radius: 8,
    headingVar: "var(--font-manrope)",
    bodyVar: "var(--font-sans)",
  },
  arena: {
    id: "arena",
    label: "Arena — торговая арена снабжения",
    description:
      "Тёмный спортивно-индустриальный UI: прожекторы, electric-orange CTA, steel-cyan данные, lime-статусы, brutal bento, scoreboard-цифры.",
    fontHeading: "Space Grotesk",
    fontBody: "Inter",
    radius: 16,
    headingVar: "var(--font-space-grotesk)",
    bodyVar: "var(--font-sans)",
  },
};

const STYLE_TO_CONCEPT: Record<ThemeStyle, ThemeConcept> = {
  minimal: "silk",
  bento: "bento",
  editorial: "editorial",
  commerce: "hyper",
};

export const CONCEPT_OF: Record<ThemePreset, ThemeConcept> = Object.fromEntries(
  (Object.keys(THEME_STYLE_OF) as ThemePreset[]).map((theme) => [
    theme,
    theme === "vi" ? "vi" : theme === "arena" ? "arena" : STYLE_TO_CONCEPT[THEME_STYLE_OF[theme]],
  ])
) as Record<ThemePreset, ThemeConcept>;

export function getThemeConcept(theme: ThemePreset): ThemeConcept {
  return CONCEPT_OF[theme] ?? "hyper";
}

export function getThemeConceptMeta(theme: ThemePreset): ThemeConceptMeta {
  return THEME_CONCEPTS[getThemeConcept(theme)];
}

/** CSS-класс концепции для корневой обёртки витрины */
export function conceptClass(theme: ThemePreset): string {
  return `concept-${getThemeConcept(theme)}`;
}
