import { prisma } from "@/lib/prisma";
import type { ThemePreset } from "@/types/page-builder";
import { getBlueprintBySlug } from "@/lib/striker-blueprints";
import type { ThemeConfigBlueprint } from "@/types/striker-engine";

/** Активная тема главной страницы из админки (PageConfig.home.theme) */
export type StorefrontTheme = "city" | "vi" | "city-met" | "ideal" | "atlas";

export const STOREFRONT_THEMES: StorefrontTheme[] = ["city", "vi", "city-met", "ideal", "atlas"];

export function isStorefrontTheme(theme: string | undefined | null): theme is StorefrontTheme {
  return theme === "city" || theme === "vi" || theme === "city-met" || theme === "ideal" || theme === "atlas";
}

/** Товар для витрины: металл + сыпучие, с ГОСТ/атрибутами */
export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  type: string;
  price: number | null;
  isOnOrder: boolean;
  unit: string | null;
  weightKg: number;
  /** Насыпная плотность (т/м³) для сыпучих: песок/щебень/керамзит; null/undefined — металл */
  density?: number | null;
  inStock: boolean;
  imageUrl: string | null;
  imageLocal: string | null;
  gost: string | null;
  length: string | null;
  weightLabel: string | null;
  attributes: { key: string; value: string }[];
}

/** Читает активную тему главной из БД; null = классическая витрина (PageBuilder) */
export async function getActiveStorefrontTheme(): Promise<StorefrontTheme | null> {
  try {
    const config = await prisma.pageConfig.findUnique({ where: { slug: "home" } });
    if (config && isStorefrontTheme(config.theme)) return config.theme;
  } catch {
    // БД недоступна — классическая витрина
  }
  return null;
}

/**
 * Активный STRIKER.Engine чертёж: если PageConfig.home.theme = "striker:*",
 * витрина рендерится динамическим рендерером StrikerStorefront.
 */
export async function getActiveStrikerBlueprint(): Promise<ThemeConfigBlueprint | null> {
  try {
    const config = await prisma.pageConfig.findUnique({ where: { slug: "home" } });
    if (config && config.theme.startsWith("striker:")) {
      return await getBlueprintBySlug(config.theme);
    }
  } catch {
    // БД недоступна — классическая витрина
  }
  return null;
}

/** Выборка товаров для витрины (металл + сыпучие) */
export async function getStorefrontProducts(limit = 60): Promise<StorefrontProduct[]> {
  const rows = await prisma.product.findMany({
    take: limit,
    // Сначала товары с ценами (не «под заказ»), затем свежие — иначе витрина
    // рискует заполниться позициями без цен
    orderBy: [{ isOnOrder: "asc" }, { updatedAt: "desc" }],
    include: { category: true, attributes: true },
  });

  return rows.map((p) => {
    const gostAttr = p.attributes.find((a) => /гост|gost/i.test(a.key));
    const lengthAttr = p.attributes.find((a) => /длина/i.test(a.key));
    const weightAttr = p.attributes.find((a) => /вес/i.test(a.key));
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryName: p.category.name,
      type: p.type,
      price: p.priceRetailBase != null ? Number(p.priceRetailBase) : null,
      isOnOrder: p.isOnOrder,
      unit: p.unit,
      weightKg: Number(p.weightKg),
      density: p.density != null ? Number(p.density) : null,
      inStock: p.stock > 0,
      imageUrl: p.imageUrl,
      imageLocal: p.imageLocal,
      gost: gostAttr?.value ?? null,
      length: lengthAttr?.value ?? null,
      weightLabel: weightAttr?.value ?? null,
      attributes: p.attributes.map((a) => ({ key: a.key, value: a.value })),
    };
  });
}

/** Цена за тонну: для «м» — из веса метра, для «т» — та же */
export function pricePerTon(p: StorefrontProduct): number | null {
  if (p.price == null) return null;
  if (p.unit === "т") return p.price;
  if (p.unit === "м" && p.weightKg > 0) return (p.price / p.weightKg) * 1000;
  return null;
}

/** Тип темы для переключения в админке */
export type { ThemePreset };
