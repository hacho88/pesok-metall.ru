import type { ThemePreset } from "@/types/page-builder";
import { THEME_STYLE_OF } from "@/lib/theme-styles";

/** Каждая тема = палитра (.theme-*) + архитектурный стиль (.style-*) */
export const THEME_CLASSES: Record<ThemePreset, string> = Object.fromEntries(
  (Object.keys(THEME_STYLE_OF) as ThemePreset[]).map((t) => [
    t,
    `theme-${t} style-${THEME_STYLE_OF[t]}`,
  ])
) as Record<ThemePreset, string>;
