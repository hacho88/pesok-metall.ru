import { prisma } from "@/lib/prisma";
import { BoxesManager } from "./BoxesManager";
import { LayoutGrid } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HeroBoxesPage() {
  const [boxes, products] = await Promise.all([
    prisma.heroBox.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            priceRetailBase: true,
            unit: true,
            type: true,
            imageUrl: true,
            imageLocal: true,
            category: { select: { name: true } },
          },
        },
      },
    }),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        priceRetailBase: true,
        unit: true,
        type: true,
        imageUrl: true,
        imageLocal: true,
        category: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const selected = boxes.map((b) => ({
    id: b.product.id,
    name: b.product.name,
    priceRetailBase: b.product.priceRetailBase != null ? Number(b.product.priceRetailBase) : null,
    unit: b.product.unit,
    type: b.product.type as string,
    imageUrl: b.product.imageUrl,
    imageLocal: b.product.imageLocal,
    categoryName: b.product.category.name,
  }));

  const allProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    priceRetailBase: p.priceRetailBase != null ? Number(p.priceRetailBase) : null,
    unit: p.unit,
    type: p.type as string,
    imageUrl: p.imageUrl,
    imageLocal: p.imageLocal,
    categoryName: p.category.name,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <LayoutGrid className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-black tracking-tight">Боксы на главной</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Товары в верхних боксах главной страницы
          </p>
        </div>
      </div>

      <BoxesManager initialSelected={selected} allProducts={allProducts} />
    </div>
  );
}
