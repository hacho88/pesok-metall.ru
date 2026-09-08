import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/pm-catalog";
import { getPublicSettings } from "@/lib/shop-settings";
import { PmCategoryPage } from "@/components/pm-theme/PmCategoryPage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const category = await prisma.category.findUnique({ where: { slug: decoded } });
  if (!category) return { title: "Категория не найдена" };
  return {
    title: category.seoTitle || `${category.name} — купить с доставкой | pesok-metall.ru`,
    description: category.seoDescription || category.shortDescription || `Каталог категории ${category.name}. Цены, характеристики, доставка по Москве и МО.`,
  };
}

export default async function ShopCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const [catalog, settings] = await Promise.all([getCatalog(), getPublicSettings()]);

  const pmCategory = catalog.find((c) => c.slug === decoded);
  if (pmCategory) {
    return <PmCategoryPage category={pmCategory} catalog={catalog} settings={settings} />;
  }

  // Дочерняя категория — собираем вид категории из родительского корня
  for (const root of catalog) {
    const ref = root.subcategoryRefs.find((r) => r.slug === decoded);
    if (ref) {
      const childCategory = {
        ...root,
        slug: ref.slug,
        title: ref.name,
        intro: `${ref.name} — доставка в день заказа по Москве и МО.`,
        subcategories: [] as string[],
        subcategoryRefs: [ref],
        products: root.products.filter((p) => p.subcategory === ref.name),
      };
      return <PmCategoryPage category={childCategory} catalog={catalog} settings={settings} />;
    }
  }

  notFound();
}

