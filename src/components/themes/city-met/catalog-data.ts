/**
 * city-met — гибридная архитектура данных каталога.
 *
 * ДВЕ РАЗНЫЕ ЛОГИКИ ТОВАРОВ:
 *  CASE A — Металлопрокат (спарсен с city-met.ru): строгие промышленные
 *           матрицы цен. Селектор единиц: [ Метры (м) ] / [ Тонны (т) ].
 *  CASE B — Наши сыпучие из админки (песок, щебень, керамзит): продаются
 *           в мешках или россыпью. Селектор единиц: [ Мешки (шт) ] / [ Кубы (м³) ].
 *
 * Зашитые теоретические веса:
 *  - Арматура 12 мм: длина 11.7 м, вес метра 0.888 кг
 *  - Труба профильная 40×40×2: длина 6 м, вес метра 2.42 кг
 *  - Песок речной: 1 м³ = 1.5 тонны, мешок 50 кг
 */
import type { StorefrontProduct } from "@/lib/theme-storefront";

/** Единицы измерения строки таблицы */
export type CityMetUnit = "m" | "t" | "bags" | "m3";

/** Строка каталога city-met (гибридный кадр данных) */
export interface CityMetRow {
  id: string;
  /** Наименование: «Арматура 12 мм А500С рифленая» / «Песок речной мытый в мешках по 50 кг» */
  name: string;
  /** Марка стали (А500С) или фракция (5-20) */
  grade: string;
  /** Норматив: «ГОСТ 5781-82» */
  gost: string;
  /** Раздел верхнего уровня: «Арматура», «Строительные материалы в мешках» */
  category: string;
  /** Подкатегория: «Рифленая А3 А500С», «Песок в мешках» */
  subcategory: string;
  /** Параметрические теги: ["12 мм", "А500С", "рифленая"] */
  tags: string[];
  /** metal — CASE A (Метры/Тонны), bulk — CASE B (Мешки/Кубы) */
  kind: "metal" | "bulk";
  /* ---------- CASE A: металлопрокат ---------- */
  /** Длина изделия в метрах (11.7, 6); null — не применимо */
  lengthM: number | null;
  /** Вес погонного метра в кг (0.888); null — не применимо */
  weightPerMeterKg: number | null;
  /** Цена за метр, ₽ (64.50); null — нет */
  pricePerMeter: number | null;
  /** Цена за тонну, ₽ (72 600); null — нет */
  pricePerTon: number | null;
  /* ---------- CASE B: сыпучие в мешках ---------- */
  /** Вес мешка в кг (50); null — не применимо */
  bagWeightKg: number | null;
  /** Насыпная плотность, т/м³ (1.5); null — не применимо */
  bulkDensityTonsPerM3: number | null;
  /** Цена за мешок, ₽ (85); null — нет */
  pricePerBag: number | null;
  /** Цена за м³, ₽ (850); null — нет */
  pricePerM3: number | null;
  imageUrl: string | null;
  inStock: boolean;
}

/** Дерево разделов city-met.ru: металл (спарсен) + наши сыпучие (админка) */
export const CITY_MET_TREE: { category: string; subcategories: string[] }[] = [
  {
    category: "Арматура",
    subcategories: ["Рифленая А3 А500С", "Гладкая А1"],
  },
  {
    category: "Трубы стальные",
    subcategories: ["Профильные", "Электросварные круглые", "ВГП"],
  },
  {
    category: "Фасонный & листовой прокат",
    subcategories: ["Швеллер", "Уголок", "Лист ГК/ХК"],
  },
  {
    category: "Строительные материалы в мешках",
    subcategories: ["Песок в мешках", "Щебень в мешках", "Керамзит в мешках"],
  },
];

/** Сид-каталог: точная номенклатура city-met.ru с зашитыми теоретическими весами */
export const CITY_MET_SEED_CATALOG: CityMetRow[] = [
  /* ---------- АРМАТУРА ---------- */
  {
    id: "cm-arm-12-a500c",
    name: "Арматура 12 мм А500С рифленая",
    grade: "А500С",
    gost: "ГОСТ 5781-82",
    category: "Арматура",
    subcategory: "Рифленая А3 А500С",
    tags: ["12 мм", "А500С", "рифленая"],
    kind: "metal",
    lengthM: 11.7,
    weightPerMeterKg: 0.888,
    pricePerMeter: 64.5,
    pricePerTon: 72600,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-arm-10-a500c",
    name: "Арматура 10 мм А500С рифленая",
    grade: "А500С",
    gost: "ГОСТ 5781-82",
    category: "Арматура",
    subcategory: "Рифленая А3 А500С",
    tags: ["10 мм", "А500С", "рифленая"],
    kind: "metal",
    lengthM: 11.7,
    weightPerMeterKg: 0.617,
    pricePerMeter: 44.8,
    pricePerTon: 72600,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-arm-16-a500c",
    name: "Арматура 16 мм А500С рифленая",
    grade: "А500С",
    gost: "ГОСТ 5781-82",
    category: "Арматура",
    subcategory: "Рифленая А3 А500С",
    tags: ["16 мм", "А500С", "рифленая"],
    kind: "metal",
    lengthM: 11.7,
    weightPerMeterKg: 1.578,
    pricePerMeter: 114.6,
    pricePerTon: 72600,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-arm-8-a240",
    name: "Арматура 8 мм А240 гладкая",
    grade: "А240",
    gost: "ГОСТ 5781-82",
    category: "Арматура",
    subcategory: "Гладкая А1",
    tags: ["8 мм", "А240", "гладкая"],
    kind: "metal",
    lengthM: 11.7,
    weightPerMeterKg: 0.395,
    pricePerMeter: 27.6,
    pricePerTon: 69800,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-arm-10-a240",
    name: "Арматура 10 мм А240 гладкая",
    grade: "А240",
    gost: "ГОСТ 5781-82",
    category: "Арматура",
    subcategory: "Гладкая А1",
    tags: ["10 мм", "А240", "гладкая"],
    kind: "metal",
    lengthM: 11.7,
    weightPerMeterKg: 0.617,
    pricePerMeter: 43.1,
    pricePerTon: 69800,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },

  /* ---------- ТРУБЫ СТАЛЬНЫЕ ---------- */
  {
    id: "cm-tr-prof-40x40x2",
    name: "Труба профильная 40×40×2",
    grade: "Ст3сп",
    gost: "ГОСТ 8645-68",
    category: "Трубы стальные",
    subcategory: "Профильные",
    tags: ["40×40×2", "профильная"],
    kind: "metal",
    lengthM: 6,
    weightPerMeterKg: 2.42,
    pricePerMeter: 165.8,
    pricePerTon: 68500,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-tr-prof-60x60x3",
    name: "Труба профильная 60×60×3",
    grade: "Ст3сп",
    gost: "ГОСТ 8645-68",
    category: "Трубы стальные",
    subcategory: "Профильные",
    tags: ["60×60×3", "профильная"],
    kind: "metal",
    lengthM: 6,
    weightPerMeterKg: 5.19,
    pricePerMeter: 355.5,
    pricePerTon: 68500,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-tr-es-57x3-5",
    name: "Труба электросварная 57×3.5",
    grade: "Ст3сп",
    gost: "ГОСТ 10704-91",
    category: "Трубы стальные",
    subcategory: "Электросварные круглые",
    tags: ["57×3.5", "электросварная"],
    kind: "metal",
    lengthM: 6,
    weightPerMeterKg: 4.62,
    pricePerMeter: 296.6,
    pricePerTon: 64200,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-tr-vgp-25x3-2",
    name: "Труба ВГП 25×3.2",
    grade: "Ст3сп",
    gost: "ГОСТ 3262-75",
    category: "Трубы стальные",
    subcategory: "ВГП",
    tags: ["25×3.2", "ВГП"],
    kind: "metal",
    lengthM: 6,
    weightPerMeterKg: 1.73,
    pricePerMeter: 110.4,
    pricePerTon: 63800,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },

  /* ---------- ФАСОННЫЙ & ЛИСТОВОЙ ПРОКАТ ---------- */
  {
    id: "cm-shv-10p",
    name: "Швеллер 10П",
    grade: "Ст3сп",
    gost: "ГОСТ 8240-97",
    category: "Фасонный & листовой прокат",
    subcategory: "Швеллер",
    tags: ["10П", "швеллер"],
    kind: "metal",
    lengthM: 12,
    weightPerMeterKg: 8.59,
    pricePerMeter: 525.7,
    pricePerTon: 61200,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-shv-12u",
    name: "Швеллер 12У",
    grade: "Ст3сп",
    gost: "ГОСТ 8240-97",
    category: "Фасонный & листовой прокат",
    subcategory: "Швеллер",
    tags: ["12У", "швеллер"],
    kind: "metal",
    lengthM: 12,
    weightPerMeterKg: 10.4,
    pricePerMeter: 636.5,
    pricePerTon: 61200,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-ug-50x50x5",
    name: "Уголок 50×50×5 равнополочный",
    grade: "Ст3сп",
    gost: "ГОСТ 8509-93",
    category: "Фасонный & листовой прокат",
    subcategory: "Уголок",
    tags: ["50×50×5", "уголок"],
    kind: "metal",
    lengthM: 12,
    weightPerMeterKg: 3.77,
    pricePerMeter: 236.8,
    pricePerTon: 62800,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-list-3-gk",
    name: "Лист гладкий 3 мм ГК",
    grade: "Ст3сп",
    gost: "ГОСТ 19903-2015",
    category: "Фасонный & листовой прокат",
    subcategory: "Лист ГК/ХК",
    tags: ["3 мм", "ГК", "1.25×2.5 м"],
    kind: "metal",
    lengthM: 2.5,
    weightPerMeterKg: 29.44,
    pricePerMeter: null,
    pricePerTon: 58900,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-list-3-hk",
    name: "Лист гладкий 3 мм ХК",
    grade: "08пс",
    gost: "ГОСТ 19904-2015",
    category: "Фасонный & листовой прокат",
    subcategory: "Лист ГК/ХК",
    tags: ["3 мм", "ХК", "1.25×2.5 м"],
    kind: "metal",
    lengthM: 2.5,
    weightPerMeterKg: 29.44,
    pricePerMeter: null,
    pricePerTon: 59500,
    bagWeightKg: null,
    bulkDensityTonsPerM3: null,
    pricePerBag: null,
    pricePerM3: null,
    imageUrl: null,
    inStock: true,
  },

  /* ---------- СТРОИТЕЛЬНЫЕ МАТЕРИАЛЫ В МЕШКАХ (наши, из админки) ---------- */
  {
    id: "cm-pesok-kariernyy",
    name: "Песок карьерный в мешках по 50 кг",
    grade: "карьерный",
    gost: "ГОСТ 8736-2014",
    category: "Строительные материалы в мешках",
    subcategory: "Песок в мешках",
    tags: ["карьерный", "50 кг"],
    kind: "bulk",
    lengthM: null,
    weightPerMeterKg: null,
    pricePerMeter: null,
    pricePerTon: null,
    bagWeightKg: 50,
    bulkDensityTonsPerM3: 1.5,
    pricePerBag: 85,
    pricePerM3: 850,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-pesok-rechnoy",
    name: "Песок речной мытый в мешках по 50 кг",
    grade: "речной",
    gost: "ГОСТ 8736-2014",
    category: "Строительные материалы в мешках",
    subcategory: "Песок в мешках",
    tags: ["речной", "мытый", "50 кг"],
    kind: "bulk",
    lengthM: null,
    weightPerMeterKg: null,
    pricePerMeter: null,
    pricePerTon: null,
    bagWeightKg: 50,
    bulkDensityTonsPerM3: 1.5,
    pricePerBag: 115,
    pricePerM3: 1150,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-pesok-mytyy",
    name: "Песок мытый (намывной) в мешках по 50 кг",
    grade: "мытый",
    gost: "ГОСТ 8736-2014",
    category: "Строительные материалы в мешках",
    subcategory: "Песок в мешках",
    tags: ["мытый", "50 кг"],
    kind: "bulk",
    lengthM: null,
    weightPerMeterKg: null,
    pricePerMeter: null,
    pricePerTon: null,
    bagWeightKg: 50,
    bulkDensityTonsPerM3: 1.5,
    pricePerBag: 130,
    pricePerM3: 1250,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-scheben-5-20",
    name: "Щебень гранитный фракция 5-20 в мешках по 50 кг",
    grade: "5-20",
    gost: "ГОСТ 8267-93",
    category: "Строительные материалы в мешках",
    subcategory: "Щебень в мешках",
    tags: ["5-20", "гранитный", "50 кг"],
    kind: "bulk",
    lengthM: null,
    weightPerMeterKg: null,
    pricePerMeter: null,
    pricePerTon: null,
    bagWeightKg: 50,
    bulkDensityTonsPerM3: 1.4,
    pricePerBag: 130,
    pricePerM3: 2450,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-scheben-20-40",
    name: "Щебень гранитный фракция 20-40 в мешках по 50 кг",
    grade: "20-40",
    gost: "ГОСТ 8267-93",
    category: "Строительные материалы в мешках",
    subcategory: "Щебень в мешках",
    tags: ["20-40", "гранитный", "50 кг"],
    kind: "bulk",
    lengthM: null,
    weightPerMeterKg: null,
    pricePerMeter: null,
    pricePerTon: null,
    bagWeightKg: 50,
    bulkDensityTonsPerM3: 1.38,
    pricePerBag: 125,
    pricePerM3: 2350,
    imageUrl: null,
    inStock: true,
  },
  {
    id: "cm-keramzit-10-20",
    name: "Керамзит фракция 10-20 в мешках по 50 кг",
    grade: "10-20",
    gost: "ГОСТ 9757-90",
    category: "Строительные материалы в мешках",
    subcategory: "Керамзит в мешках",
    tags: ["10-20", "керамзит", "50 кг"],
    kind: "bulk",
    lengthM: null,
    weightPerMeterKg: null,
    pricePerMeter: null,
    pricePerTon: null,
    bagWeightKg: 50,
    bulkDensityTonsPerM3: 0.45,
    pricePerBag: 175,
    pricePerM3: 1450,
    imageUrl: null,
    inStock: true,
  },
];

/** Нормализация имени для дедупликации */
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[\s×х]+/g, "");
}

/** Извлечь насыпную плотность (т/м³) из строки вида «1600 кг/м³» */
function parseDensityTonsPerM3(weightLabel: string | null): number | null {
  if (!weightLabel) return null;
  const m = weightLabel.replace(/\s/g, "").match(/(\d+(?:[.,]\d+)?)кг\/м3/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  // 1600 кг/м³ → 1.6 т/м³; если уже в тоннах (1.5) — оставляем
  return n > 10 ? n / 1000 : n;
}

/** Нормализация плотности из БД: кг/м³ → т/м³ */
function normalizeDensity(density: number | null | undefined): number | null {
  if (density == null || !Number.isFinite(density) || density <= 0) return null;
  return density > 10 ? density / 1000 : density;
}

/** Маппинг реального товара витрины в гибридный кадр city-met */
function mapStorefrontProduct(p: StorefrontProduct): CityMetRow {
  const isMetal = p.type === "METALL";
  const density = normalizeDensity(p.density) ?? parseDensityTonsPerM3(p.weightLabel);
  const lengthM = p.length ? (parseFloat(p.length.replace(",", ".")) || null) : null;
  const weightPerMeterKg = isMetal && p.weightKg > 0 ? p.weightKg : null;
  const pricePerTon = p.price != null && p.unit === "т" ? p.price : null;
  const pricePerMeter = isMetal && p.price != null && p.unit === "м" ? p.price : null;
  const pricePerBag = !isMetal && p.price != null && (p.unit === "шт" || p.unit === "мешок") ? p.price : null;
  const pricePerM3 = !isMetal && p.price != null && p.unit === "м³" ? p.price : null;
  const bagWeightKg = !isMetal && p.weightKg > 0 ? p.weightKg : null;

  return {
    id: `real-${p.id}`,
    name: p.name,
    grade: "—",
    gost: p.gost ?? "—",
    category: isMetal ? p.categoryName : "Строительные материалы в мешках",
    subcategory: isMetal ? p.categoryName : p.categoryName,
    tags: [p.categoryName, p.gost ?? ""].filter(Boolean),
    kind: isMetal ? "metal" : "bulk",
    lengthM,
    weightPerMeterKg,
    pricePerMeter,
    pricePerTon,
    bagWeightKg,
    bulkDensityTonsPerM3: density,
    pricePerBag,
    pricePerM3,
    imageUrl: p.imageLocal ?? p.imageUrl,
    inStock: p.inStock,
  };
}

/** Сборка каталога: сид-номенклатура city-met.ru + реальные товары из БД (дедупликация) */
export function buildCatalog(products: StorefrontProduct[]): CityMetRow[] {
  const rows = [...CITY_MET_SEED_CATALOG];
  const seen = new Set(rows.map((r) => normalizeName(r.name)));
  for (const p of products) {
    const key = normalizeName(p.name);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(mapStorefrontProduct(p));
  }
  return rows;
}

/** Вес строки в тоннах по выбранной единице */
export function rowWeightTons(row: CityMetRow, quantity: number, unit: CityMetUnit): number {
  if (quantity <= 0) return 0;
  if (row.kind === "bulk") {
    // Мешки: Qty * BagWeight / 1000; Кубы: Qty * BulkDensity
    const bagKg = row.bagWeightKg ?? 50;
    const dens = row.bulkDensityTonsPerM3 ?? 1.5;
    return unit === "bags" ? (quantity * bagKg) / 1000 : quantity * dens;
  }
  // Металл: Метры: Qty * weightPerMeter / 1000; Тонны: Qty
  const wpm = row.weightPerMeterKg ?? 0;
  return unit === "m" ? (quantity * wpm) / 1000 : quantity;
}

/** Обратная конвертация (помощник под полем количества) */
export function rowInverseUnit(row: CityMetRow, quantity: number, unit: CityMetUnit): number {
  if (quantity <= 0) return 0;
  if (row.kind === "bulk") {
    const bagKg = row.bagWeightKg ?? 50;
    const dens = row.bulkDensityTonsPerM3 ?? 1.5;
    // Мешки → м³: (Qty * BagWeight) / (Density * 1000); Кубы → мешки: (Qty * Density * 1000) / BagWeight
    return unit === "bags" ? (quantity * bagKg) / (dens * 1000) : (quantity * dens * 1000) / bagKg;
  }
  const wpm = row.weightPerMeterKg ?? 0;
  if (wpm <= 0) return 0;
  // Метры → тонны: (Qty * weightPerMeter) / 1000; Тонны → метры: (Qty * 1000) / weightPerMeter
  return unit === "m" ? (quantity * wpm) / 1000 : (quantity * 1000) / wpm;
}

/** Цена за выбранную единицу */
export function rowUnitPrice(row: CityMetRow, unit: CityMetUnit): number | null {
  if (row.kind === "bulk") {
    return unit === "bags" ? row.pricePerBag : row.pricePerM3;
  }
  return unit === "m" ? row.pricePerMeter : row.pricePerTon;
}

/** Метка единицы для корзины */
export const CITY_MET_UNIT_LABEL: Record<CityMetUnit, string> = {
  m: "м",
  t: "т",
  bags: "шт",
  m3: "м³",
};
