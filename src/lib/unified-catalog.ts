import { prisma } from "@/lib/prisma";
import type { CategoryNode } from "@/components/catalog/CategorySidebar";

// Единый каталог: металл + песок/щебень вместе, без разделения на разделы
export interface UnifiedProduct {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  type: "METALL" | "BAG_30KG" | "BIG_BAG_1TON" | "GENERAL_CONSTRUCTION";
  price: number | null;
  isOnOrder: boolean;
  unit: string | null;
  weightKg: number;
  inStock: boolean;
  imageUrl: string | null;
  imageLocal: string | null;
  groupId: string | null;
  groupName: string | null;
  length: string | null;
  weightLabel: string | null;
  attributes: { key: string; value: string }[];
}

// Полное дерево категорий (все товары всех типов)
export async function getUnifiedTree(): Promise<CategoryNode[]> {
  const all = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  // Строим дерево любой глубины и обрезаем ветки без товаров
  const byParent = new Map<string | null, (typeof all)[number][]>();
  for (const c of all) {
    const key = c.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }

  const build = (parentId: string | null): CategoryNode[] => {
    const out: CategoryNode[] = [];
    for (const c of byParent.get(parentId) ?? []) {
      const children = build(c.id);
      if (c._count.products === 0 && children.length === 0) continue;
      out.push({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
        children,
      });
    }
    return out;
  };

  return build(null);
}

// Все товары единым списком (металл + сыпучие)
export async function getUnifiedProducts(limit = 1000): Promise<UnifiedProduct[]> {
  const rows = await prisma.product.findMany({
    take: limit,
    orderBy: { updatedAt: "desc" },
    include: { category: true, attributes: true },
  });

  return rows.map((p) => {
    const lengthAttr = p.attributes.find((a) => /длина/i.test(a.key));
    const weightAttr = p.attributes.find((a) => /вес/i.test(a.key));
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      type: p.type,
      price: p.priceRetailBase != null ? Number(p.priceRetailBase) : null,
      isOnOrder: p.isOnOrder,
      unit: p.unit,
      weightKg: Number(p.weightKg),
      inStock: p.stock > 0,
      imageUrl: p.imageUrl,
      imageLocal: p.imageLocal,
      groupId: p.groupId,
      groupName: p.groupName,
      length: lengthAttr?.value ?? null,
      weightLabel: weightAttr?.value ?? null,
      attributes: p.attributes.map((a) => ({ key: a.key, value: a.value })),
    };
  });
}

export function totalInUnifiedTree(categories: CategoryNode[]): number {
  return categories.reduce(
    (sum, c) => sum + c.productCount + totalInUnifiedTree(c.children),
    0
  );
}
