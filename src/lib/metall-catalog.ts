import { prisma } from "@/lib/prisma";
import type { CategoryNode } from "@/components/catalog/CategorySidebar";
import type { MetalProductData } from "@/components/catalog/MetalTable";

// Полное дерево категорий со всеми товарами (Металл + Песок/Щебень)
export async function getFullTree(): Promise<CategoryNode[]> {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
      OR: [
        { products: { some: {} } },
        { children: { some: { products: { some: {} } } } },
      ],
    },
    include: {
      children: {
        where: { products: { some: {} } },
        include: {
          _count: {
            select: { products: true },
          },
          children: {
            where: { products: { some: {} } },
            include: {
              _count: {
                select: { products: true },
              },
            },
          },
        },
      },
      _count: {
        select: { products: true },
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
      children: child.children.map((grandchild) => ({
        id: grandchild.id,
        name: grandchild.name,
        slug: grandchild.slug,
        productCount: grandchild._count.products,
        children: [],
      })),
    })),
  }));
}

interface MetalProductRow {
  id: string;
  name: string;
  slug: string;
  category: { name: string };
  priceRetailBase: { toString(): string } | null;
  isOnOrder: boolean;
  unit: string | null;
  weightKg: { toString(): string };
  stock: number;
  imageUrl: string | null;
  imageLocal: string | null;
  attributes: { key: string; value: string }[];
}

// Товар METALL → строка таблицы металлопроката
export function toMetalProduct(p: MetalProductRow): MetalProductData {
  const lengthAttr = p.attributes.find((a) => /длина/i.test(a.key));
  const weightAttr = p.attributes.find((a) => /вес/i.test(a.key));
  const weightKg = Number(p.weightKg);
  const unit = p.unit ?? null;
  const isLinear = unit === "м" || unit === "п.м" || unit === "пог.м" || unit === "п/м";
  const weightLabel =
    weightAttr?.value ??
    (weightKg > 0
      ? isLinear
        ? `${fmtKg(weightKg)} кг/м`
        : unit === "лист"
          ? `${fmtKg(weightKg)} кг/лист`
          : `${fmtKg(weightKg)} кг/шт`
      : null);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryName: p.category.name,
    price: p.priceRetailBase != null ? Number(p.priceRetailBase) : null,
    isOnOrder: p.isOnOrder,
    unit,
    weightKg,
    length: lengthAttr?.value ?? null,
    weightLabel,
    imageUrl: p.imageUrl,
    imageLocal: p.imageLocal,
    inStock: p.stock > 0,
  };
}

function fmtKg(n: number): string {
  if (n >= 100) return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  if (n >= 10) return n.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

export function totalInTree(categories: CategoryNode[]): number {
  return categories.reduce(
    (sum, c) => sum + c.productCount + totalInTree(c.children),
    0
  );
}
