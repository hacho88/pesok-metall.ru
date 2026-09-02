import type { Metadata } from "next";
import { getPublishedConfig, getDraftConfig } from "@/lib/atlas/config-store";
import { getAtlasCategoryTree, getAtlasProductBySlug, getSimilarProducts } from "@/lib/atlas/catalog";
import { getAtlasZones, getCurrentZone, isPreviewMode } from "@/lib/atlas/server";
import { AtlasTokensProvider } from "@/components/atlas/tokens/AtlasTokensProvider";
import { AtlasChrome } from "@/components/atlas/chrome/AtlasChrome";
import { AtlasProductPage } from "@/components/atlas/catalog/AtlasProductPage";
import { resolvePrice } from "@/lib/atlas/pricing";
import { resolveSections } from "@/lib/atlas/resolver";
import { prisma } from "@/lib/prisma";
import { productJsonLd } from "@/lib/atlas/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const product = await prisma.product.findUnique({
    where: { slug: decoded },
    select: { name: true, seoTitle: true, seoDescription: true, shortDescription: true },
  });
  if (!product) return { title: "Товар не найден" };
  return {
    title: product.seoTitle || `${product.name} — купить с доставкой | pesok-metall.ru`,
    description: product.seoDescription || product.shortDescription || `Купить ${product.name} с доставкой по Москве и МО. Цены, характеристики, наличие.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const preview = await isPreviewMode();
  const config = preview ? await getDraftConfig() : await getPublishedConfig();
  const [tree, zones, currentZone, product] = await Promise.all([
    getAtlasCategoryTree(),
    getAtlasZones(),
    getCurrentZone(),
    getAtlasProductBySlug(decoded),
  ]);

  if (!product) {
    return (
      <AtlasTokensProvider tokens={config.tokens}>
        <AtlasChrome config={config} tree={tree} zones={zones} currentZone={currentZone} isPreview={preview} sidebar={false}>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-2">Товар не найден</h1>
            <a href="/shop" className="atlas-btn atlas-btn-primary mt-4">Вернуться в каталог</a>
          </div>
        </AtlasChrome>
      </AtlasTokensProvider>
    );
  }

  // Increment views
  await prisma.product.update({ where: { id: product.id }, data: { viewsCount: { increment: 1 } } }).catch(() => {});

  const price = resolvePrice({
    priceRetailBase: product.price,
    isOnOrder: product.isOnOrder,
    unit: product.unit,
    weightKg: product.weightKg as any,
    type: product.type,
    geoData: [],
  } as any, currentZone?.slug ?? null);

  const similar = await getSimilarProducts(product, 8);
  const similarWithPrice = similar.map((p) => ({
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

  // Resolve product page sections
  const sections = config.pages.product.sections;
  const resolved = await resolveSections(sections, {
    zoneSlug: currentZone?.slug ?? null,
    productId: product.id,
  });

  const jsonLd = JSON.stringify(productJsonLd(product, price.perUnit ?? null));

  return (
    <AtlasTokensProvider tokens={config.tokens}>
      <AtlasChrome
        config={config}
        tree={tree}
        zones={zones}
        currentZone={currentZone}
        isPreview={preview}
        sidebar={config.pages.product.sidebar}
      >
        <AtlasProductPage
          product={product}
          price={price}
          similar={similarWithPrice}
          config={config.pages.product}
          sections={sections}
          resolved={resolved}
          jsonLd={jsonLd}
        />
      </AtlasChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </AtlasTokensProvider>
  );
}
