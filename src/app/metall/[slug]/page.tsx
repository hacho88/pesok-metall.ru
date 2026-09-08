import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { MetalTable } from "@/components/catalog/MetalTable";
import { ProductDetail, type ProductDetailData } from "@/components/catalog/ProductDetail";
import { getFullTree, toMetalProduct } from "@/lib/metall-catalog";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const category = await prisma.category.findUnique({ where: { slug: decoded } });
  if (category) {
    return {
      title: `${category.name} — купить с доставкой`,
      description: `${category.name} в Москве и Московской области. Цены обновляются ежедневно, доставка в день заказа.`,
    };
  }
  const product = await prisma.product.findUnique({
    where: { slug: decoded },
    include: { category: true },
  });
  if (product) {
    return {
      title: `${product.name} — купить с доставкой`,
      description: `${product.name} — цена ${product.priceRetailBase != null ? `${Number(product.priceRetailBase)} ₽` : "по запросу"}, доставка в день заказа по Москве и МО.`,
    };
  }
  return { title: "Товар не найден" };
}

export default async function CatalogSlugPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  // 1) Страница категории (как раньше)
  const category = await prisma.category.findUnique({
    where: { slug: decoded },
    include: {
      parent: true,
      products: {
        where: { type: "METALL" },
        include: { category: true, attributes: true },
        orderBy: { name: "asc" },
      },
    },
  });
  if (category) {
    const tree = await getFullTree();
    const rows = category.products.map((p: any) => ({
      ...toMetalProduct(p),
      groupId: p.groupId,
      groupName: p.groupName,
    }));
    const breadcrumb = [category.parent?.name, category.name].filter(Boolean).join(" / ");
    return (
      <DefaultLayout>
        <MetalTable
          products={rows}
          categories={tree}
          activeSlug={category.slug}
          title={category.name}
          subtitle={`${rows.length} позиций${breadcrumb ? ` — ${breadcrumb}` : ""}. Цены обновляются ежедневно`}
        />
      </DefaultLayout>
    );
  }

  // 2) Страница товара
  const product = await prisma.product.findUnique({
    where: { slug: decoded },
    include: { category: true, attributes: true },
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 8,
    orderBy: { updatedAt: "desc" },
    include: { category: true, attributes: true },
  });

  const toDetail = (p: any): ProductDetailData => ({
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
    groupName: p.groupName,
    length: p.attributes.find((a: any) => /длина/i.test(a.key))?.value ?? null,
    weightLabel: p.attributes.find((a: any) => /вес/i.test(a.key))?.value ?? null,
    attributes: p.attributes.map((a: any) => ({ key: a.key, value: a.value })),
  });

  return (
    <DefaultLayout>
      <ProductDetail product={toDetail(product)} related={related.map(toDetail)} />
    </DefaultLayout>
  );
}
