import type { CSSProperties } from "react";

export type HeroBackgroundType = "solid" | "gradient" | "image" | "video";
export type HeroLayout = "stacked-center" | "stacked-left" | "split" | "split-reverse";
export type HeroAlign = "left" | "center" | "right";
export type HeroObjectFit = "cover" | "contain";

export interface Spacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface HeroBackground {
  type: HeroBackgroundType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  imageUrl: string;
  videoUrl: string;
  overlayColor: string;
  overlayOpacity: number;
}

interface HeroElementBase {
  id: string;
  align: HeroAlign;
  margin: Spacing;
  padding: Spacing;
}

export interface HeroHeadingElement extends HeroElementBase {
  type: "heading";
  text: string;
  fontSize: number;
  fontWeight: number;
  color: string;
}

export interface HeroParagraphElement extends HeroElementBase {
  type: "paragraph";
  text: string;
  fontSize: number;
  fontWeight: number;
  color: string;
}

export interface HeroButtonElement extends HeroElementBase {
  type: "button";
  text: string;
  href: string;
  bgColor: string;
  textColor: string;
  hoverBgColor: string;
  hoverScale: number;
  fontSize: number;
  fontWeight: number;
  borderRadius: number;
}

export interface HeroMediaElement extends HeroElementBase {
  type: "media";
  mediaType: "image" | "video";
  src: string;
  width: number;
  height: number;
  objectFit: HeroObjectFit;
  borderRadius: number;
}

export type HeroElement =
  | HeroHeadingElement
  | HeroParagraphElement
  | HeroButtonElement
  | HeroMediaElement;

export interface HeroConfig {
  background: HeroBackground;
  layout: HeroLayout;
  minHeight: number;
  elements: HeroElement[];
}

export const HERO_LAYOUT_LABELS: Record<HeroLayout, string> = {
  "stacked-center": "Всё по центру",
  "stacked-left": "Всё слева",
  split: "Контент слева / медиа справа",
  "split-reverse": "Медиа слева / контент справа",
};

export const HERO_ALIGN_LABELS: Record<HeroAlign, string> = {
  left: "По левому краю",
  center: "По центру",
  right: "По правому краю",
};

export const FONT_WEIGHTS = [300, 400, 500, 600, 700, 800, 900] as const;

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function zeroSpacing(): Spacing {
  return { top: 0, right: 0, bottom: 0, left: 0 };
}

export function spacingToStyle(s: Spacing): CSSProperties {
  return {
    marginTop: s.top,
    marginRight: s.right,
    marginBottom: s.bottom,
    marginLeft: s.left,
  };
}

export function paddingToStyle(s: Spacing): CSSProperties {
  return {
    paddingTop: s.top,
    paddingRight: s.right,
    paddingBottom: s.bottom,
    paddingLeft: s.left,
  };
}

const asNum = (v: unknown, d: number) =>
  typeof v === "number" && Number.isFinite(v) ? v : d;
const asStr = (v: unknown, d: string) => (typeof v === "string" ? v : d);

function normalizeSpacing(raw: unknown): Spacing {
  const s = (raw ?? {}) as Record<string, unknown>;
  return {
    top: asNum(s.top, 0),
    right: asNum(s.right, 0),
    bottom: asNum(s.bottom, 0),
    left: asNum(s.left, 0),
  };
}

function normalizeElement(raw: unknown): HeroElement {
  const el = (raw ?? {}) as Record<string, unknown>;
  const base = {
    id: asStr(el.id, "") || uid(),
    align: (["left", "center", "right"].includes(el.align as string)
      ? el.align
      : "left") as HeroAlign,
    margin: normalizeSpacing(el.margin),
    padding: normalizeSpacing(el.padding),
  };
  switch (el.type) {
    case "heading":
      return {
        ...base,
        type: "heading",
        text: asStr(el.text, "Заголовок"),
        fontSize: asNum(el.fontSize, 40),
        fontWeight: asNum(el.fontWeight, 800),
        color: asStr(el.color, "#ffffff"),
      };
    case "paragraph":
      return {
        ...base,
        type: "paragraph",
        text: asStr(el.text, ""),
        fontSize: asNum(el.fontSize, 16),
        fontWeight: asNum(el.fontWeight, 400),
        color: asStr(el.color, "#e2e8f0"),
      };
    case "button":
      return {
        ...base,
        type: "button",
        text: asStr(el.text, "Кнопка"),
        href: asStr(el.href, "#"),
        bgColor: asStr(el.bgColor, "#2563eb"),
        textColor: asStr(el.textColor, "#ffffff"),
        hoverBgColor: asStr(el.hoverBgColor, "#1d4ed8"),
        hoverScale: asNum(el.hoverScale, 1.04),
        fontSize: asNum(el.fontSize, 15),
        fontWeight: asNum(el.fontWeight, 700),
        borderRadius: asNum(el.borderRadius, 12),
      };
    case "media":
      return {
        ...base,
        type: "media",
        mediaType: el.mediaType === "video" ? "video" : "image",
        src: asStr(el.src, ""),
        width: asNum(el.width, 100),
        height: asNum(el.height, 280),
        objectFit: el.objectFit === "contain" ? "contain" : "cover",
        borderRadius: asNum(el.borderRadius, 16),
      };
    default:
      return {
        ...base,
        type: "paragraph",
        text: asStr(el.text, ""),
        fontSize: asNum(el.fontSize, 16),
        fontWeight: asNum(el.fontWeight, 400),
        color: asStr(el.color, "#e2e8f0"),
      };
  }
}

export function normalizeHeroConfig(raw: unknown): HeroConfig {
  const r = (raw ?? {}) as Record<string, unknown>;
  const bg = (r.background ?? {}) as Record<string, unknown>;
  const bgType = ["solid", "gradient", "image", "video"].includes(
    bg.type as string
  )
    ? (bg.type as HeroBackgroundType)
    : "gradient";
  return {
    background: {
      type: bgType,
      color: asStr(bg.color, "#0f172a"),
      gradientFrom: asStr(bg.gradientFrom, "#0b1e3a"),
      gradientTo: asStr(bg.gradientTo, "#1d4ed8"),
      gradientAngle: asNum(bg.gradientAngle, 135),
      imageUrl: asStr(bg.imageUrl, ""),
      videoUrl: asStr(bg.videoUrl, ""),
      overlayColor: asStr(bg.overlayColor, "#000000"),
      overlayOpacity: Math.min(
        100,
        Math.max(0, asNum(bg.overlayOpacity, 0))
      ),
    },
    layout: (["stacked-center", "stacked-left", "split", "split-reverse"].includes(
      r.layout as string
    )
      ? r.layout
      : "stacked-left") as HeroLayout,
    minHeight: asNum(r.minHeight, 520),
    elements: Array.isArray(r.elements) ? r.elements.map(normalizeElement) : [],
  };
}

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  background: {
    type: "gradient",
    color: "#0f172a",
    gradientFrom: "#0b1e3a",
    gradientTo: "#1d4ed8",
    gradientAngle: 135,
    imageUrl: "",
    videoUrl: "",
    overlayColor: "#000000",
    overlayOpacity: 15,
  },
  layout: "split",
  minHeight: 520,
  elements: [
    {
      id: uid(),
      type: "heading",
      text: "Металлопрокат с доставкой в день заказа",
      fontSize: 52,
      fontWeight: 900,
      color: "#ffffff",
      align: "left",
      margin: { top: 0, right: 0, bottom: 16, left: 0 },
      padding: zeroSpacing(),
    },
    {
      id: uid(),
      type: "paragraph",
      text: "Арматура, трубы, листы и сетка со склада в Москве. Резка в размер, ГОСТ, отгрузка день в день.",
      fontSize: 18,
      fontWeight: 400,
      color: "#dbeafe",
      align: "left",
      margin: { top: 0, right: 0, bottom: 24, left: 0 },
      padding: zeroSpacing(),
    },
    {
      id: uid(),
      type: "button",
      text: "Смотреть каталог",
      href: "/shop",
      bgColor: "#ffffff",
      textColor: "#1d4ed8",
      hoverBgColor: "#dbeafe",
      hoverScale: 1.04,
      fontSize: 15,
      fontWeight: 700,
      borderRadius: 14,
      align: "left",
      margin: zeroSpacing(),
      padding: zeroSpacing(),
    },
    {
      id: uid(),
      type: "button",
      text: "Рассчитать доставку",
      href: "/kalkulyator-dostavki",
      bgColor: "#2563eb",
      textColor: "#ffffff",
      hoverBgColor: "#1d4ed8",
      hoverScale: 1.04,
      fontSize: 15,
      fontWeight: 700,
      borderRadius: 14,
      align: "left",
      margin: zeroSpacing(),
      padding: zeroSpacing(),
    },
    {
      id: uid(),
      type: "media",
      mediaType: "image",
      src: "/materials/metalloprokat.png",
      width: 100,
      height: 320,
      objectFit: "cover",
      borderRadius: 24,
      align: "center",
      margin: zeroSpacing(),
      padding: zeroSpacing(),
    },
  ],
};
