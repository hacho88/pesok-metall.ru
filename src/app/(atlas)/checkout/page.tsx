import type { Metadata } from "next";
import { getPublishedConfig, getDraftConfig } from "@/lib/atlas/config-store";
import { getAtlasCategoryTree } from "@/lib/atlas/catalog";
import { getAtlasZones, getCurrentZone, isPreviewMode } from "@/lib/atlas/server";
import { AtlasTokensProvider } from "@/components/atlas/tokens/AtlasTokensProvider";
import { AtlasChrome } from "@/components/atlas/chrome/AtlasChrome";
import { AtlasCheckout } from "@/components/atlas/checkout/AtlasCheckout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Оформление заказа | pesok-metall.ru",
  description: "Оформление заказа на металлопрокат и сыпучие материалы с доставкой по Москве и МО.",
};

export default async function CheckoutPage() {
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
