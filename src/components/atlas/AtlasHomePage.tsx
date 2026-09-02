import { getPublishedConfig, getDraftConfig } from "@/lib/atlas/config-store";
import { getAtlasCategoryTree } from "@/lib/atlas/catalog";
import { getAtlasZones, getCurrentZone, isPreviewMode } from "@/lib/atlas/server";
import { AtlasTokensProvider } from "@/components/atlas/tokens/AtlasTokensProvider";
import { AtlasChrome } from "@/components/atlas/chrome/AtlasChrome";
import { AtlasRenderer } from "@/components/atlas/renderer/AtlasRenderer";
import { resolveSections } from "@/lib/atlas/resolver";

export const dynamic = "force-dynamic";

export async function AtlasHomePage() {
  const preview = await isPreviewMode();
  const config = preview ? await getDraftConfig() : await getPublishedConfig();
  const [tree, zones, currentZone] = await Promise.all([
    getAtlasCategoryTree(),
    getAtlasZones(),
    getCurrentZone(),
  ]);

  const sections = config.pages.home.sections;
  const resolved = await resolveSections(sections, {
    zoneSlug: currentZone?.slug ?? null,
  });

  return (
    <AtlasTokensProvider tokens={config.tokens}>
      <AtlasChrome
        config={config}
        tree={tree}
        zones={zones}
        currentZone={currentZone}
        isPreview={preview}
        sidebar={config.pages.home.sidebar}
      >
        <AtlasRenderer sections={sections} resolved={resolved} />
      </AtlasChrome>
    </AtlasTokensProvider>
  );
}
