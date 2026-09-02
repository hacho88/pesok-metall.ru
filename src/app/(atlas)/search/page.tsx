import type { Metadata } from "next";
import { getPublishedConfig, getDraftConfig } from "@/lib/atlas/config-store";
import { getAtlasCategoryTree, searchAtlasProducts } from "@/lib/atlas/catalog";
import { getAtlasZones, getCurrentZone, isPreviewMode } from "@/lib/atlas/server";
import { AtlasTokensProvider } from "@/components/atlas/tokens/AtlasTokensProvider";
import { AtlasChrome } from "@/components/atlas/chrome/AtlasChrome";
import { AtlasCatalogPage } from "@/components/atlas/catalog/AtlasCatalogPage";
import { resolvePrice } from "@/lib/atlas/pricing";
import { ProductCard } from "@/components/atlas/catalog/ProductCard";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Поиск по каталогу | pesok-metall.ru",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const preview = await isPreviewMode();
  const config = preview ? await getDraftConfig() : await getPublishedConfig();
  const [tree, zones, currentZone] = await Promise.all([
    getAtlasCategoryTree(),
    getAtlasZones(),
    getCurrentZone(),
  ]);

  const { products: searchResults, categories } = query ? await searchAtlasProducts(query, 48) : { products: [], categories: [] };

  const productsWithPrice = searchResults.map((p) => ({
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
        sidebar={config.pages.search.sidebar}
      >
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ fontFamily: "var(--atlas-font-heading)" }}>
            <Search size={24} style={{ color: "var(--atlas-primary)" }} />
            Поиск: {query || "..."}
          </h1>
          <p className="text-sm mb-4" style={{ color: "var(--atlas-text-muted)" }}>
            Найдено: {searchResults.length} {searchResults.length === 1 ? "товар" : searchResults.length < 5 ? "товара" : "товаров"}
          </p>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((c) => (
                <a key={c.id} href={`/shop/${encodeURIComponent(c.slug)}`} className="atlas-badge atlas-badge-primary">
                  Категория: {c.name}
                </a>
              ))}
            </div>
          )}

          {searchResults.length === 0 ? (
            <div className="text-center py-20 atlas-card">
              <Search size={48} style={{ color: "var(--atlas-text-muted)", opacity: 0.3, margin: "0 auto" }} />
              <p className="text-lg font-medium mt-4 mb-2">Ничего не найдено</p>
              <p className="text-sm" style={{ color: "var(--atlas-text-muted)" }}>
                Попробуйте изменить запрос или перейдите в каталог
              </p>
              <a href="/shop" className="atlas-btn atlas-btn-primary mt-4">Перейти в каталог</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {productsWithPrice.map(({ product, price }) => (
                <ProductCard key={product.id} product={product} price={price} />
              ))}
            </div>
          )}
        </div>
      </AtlasChrome>
    </AtlasTokensProvider>
  );
}
