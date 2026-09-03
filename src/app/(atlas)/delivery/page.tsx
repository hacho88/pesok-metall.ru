import type { Metadata } from "next";
import { getPublishedConfig, getDraftConfig } from "@/lib/atlas/config-store";
import { getAtlasCategoryTree } from "@/lib/atlas/catalog";
import { getAtlasZones, getCurrentZone, isPreviewMode } from "@/lib/atlas/server";
import { AtlasTokensProvider } from "@/components/atlas/tokens/AtlasTokensProvider";
import { AtlasChrome } from "@/components/atlas/chrome/AtlasChrome";
import { DeliveryPageContent } from "@/components/atlas/sections/DeliveryPageContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Доставка | pesok-metall.ru",
  description: "Доставка металлопроката и сыпучих материалов по Москве и Московской области. Зоны доставки, тарифы, сроки.",
};

export default async function DeliveryPage() {
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
        <DeliveryPageContent zones={zones} currentZone={currentZone} />
      </AtlasChrome>
    </AtlasTokensProvider>
  );
}
