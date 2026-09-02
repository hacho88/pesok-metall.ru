import type { Metadata } from "next";
import { getPublishedConfig, getDraftConfig } from "@/lib/atlas/config-store";
import { getAtlasCategoryTree, getCatalogProducts, findNodeBySlug, collectCategoryIds } from "@/lib/atlas/catalog";
import { getAtlasZones, getCurrentZone, isPreviewMode } from "@/lib/atlas/server";
import { AtlasTokensProvider } from "@/components/atlas/tokens/AtlasTokensProvider";
import { AtlasChrome } from "@/components/atlas/chrome/AtlasChrome";
import { AtlasCatalogPage } from "@/components/atlas/catalog/AtlasCatalogPage";
import { resolvePrice } from "@/lib/atlas/pricing";
import { prisma } from "@/lib/prisma";
import { sanitizeDescription } from "@/lib/atlas/sanitize";

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
  const preview = await isPreviewMode();
  const config = preview ? await getDraftConfig() : await getPublishedConfig();
  const [tree, zones, currentZone] = await Promise.all([
    getAtlasCategoryTree(),
    getAtlasZones(),
    getCurrentZone(),
  ]);

  const node = findNodeBySlug(tree, decoded);
  if (!node) {
    return (
      <AtlasTokensProvider tokens={config.tokens}>
        <AtlasChrome config={config} tree={tree} zones={zones} currentZone={currentZone} isPreview={preview} sidebar={config.pages.category.sidebar}>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-2">Категория не найдена</h1>
            <a href="/shop" className="atlas-btn atlas-btn-primary mt-4">Вернуться в каталог</a>
          </div>
        </AtlasChrome>
      </AtlasTokensProvider>
    );
  }

  const result = await getCatalogProducts({
    categorySlug: decoded,
    perPage: config.pages.category.perPage,
    sort: config.pages.category.defaultSort,
  });

  const category = await prisma.category.findUnique({ where: { slug: decoded } });

  const productsWithPrice = result.products.map((p) => ({
    product: p,
    price: resolvePrice({
      priceRetailBase: p.price,
      isOnOrder: p.isOnOrder,
      unit: p.unit,
      weightKg: p.weightKg as any,
      type: p.type,
      geoData: [],
    } as any, currentZone?.slug ?? null),
  }));

  return (
    <AtlasTokensProvider tokens={config.tokens}>
      <AtlasChrome
        config={config}
        tree={tree}
        zones={zones}
        currentZone={currentZone}
        isPreview={preview}
        sidebar={config.pages.category.sidebar}
      >
        <AtlasCatalogPage
          category={node}
          categoryDescription={category?.description ? sanitizeDescription(category.description) : null}
          tree={tree}
          products={productsWithPrice}
          total={result.total}
          page={result.page}
          perPage={result.perPage}
          totalPages={result.totalPages}
          facets={result.facets}
          config={config.pages.category}
          currentZoneSlug={currentZone?.slug ?? null}
        />
      </AtlasChrome>
    </AtlasTokensProvider>
  );
}
