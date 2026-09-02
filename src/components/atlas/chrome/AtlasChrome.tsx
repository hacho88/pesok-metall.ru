import { ReactNode } from "react";
import type { AtlasConfig } from "@/lib/atlas/config-schema";
import { AtlasHeader } from "./AtlasHeader";
import { AtlasFooter } from "./AtlasFooter";
import { AtlasCategoryTree } from "./AtlasCategoryTree";
import { AtlasCartDrawer } from "./AtlasCartDrawer";
import { AtlasPreviewBar } from "./AtlasPreviewBar";

export function AtlasChrome({
  config,
  tree,
  zones,
  currentZone,
  isPreview,
  sidebar = true,
  children,
}: {
  config: AtlasConfig;
  tree: import("@/lib/atlas/catalog").AtlasCategoryNode[];
  zones: { slug: string; name: string }[];
  currentZone: { slug: string; name: string } | null;
  isPreview?: boolean;
  sidebar?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      {isPreview && <AtlasPreviewBar />}
      <AtlasHeader config={config} zones={zones} currentZone={currentZone} />
      <div className="atlas-container flex gap-8 py-6">
        {sidebar && config.sidebar.enabled && (
          <aside className="hidden lg:block w-[280px] shrink-0">
            <AtlasCategoryTree tree={tree} config={config.sidebar} />
          </aside>
        )}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <AtlasFooter config={config} zones={zones} />
      <AtlasCartDrawer />
    </>
  );
}
