import { ReactNode } from "react";
import { AtlasTokensProvider } from "@/components/atlas/tokens/AtlasTokensProvider";
import { getPublishedConfig, getDraftConfig } from "@/lib/atlas/config-store";
import { getAtlasCategoryTree } from "@/lib/atlas/catalog";
import { getAtlasZones, getCurrentZone, isPreviewMode } from "@/lib/atlas/server";
import { AtlasChrome } from "@/components/atlas/chrome/AtlasChrome";

export const dynamic = "force-dynamic";

export default async function AtlasLayout({ children }: { children: ReactNode }) {
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
        {children}
      </AtlasChrome>
    </AtlasTokensProvider>
  );
}
