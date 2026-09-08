import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { FullCatalog } from "@/components/catalog/FullCatalog";
import { getUnifiedTree } from "@/lib/unified-catalog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findFirst({
    where: { slug },
    select: { name: true, seoTitle: true, seoDescription: true },
  });
  if (!cat) return { title: "Категория не найдена" };
  return {
    title: cat.seoTitle ?? `${cat.name} — купить с доставкой`,
    description: cat.seoDescription ?? `${cat.name} в Москве и Московской области. Цены обновляются ежедневно, доставка в день заказа.`,
  };
}

export default async function CatalogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Find category and all its descendant IDs
  const cat = await prisma.category.findFirst({ where: { slug }, select: { id: true, name: true, imageUrl: true, description: true } });
  if (!cat) notFound();

  // Get all descendant category IDs (2 levels deep)
  const children = await prisma.category.findMany({
    where: { parentId: cat.id },
    select: { id: true, slug: true, name: true, imageUrl: true, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  const allIds = [cat.id, ...children.map((c) => c.id)];

  // Query only products in this category tree — much faster than loading all
  const [categories, products] = await Promise.all([
    getUnifiedTree(),
    prisma.product.findMany({
      where: { categoryId: { in: allIds } },
      take: 500,
      orderBy: { updatedAt: "desc" },
      include: { category: true, attributes: true },
    }),
  ]);

  const finalProducts = products.map((p) => {
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

  return (
    <DefaultLayout>
      {/* Category hero with image */}
      {cat.imageUrl && (
        <div className="relative h-48 overflow-hidden rounded-3xl border border-border bg-muted">
          <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-2xl font-extrabold text-white drop-shadow-lg sm:text-3xl">{cat.name}</h1>
            <p className="mt-1 text-sm font-bold text-white/80">{finalProducts.length} позиций в каталоге</p>
          </div>
        </div>
      )}

      {/* Subcategory tiles */}
      {children.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {children.map((sub) => (
            <a
              key={sub.id}
              href={`/catalog/${sub.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted">
                {sub.imageUrl ? (
                  <img src={sub.imageUrl} alt={sub.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-black text-muted-foreground/20">
                    {sub.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <span className="text-center text-xs font-bold leading-tight transition-colors group-hover:text-primary">{sub.name}</span>
              <span className="text-[10px] font-bold text-muted-foreground">{sub._count.products} тов.</span>
            </a>
          ))}
        </div>
      )}

      <FullCatalog
        categories={categories}
        products={finalProducts}
        title={cat.name}
        subtitle={`${finalProducts.length} позиций — цены обновляются ежедневно, доставка в день заказа.`}
      />
    </DefaultLayout>
  );
}
