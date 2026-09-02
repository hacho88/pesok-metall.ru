import { prisma } from "@/lib/prisma";
import type { CategoryNode } from "@/components/catalog/CategorySidebar";
import type { SandProductData } from "@/components/catalog/SandProductCard";

// Категории с товарами «Песок и щебень» (мешки/биг-бэги)
export async function getSandTree(): Promise<CategoryNode[]> {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
      OR: [
        {
          products: {
            some: { type: { in: ["BAG_30KG", "BIG_BAG_1TON"] } },
          },
        },
        {
          children: {
            some: {
              products: {
                some: { type: { in: ["BAG_30KG", "BIG_BAG_1TON"] } },
              },
            },
          },
        },
      ],
    },
    include: {
      children: {
        where: {
          products: {
            some: { type: { in: ["BAG_30KG", "BIG_BAG_1TON"] } },
          },
        },
        include: {
          _count: {
            select: {
              products: { where: { type: { in: ["BAG_30KG", "BIG_BAG_1TON"] } } },
            },
          },
        },
      },
      _count: {
        select: {
          products: { where: { type: { in: ["BAG_30KG", "BIG_BAG_1TON"] } } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products,
    children: c.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      productCount: child._count.products,
      children: [],
    })),
  }));
}

interface SandProductRow {
  id: string;
  name: string;
  slug: string;
  category: { name: string };
  priceRetailBase: { toString(): string } | null;
  isOnOrder: boolean;
  unit: string | null;
  weightKg: { toString(): string };
  imageUrl: string | null;
  imageLocal: string | null;
  attributes: { key: string; value: string }[];
}

export function toSandProduct(p: SandProductRow): SandProductData {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryName: p.category.name,
    price: p.priceRetailBase != null ? Number(p.priceRetailBase) : null,
    isOnOrder: p.isOnOrder,
    unit: p.unit,
    weightKg: Number(p.weightKg),
    imageUrl: p.imageUrl,
    imageLocal: p.imageLocal,
    attributes: p.attributes.map((a) => ({ key: a.key, value: a.value })),
  };
}
