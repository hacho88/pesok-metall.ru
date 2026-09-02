import type { Metadata } from "next";
import { getPublishedConfig, getDraftConfig } from "@/lib/atlas/config-store";
import { getAtlasCategoryTree, getCatalogProducts } from "@/lib/atlas/catalog";
import { getAtlasZones, getCurrentZone, isPreviewMode } from "@/lib/atlas/server";
import { AtlasTokensProvider } from "@/components/atlas/tokens/AtlasTokensProvider";
import { AtlasChrome } from "@/components/atlas/chrome/AtlasChrome";
import { AtlasCatalogPage } from "@/components/atlas/catalog/AtlasCatalogPage";
import { resolvePrice } from "@/lib/atlas/pricing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Каталог — металлопрокат, песок и щебень | pesok-metall.ru",
  description: "Полный каталог: арматура, трубы, уголок, швеллер, лист, сетка, песок, щебень. Цены от производителя, доставка в день заказа по Москве и МО.",
};

export default async function ShopPage() {
  const preview = await isPreviewMode();
  const config = preview ? await getDraftConfig() : await getPublishedConfig();
  const [tree, zones, currentZone, result] = await Promise.all([
    getAtlasCategoryTree(),
    getAtlasZones(),
    getCurrentZone(),
    getCatalogProducts({
      perPage: config.pages.category.perPage,
      sort: config.pages.category.defaultSort,
    }),
  ]);

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
          category={null}
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
