"use client";

import { ReactNode, useMemo } from "react";
import type { AtlasTokens } from "@/lib/atlas/config-schema";

const RADIUS_MAP = {
  sm: "8px",
  md: "10px",
  lg: "12px",
  xl: "16px",
} as const;

const FONT_MAP: Record<string, string> = {
  Manrope: '"Manrope", system-ui, sans-serif',
  Inter: '"Inter", system-ui, sans-serif',
  "Space Grotesk": '"Space Grotesk", system-ui, sans-serif',
  Roboto: '"Roboto", system-ui, sans-serif',
};

/** Пресеты палитр */
export const PALETTE_PRESETS: Record<string, Partial<AtlasTokens>> = {
  "steel-orange": {
    primary: "#FF6A00", secondary: "#0F172A", accent: "#0369A1",
    bg: "#F5F7FA", surface: "#FFFFFF", surface2: "#EEF2F6",
    text: "#0B1220", textMuted: "#5B6B7F", border: "#DDE3EA",
  },
  "deep-blue": {
    primary: "#1D4ED8", secondary: "#0F172A", accent: "#F97316",
    bg: "#F5F7FA", surface: "#FFFFFF", surface2: "#EEF2F6",
    text: "#0B1220", textMuted: "#5B6B7F", border: "#DDE3EA",
  },
  "emerald-b2b": {
    primary: "#047857", secondary: "#0F172A", accent: "#0EA5E9",
    bg: "#F5F7FA", surface: "#FFFFFF", surface2: "#EEF2F6",
    text: "#0B1220", textMuted: "#5B6B7F", border: "#DDE3EA",
  },
  "graphite-dark": {
    primary: "#FF7A1A", secondary: "#1E293B", accent: "#38BDF8",
    bg: "#0F131A", surface: "#171C24", surface2: "#1F2630",
    text: "#F1F5F9", textMuted: "#94A3B8", border: "#2A3340",
  },
};

export function AtlasTokensProvider({
  tokens,
  children,
}: {
  tokens: AtlasTokens;
  children: ReactNode;
}) {
  const style = useMemo(() => {
    const radius = RADIUS_MAP[tokens.radius] ?? "12px";
    const fontHeading = FONT_MAP[tokens.fontHeading] ?? FONT_MAP.Manrope;
    const fontBody = FONT_MAP[tokens.fontBody] ?? FONT_MAP.Inter;
    const s: Record<string, string> = {
      "--atlas-bg": tokens.bg,
      "--atlas-surface": tokens.surface,
      "--atlas-surface-2": tokens.surface2,
      "--atlas-text": tokens.text,
      "--atlas-text-muted": tokens.textMuted,
      "--atlas-border": tokens.border,
      "--atlas-primary": tokens.primary,
      "--atlas-primary-fg": "#FFFFFF",
      "--atlas-secondary": tokens.secondary,
      "--atlas-secondary-fg": "#FFFFFF",
      "--atlas-accent": tokens.accent,
      "--atlas-success": "#16A34A",
      "--atlas-warning": "#D97706",
      "--atlas-danger": "#DC2626",
      "--atlas-radius-sm": "8px",
      "--atlas-radius-md": "10px",
      "--atlas-radius-lg": radius,
      "--atlas-radius-xl": "16px",
      "--atlas-font-heading": fontHeading,
      "--atlas-font-body": fontBody,
    };
    return s as React.CSSProperties;
  }, [tokens]);

  return (
    <div data-atlas-root style={style}>
      {children}
    </div>
  );
}
