import type { Metadata } from "next";
import { getActiveStorefrontTheme } from "@/lib/theme-storefront";
import { FlatCart } from "@/components/flat/FlatCart";
import { getPublishedConfig, getDraftConfig } from "@/lib/atlas/config-store";
import { getAtlasCategoryTree } from "@/lib/atlas/catalog";
import { getAtlasZones, getCurrentZone, isPreviewMode } from "@/lib/atlas/server";
import { AtlasTokensProvider } from "@/components/atlas/tokens/AtlasTokensProvider";
import { AtlasChrome } from "@/components/atlas/chrome/AtlasChrome";
import { AtlasCheckout } from "@/components/atlas/checkout/AtlasCheckout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Корзина | pesok-metall.ru",
};

export default async function CartPage() {
  // FLAT theme override
  if ((await getActiveStorefrontTheme()) === "flat") {
    return <FlatCart />;
  }

  // Atlas theme: redirect cart to checkout (Atlas uses drawer)
  const preview = await isPreviewMode();
  const config = preview ? await getDraftConfig() : await getPublishedConfig();
  const [tree, zones, currentZone] = await Promise.all([
    getAtlasCategoryTree(),
    getAtlasZones(),
    getCurrentZone(),
  ]);

  return (
    <AtlasTokensProvider tokens={config.tokens}>
      <AtlasChrome
        config={config}
        tree={tree}
        zones={zones}
        currentZone={currentZone}
        isPreview={preview}
        sidebar={false}
      >
        <AtlasCheckout zones={zones} currentZone={currentZone} />
      </AtlasChrome>
    </AtlasTokensProvider>
  );
}
