import type { Prisma } from "@prisma/client";

export type ProductWithGeo = Prisma.ProductGetPayload<{
  include: {
    category: true;
    attributes: true;
    geoData: { where: { geoZoneId: string } };
  };
}>;

export interface AtlasPrice {
  /** Цена за единицу (м, шт, лист, мешок) в выбранной геозоне или базовая */
  perUnit: number | null;
  /** Цена за тонну (для металла с весом метра) */
  perTon: number | null;
  /** Единица измерения */
  unit: string | null;
  /** Товар «под заказ» (нет цены) */
  isOnOrder: boolean;
  /** Метка единицы для UI: «₽/м», «₽/т», «₽/мешок 30 кг», «₽/биг-бег 1 т» */
  unitLabel: string;
  /** Метка цены за тонну для UI: «≈ 65 957 ₽/т» или null */
  perTonLabel: string | null;
}

/** Цена с учётом геозоны: GeoProductData.localPrice, иначе базовая priceRetailBase */
export function resolvePrice(
  product: ProductWithGeo,
  geoZoneId: string | null
): AtlasPrice {
  const localGeo = geoZoneId
    ? product.geoData.find((g) => g.geoZoneId === geoZoneId)
    : null;
  const base = product.priceRetailBase != null ? Number(product.priceRetailBase) : null;
  const perUnit = localGeo ? Number(localGeo.localPrice) : base;
  const isOnOrder = perUnit == null || product.isOnOrder;

  const unit = product.unit ?? null;
  const weightKg = Number(product.weightKg) || 0;

  // Цена за тонну: для «м» — из веса метра; для «т» — та же цена
  let perTon: number | null = null;
  if (perUnit != null) {
    if (unit === "т") {
      perTon = perUnit;
    } else if ((unit === "м" || unit === "п.м" || unit === "пог.м" || unit === "п/м") && weightKg > 0) {
      perTon = (perUnit / weightKg) * 1000;
    }
  }

  const unitLabel = formatUnitLabel(unit, product.type, weightKg);
  const perTonLabel = perTon != null ? `≈ ${formatRub(perTon)} ₽/т` : null;

  return { perUnit, perTon, unit, isOnOrder, unitLabel, perTonLabel };
}

/** Метка единицы измерения для UI */
export function formatUnitLabel(
  unit: string | null,
  type: string,
  weightKg: number
): string {
  if (unit === "м" || unit === "п.м" || unit === "пог.м" || unit === "п/м") return "₽/м";
  if (unit === "т") return "₽/т";
  if (unit === "шт") return "₽/шт";
  if (unit === "лист") return "₽/лист";
  if (type === "BAG_30KG" || weightKg === 30) return "₽/мешок 30 кг";
  if (type === "BIG_BAG_1TON" || weightKg === 1000) return "₽/биг-бег 1 т";
  return unit ? `₽/${unit}` : "₽";
}

export function formatRub(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatRubDetailed(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(value);
}
