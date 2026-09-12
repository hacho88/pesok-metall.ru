import { prisma } from "@/lib/prisma";
import { WarehouseManager } from "./WarehouseManager";
import { Warehouse } from "lucide-react";

export const dynamic = "force-dynamic";

const WAREHOUSE_CATEGORIES = ["Песок", "Керамзит", "Щебень"];

export default async function WarehousePage() {
  // Грузим категории склада с товарами
  const categories = await prisma.category.findMany({
    where: { name: { in: WAREHOUSE_CATEGORIES } },
    select: {
      id: true,
      name: true,
      slug: true,
      products: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          unit: true,
          stock: true,
          priceRetailBase: true,
          priceCost: true,
          isOnOrder: true,
          imageLocal: true,
          imageUrl: true,
          density: true,
        },
      },
    },
  });

  // Сортируем категории в заданном порядке
  const sorted = WAREHOUSE_CATEGORIES.map(
    (name) => categories.find((c) => c.name === name)
  ).filter(Boolean) as typeof categories;

  const groups = sorted.map((cat) => ({
    id: cat.id,
    name: cat.name,
    products: cat.products.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      unit: p.unit,
      stock: p.stock,
      priceRetailBase: p.priceRetailBase?.toString() ?? null,
      priceCost: p.priceCost?.toString() ?? null,
      isOnOrder: p.isOnOrder,
      image: p.imageLocal || p.imageUrl || null,
      density: p.density?.toString() ?? null,
    })),
  }));

  const totalProducts = groups.reduce((s, g) => s + g.products.length, 0);
  const inStock = groups.reduce(
    (s, g) => s + g.products.filter((p) => p.stock > 0).length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
          <Warehouse className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Наш Склад</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {totalProducts} позиций · {inStock} в наличии
          </p>
        </div>
      </div>

      <WarehouseManager groups={groups} />
    </div>
  );
}
