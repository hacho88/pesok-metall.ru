import type { Metadata } from "next";
import Link from "next/link";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { FullCatalog } from "@/components/catalog/FullCatalog";
import { getUnifiedTree, getUnifiedProducts, totalInUnifiedTree } from "@/lib/unified-catalog";
import { prisma } from "@/lib/prisma";
import { categoryIcon } from "@/lib/category-icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Каталог — металлопрокат, песок и щебень",
  description:
    "Полный каталог: арматура, трубы, уголок, швеллер, лист, сетка, песок, щебень и керамзит. Цены от производителя, доставка в день заказа по Москве и МО.",
};

export default async function CatalogPage() {
  const [categories, products] = await Promise.all([
    getUnifiedTree(),
    getUnifiedProducts(1000),
  ]);

  // Root categories with images and product counts for tiles
  const rootCats = await prisma.category.findMany({
    where: {
      parentId: null,
      OR: [
        { products: { some: {} } },
        { children: { some: { products: { some: {} } } } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      _count: { select: { products: true } },
      children: {
        where: { products: { some: {} } },
        select: { _count: { select: { products: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const catTiles = rootCats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
    count: c._count.products + c.children.reduce((s, ch) => s + ch._count.products, 0),
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  return (
    <DefaultLayout>
      {/* Category tiles */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {catTiles.map((cat) => {
          const Icon = categoryIcon(cat.name);
          return (
            <Link
              key={cat.id}
              href={`/catalog/${cat.slug}`}
              className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-muted">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Icon className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold leading-tight transition-colors group-hover:text-primary">{cat.name}</p>
                <p className="mt-0.5 text-[10px] font-bold text-muted-foreground">{cat.count} поз.</p>
              </div>
            </Link>
          );
        })}
      </div>

      <FullCatalog
        categories={categories}
        products={products}
        title="Каталог"
        subtitle={`${totalInUnifiedTree(categories)} позиций — металлопрокат и сыпучие материалы. Цены обновляются ежедневно, доставка в день заказа.`}
      />
    </DefaultLayout>
  );
}
