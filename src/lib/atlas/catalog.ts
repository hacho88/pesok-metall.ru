import { prisma } from "@/lib/prisma";
import { transliterate } from "@/lib/parser/translit";
import { Prisma, type ProductType } from "@prisma/client";

// ─── Типы ───────────────────────────────────────────────────────────────────

export interface AtlasCategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  productCount: number; // прямые товары
  totalProductCount: number; // с учётом вложенных
  children: AtlasCategoryNode[];
  imageUrl: string | null;
  type: "METALL" | "BULK" | "MIXED";
}

export interface AtlasProduct {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  type: ProductType;
  price: number | null;
  isOnOrder: boolean;
  unit: string | null;
  weightKg: number;
  density: number | null;
  stock: number;
  inStock: boolean;
  imageUrl: string | null;
  imageLocal: string | null;
  imagePlaceholder: boolean;
  gost: string | null;
  length: string | null;
  weightLabel: string | null;
  description: string | null;
  shortDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: string[];
  viewsCount: number;
  ordersCount: number;
  attributes: { key: string; value: string }[];
}

export interface AtlasFacet {
  key: string;
  label: string;
  values: { value: string; count: number }[];
}

export interface CatalogResult {
  products: AtlasProduct[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: AtlasFacet[];
}

export type SortOption = "popular" | "price_asc" | "price_desc" | "name_asc";

// ─── Дерево категорий ────────────────────────────────────────────────────────

export async function getAtlasCategoryTree(): Promise<AtlasCategoryNode[]> {
  const all = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      products: { select: { type: true }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

  const byParent = new Map<string | null, (typeof all)[number][]>();
  for (const c of all) {
    const key = c.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }

  const countProducts = (c: (typeof all)[number]): number => {
    const direct = c._count.products;
    const children = byParent.get(c.id) ?? [];
    return direct + children.reduce((sum, ch) => sum + countProducts(ch), 0);
  };

  const detectType = (c: (typeof all)[number]): "METALL" | "BULK" | "MIXED" => {
    const children = byParent.get(c.id) ?? [];
    const types = new Set<ProductType>();
    if (c._count.products > 0 && c.products[0]) types.add(c.products[0].type);
    for (const ch of children) {
      const t = detectType(ch);
      if (t === "METALL") types.add("METALL");
      if (t === "BULK") types.add("BAG_30KG");
      if (t === "MIXED") { types.add("METALL"); types.add("BAG_30KG"); }
    }
    const hasMetall = types.has("METALL");
    const hasBulk = types.has("BAG_30KG") || types.has("BIG_BAG_1TON");
    if (hasMetall && hasBulk) return "MIXED";
    if (hasBulk) return "BULK";
    return "METALL";
  };

  const build = (parentId: string | null): AtlasCategoryNode[] => {
    const out: AtlasCategoryNode[] = [];
    for (const c of byParent.get(parentId) ?? []) {
      const children = build(c.id);
      const total = countProducts(c);
      if (c._count.products === 0 && children.length === 0) continue;
      out.push({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parentId,
        productCount: c._count.products,
        totalProductCount: total,
        children,
        imageUrl: null, // будет заполнено скриптом atlas-fix-images
        type: detectType(c),
      });
    }
    return out;
  };

  return build(null);
}

/** Найти узел в дереве по slug */
export function findNodeBySlug(tree: AtlasCategoryNode[], slug: string): AtlasCategoryNode | null {
  for (const node of tree) {
    if (node.slug === slug) return node;
    const child = findNodeBySlug(node.children, slug);
    if (child) return child;
  }
  return null;
}

/** Собрать все ID категории + её потомков */
export function collectCategoryIds(node: AtlasCategoryNode): string[] {
  const ids = [node.id];
  for (const child of node.children) {
    ids.push(...collectCategoryIds(child));
  }
  return ids;
}

// ─── Товары категории с фильтрами ────────────────────────────────────────────

export interface CatalogFilters {
  categorySlug?: string;
  search?: string;
  stock?: "all" | "in_stock" | "on_order";
  priceMin?: number;
  priceMax?: number;
  attributes?: Record<string, string[]>; // key -> [value1, value2]
  sort?: SortOption;
  page?: number;
  perPage?: number;
}

export async function getCatalogProducts(filters: CatalogFilters): Promise<CatalogResult> {
  const tree = await getAtlasCategoryTree();
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.min(96, Math.max(12, filters.perPage ?? 24));

  // Where
  const where: any = { AND: [] };

  if (filters.categorySlug) {
    const node = findNodeBySlug(tree, filters.categorySlug);
    if (node) {
      const ids = collectCategoryIds(node);
      where.AND.push({ categoryId: { in: ids } });
    }
  }

  if (filters.search) {
    const q = normalizeSearch(filters.search);
    where.AND.push({
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { attributes: { some: { value: { contains: filters.search, mode: "insensitive" } } } },
        { category: { name: { contains: filters.search, mode: "insensitive" } } },
      ],
    });
  }

  if (filters.stock === "in_stock") {
    where.AND.push({ isOnOrder: false, stock: { gt: 0 } });
  } else if (filters.stock === "on_order") {
    where.AND.push({ isOnOrder: true });
  }

  if (filters.priceMin != null || filters.priceMax != null) {
    const priceFilter: any = {};
    if (filters.priceMin != null) priceFilter.gte = filters.priceMin;
    if (filters.priceMax != null) priceFilter.lte = filters.priceMax;
    where.AND.push({ priceRetailBase: priceFilter });
  }

  if (filters.attributes) {
    for (const [key, values] of Object.entries(filters.attributes)) {
      if (values.length > 0) {
        where.AND.push({
          attributes: {
            some: {
              key: { equals: key, mode: "insensitive" },
              value: { in: values, mode: "insensitive" },
            },
          },
        });
      }
    }
  }

  // Sort
  const orderBy: any = (() => {
    switch (filters.sort) {
      case "price_asc": return [{ isOnOrder: "asc" }, { priceRetailBase: "asc" }];
      case "price_desc": return [{ isOnOrder: "asc" }, { priceRetailBase: "desc" }];
      case "name_asc": return [{ name: "asc" }];
      default: return [{ ordersCount: "desc" }, { viewsCount: "desc" }, { updatedAt: "desc" }];
    }
  })();

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: { category: true, attributes: true },
    }),
  ]);

  const products = rows.map(toAtlasProduct);

  // Фасеты (до 6 самых частых ключей атрибутов в текущей выборке)
  const facets = await buildFacets(where);

  return {
    products,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
    facets,
  };
}

// ─── Один товар ──────────────────────────────────────────────────────────────

export async function getAtlasProductBySlug(slug: string): Promise<AtlasProduct | null> {
  const decoded = safeDecode(slug);
  const row = await prisma.product.findFirst({
    where: {
      OR: [{ slug: decoded }, { slug: slug }],
    },
    include: { category: true, attributes: true },
  });
  if (!row) return null;
  return toAtlasProduct(row);
}

/** Похожие товары (та же категория, соседние) */
export async function getSimilarProducts(product: AtlasProduct, limit = 8): Promise<AtlasProduct[]> {
  const rows = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isOnOrder: false,
    },
    orderBy: [{ ordersCount: "desc" }, { viewsCount: "desc" }],
    take: limit,
    include: { category: true, attributes: true },
  });
  return rows.map(toAtlasProduct);
}

// ─── Поиск ───────────────────────────────────────────────────────────────────

export async function searchAtlasProducts(
  query: string,
  limit = 20
): Promise<{ products: AtlasProduct[]; categories: AtlasCategoryNode[] }> {
  const q = query.trim();
  if (!q) return { products: [], categories: [] };

  const normalized = normalizeSearch(q);
  const [rows, catRows] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { name: { contains: normalized, mode: "insensitive" } },
          { attributes: { some: { value: { contains: q, mode: "insensitive" } } } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      orderBy: [{ isOnOrder: "asc" }, { ordersCount: "desc" }],
      take: limit,
      include: { category: true, attributes: true },
    }),
    prisma.category.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
        products: { some: {} },
      },
      take: 5,
      orderBy: { name: "asc" },
    }),
  ]);

  const tree = await getAtlasCategoryTree();
  const categories = catRows
    .map((c) => findNodeBySlug(tree, c.slug))
    .filter((n): n is AtlasCategoryNode => n !== null);

  return { products: rows.map(toAtlasProduct), categories };
}

// ─── Хиты продаж ─────────────────────────────────────────────────────────────

export async function getBestsellers(limit = 8): Promise<AtlasProduct[]> {
  const rows = await prisma.product.findMany({
    where: { isOnOrder: false, imageLocal: { not: null } },
    orderBy: [{ ordersCount: "desc" }, { viewsCount: "desc" }],
    take: limit,
    include: { category: true, attributes: true },
  });
  return rows.map(toAtlasProduct);
}

export async function getNewestProducts(limit = 8): Promise<AtlasProduct[]> {
  const rows = await prisma.product.findMany({
    where: { isOnOrder: false },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { category: true, attributes: true },
  });
  return rows.map(toAtlasProduct);
}

export async function getProductsByCategorySlug(slug: string, limit = 8): Promise<AtlasProduct[]> {
  const tree = await getAtlasCategoryTree();
  const node = findNodeBySlug(tree, slug);
  if (!node) return [];
  const ids = collectCategoryIds(node);
  const rows = await prisma.product.findMany({
    where: { categoryId: { in: ids }, isOnOrder: false },
    orderBy: [{ ordersCount: "desc" }, { viewsCount: "desc" }],
    take: limit,
    include: { category: true, attributes: true },
  });
  return rows.map(toAtlasProduct);
}

export async function getOnOrderProducts(limit = 8): Promise<AtlasProduct[]> {
  const rows = await prisma.product.findMany({
    where: { isOnOrder: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: { category: true, attributes: true },
  });
  return rows.map(toAtlasProduct);
}

export async function getProductsByIds(ids: string[]): Promise<AtlasProduct[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { category: true, attributes: true },
  });
  // Сохраняем порядок ids
  const map = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => map.get(id)).filter((r): r is NonNullable<typeof r> => !!r).map(toAtlasProduct);
}

// ─── Вспомогательные ─────────────────────────────────────────────────────────

type ProductRow = Prisma.ProductGetPayload<{ include: { category: true; attributes: true } }>;

export function toAtlasProduct(p: ProductRow): AtlasProduct {
  const gostAttr = p.attributes.find((a) => /гост|gost/i.test(a.key));
  const lengthAttr = p.attributes.find((a) => /длина/i.test(a.key));
  const weightAttr = p.attributes.find((a) => /вес/i.test(a.key));
  const weightKg = Number(p.weightKg) || 0;
  const unit = p.unit ?? null;
  const isLinear = unit === "м" || unit === "п.м" || unit === "пог.м" || unit === "п/м";
  const weightLabel =
    weightAttr?.value ??
    (weightKg > 0
      ? isLinear
        ? `${fmtKg(weightKg)} кг/м`
        : unit === "лист"
          ? `${fmtKg(weightKg)} кг/лист`
          : p.type === "BAG_30KG"
            ? `${fmtKg(weightKg)} кг/мешок`
            : p.type === "BIG_BAG_1TON"
              ? `${fmtKg(weightKg)} кг/биг-бег`
              : `${fmtKg(weightKg)} кг/шт`
      : null);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
    type: p.type,
    price: p.priceRetailBase != null ? Number(p.priceRetailBase) : null,
    isOnOrder: p.isOnOrder,
    unit,
    weightKg,
    density: p.density != null ? Number(p.density) : null,
    stock: p.stock,
    inStock: p.stock > 0 && !p.isOnOrder,
    imageUrl: p.imageUrl,
    imageLocal: p.imageLocal,
    imagePlaceholder: p.imagePlaceholder,
    gost: gostAttr?.value ?? null,
    length: lengthAttr?.value ?? null,
    weightLabel,
    description: p.description,
    shortDescription: p.shortDescription,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    keywords: p.keywords ?? [],
    viewsCount: p.viewsCount,
    ordersCount: p.ordersCount,
    attributes: p.attributes.map((a) => ({ key: a.key, value: a.value })),
  };
}

/** Нормализация поискового запроса: «40х40», «40x40», «40*40» → одно */
export function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[xх*×]/g, "х")
    .replace(/\s+/g, " ")
    .trim();
}

function safeDecode(s: string): string {
  try { return decodeURIComponent(s); } catch { return s; }
}

function fmtKg(n: number): string {
  if (n >= 100) return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  if (n >= 10) return n.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

/** Построение фасетов по атрибутам в текущей выборке */
async function buildFacets(where: any): Promise<AtlasFacet[]> {
  // Берём все атрибуты товаров в выборке (до 200 товаров для фасетов)
  const sampleRows = await prisma.product.findMany({
    where,
    take: 200,
    select: { attributes: { select: { key: true, value: true } } },
  });

  const keyStats = new Map<string, Map<string, number>>();
  for (const row of sampleRows) {
    for (const attr of row.attributes) {
      const k = attr.key;
      const v = attr.value;
      if (!keyStats.has(k)) keyStats.set(k, new Map());
      const valMap = keyStats.get(k)!;
      valMap.set(v, (valMap.get(v) ?? 0) + 1);
    }
  }

  // Сортируем ключи по частоте, берём топ-6
  const sortedKeys = [...keyStats.entries()]
    .sort((a, b) => {
      const aTotal = [...a[1].values()].reduce((s, n) => s + n, 0);
      const bTotal = [...b[1].values()].reduce((s, n) => s + n, 0);
      return bTotal - aTotal;
    })
    .slice(0, 6);

  return sortedKeys.map(([key, valMap]) => ({
    key,
    label: facetLabel(key),
    values: [...valMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([value, count]) => ({ value, count })),
  }));
}

function facetLabel(key: string): string {
  const lower = key.toLowerCase();
  if (lower.includes("диаметр") || lower === "diameter") return "Диаметр";
  if (lower.includes("толщ") || lower === "thickness") return "Толщина стенки";
  if (lower.includes("марка") || lower.includes("сталь")) return "Марка стали";
  if (lower.includes("гост") || lower === "gost") return "ГОСТ";
  if (lower.includes("длина")) return "Длина";
  if (lower.includes("размер")) return "Размер";
  if (lower.includes("фракц")) return "Фракция";
  if (lower.includes("вес")) return "Вес";
  return key.charAt(0).toUpperCase() + key.slice(1);
}
