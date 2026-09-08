import { prisma } from "@/lib/prisma";

export type Product = {
  id: string;
  title: string;
  slug: string;
  length: string;
  weight: string;
  pricePerMeter: number;
  pricePerTon: number;
  pricePerUnit: number;
  unit: string;
  unitLabel: string;
  weightLabel: string;
  inStock: boolean;
  gost: string | null;
  imageUrl: string | null;
  imageLocal: string | null;
  subcategory: string | null;
  attributes: { key: string; value: string }[];
};

export type SubcategoryRef = {
  name: string;
  slug: string;
  count: number;
};

export type Category = {
  slug: string;
  title: string;
  subcategories: string[];
  subcategoryRefs: SubcategoryRef[];
  intro: string;
  imageUrl: string | null;
  products: Product[];
};

/** Лёгкая навигация для сайдбара: без товаров — на порядки меньше данных в payload */
export type CatalogNav = Pick<Category, "slug" | "title" | "subcategoryRefs" | "imageUrl">;

export const deliveryCities = [
  "Москва",
  "Балашиха",
  "Подольск",
  "Митино",
  "Люберцы",
  "Химки",
  "Мытищи",
  "Королёв",
  "Одинцово",
  "Домодедово",
];

/** Build catalog tree from Prisma — matches v0 theme format */

// Кэш в памяти: каталог меняется редко, а запрашивается на каждой странице.
// TTL 60 сек; админские мутации вызывают invalidateCatalogCache() для мгновенного обновления.
let catalogCache: { data: Category[]; at: number } | null = null;
const CATALOG_TTL_MS = 60_000;

export function invalidateCatalogCache(): void {
  catalogCache = null;
  navCache = null;
}

export async function getCatalog(): Promise<Category[]> {
  if (catalogCache && Date.now() - catalogCache.at < CATALOG_TTL_MS) {
    return catalogCache.data;
  }

  const roots = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { products: true } },
          products: {
            include: { attributes: true },
            orderBy: { name: "asc" },
          },
        },
      },
      products: {
        include: { attributes: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const data = roots.map((root) => {
    const childProducts = root.children.flatMap((child) =>
      child.products.map((p) => mapProduct(p, child.name))
    );
    const rootProducts = root.products.map((p) => mapProduct(p, root.name));
    const allProducts = [...rootProducts, ...childProducts];

    return {
      slug: root.slug,
      title: root.name,
      subcategories: root.children.map((c) => c.name),
      subcategoryRefs: root.children.map((c) => ({
        name: c.name,
        slug: c.slug,
        count: c._count.products,
      })),
      intro: root.description || `${root.name} — доставка в день заказа по Москве и МО.`,
      imageUrl: root.imageUrl,
      products: allProducts,
    };
  });

  catalogCache = { data, at: Date.now() };
  return data;
}

// Кэш навигации (структура категорий без товаров) — общий TTL
let navCache: { data: CatalogNav[]; at: number } | null = null;

export function invalidateCatalogNavCache(): void {
  navCache = null;
}

/** Дерево категорий для сайдбара: slug, название, подкатегории со счётчиками — без товаров */
export async function getCatalogNav(): Promise<CatalogNav[]> {
  if (navCache && Date.now() - navCache.at < CATALOG_TTL_MS) {
    return navCache.data;
  }
  const full = await getCatalog();
  const nav = full.map((c) => ({
    slug: c.slug,
    title: c.title,
    subcategoryRefs: c.subcategoryRefs,
    imageUrl: c.imageUrl,
  }));
  navCache = { data: nav, at: Date.now() };
  return nav;
}

/** Товары, закреплённые в боксах на главной (раздел «Боксы»); пусто — авто-режим из сыпучих */
export async function getHeroBoxProducts(): Promise<Product[]> {
  const boxes = await prisma.heroBox.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      product: {
        include: { attributes: true, category: { select: { name: true } } },
      },
    },
  });
  return boxes.map((b) => mapProduct(b.product, b.product.category.name));
}

function mapProduct(
  p: any,
  subcategory: string
): Product {
  const lengthAttr = p.attributes?.find((a: any) => /длина|length/i.test(a.key));
  const weightAttr = p.attributes?.find((a: any) => /вес|weight/i.test(a.key));
  const gostAttr = p.attributes?.find((a: any) => /гост|gost/i.test(a.key));

  const price = p.priceRetailBase != null ? Number(p.priceRetailBase) : null;
  const type: string = p.type || "METALL";

  // Человекочитаемая единица: мешок/биг-бег для сыпучих, иначе unit из БД
  const unitLabel =
    type === "BAG_30KG" ? "мешок" : type === "BIG_BAG_1TON" ? "биг-бег" : (p.unit ?? "шт");

  // Вес: для погонажа (м) — кг/м, для штучного — кг/шт
  const weightNum = p.weightKg != null ? Math.round(Number(p.weightKg) * 1000) / 1000 : null;
  const weightLabel =
    weightAttr?.value ??
    (weightNum != null ? `${weightNum} кг${unitLabel === "м" ? "/м" : unitLabel === "уп" ? "/уп" : ""}` : "—");

  // Determine price display based on unit
  let pricePerMeter = 0;
  let pricePerTon = 0;
  let pricePerUnit = 0;
  if (price != null) {
    if (unitLabel === "м") pricePerMeter = price;
    else if (unitLabel === "т") pricePerTon = price;
    else pricePerUnit = price; // шт, лист, уп, кг, мешок, биг-бег
  }

  // Цена за тонну — ТОЛЬКО для стального проката, продаваемого метрами
  // (арматура, трубы, балка, швеллер, уголок, полоса, катанка).
  // Листы, сетки, фасонина, мешки, стеклопластик тоннами НЕ продаются — одна цена.
  const isComposite = /стеклопластик|композит/i.test(p.name);
  const weightNum2 = p.weightKg != null ? Number(p.weightKg) : 0;
  if (price != null && unitLabel === "м" && !isComposite && weightNum2 > 0) {
    pricePerTon = Math.round((price / weightNum2) * 1000);
  }

  return {
    id: p.id,
    title: p.name,
    slug: p.slug,
    length: lengthAttr?.value || "—",
    weight: weightLabel,
    pricePerMeter,
    pricePerTon,
    pricePerUnit,
    unit: unitLabel,
    unitLabel,
    weightLabel,
    inStock: p.stock > 0,
    gost: gostAttr?.value || null,
    imageUrl: p.imageUrl,
    imageLocal: p.imageLocal,
    subcategory,
    attributes: (p.attributes ?? []).map((a: any) => ({ key: a.key, value: a.value })),
  };
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const catalog = await getCatalog();
  return catalog.find((c) => c.slug === slug);
}

export async function getCategorySlugs(): Promise<string[]> {
  const roots = await prisma.category.findMany({
    where: { parentId: null },
    select: { slug: true },
  });
  return roots.map((r) => r.slug);
}
