import type { Metadata } from "next";
import { getPublishedConfig, getDraftConfig } from "@/lib/atlas/config-store";
import { getAtlasCategoryTree } from "@/lib/atlas/catalog";
import { getAtlasZones, getCurrentZone, isPreviewMode } from "@/lib/atlas/server";
import { AtlasTokensProvider } from "@/components/atlas/tokens/AtlasTokensProvider";
import { AtlasChrome } from "@/components/atlas/chrome/AtlasChrome";
import { ContactsPageContent } from "@/components/atlas/sections/ContactsPageContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Контакты | pesok-metall.ru",
  description: "Контактная информация pesok-metall.ru. Телефон, email, адрес склада металлопроката в Москве.",
};

export default async function ContactsPage() {
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
        <ContactsPageContent config={config} />
      </AtlasChrome>
    </AtlasTokensProvider>
  );
}
