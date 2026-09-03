import { ReactNode } from "react";
import { AtlasTokensProvider } from "@/components/atlas/tokens/AtlasTokensProvider";
import { getPublishedConfig, getDraftConfig } from "@/lib/atlas/config-store";
import { isPreviewMode } from "@/lib/atlas/server";

export const dynamic = "force-dynamic";

export default async function AtlasLayout({ children }: { children: ReactNode }) {
  const preview = await isPreviewMode();
  const config = preview ? await getDraftConfig() : await getPublishedConfig();

  return (
    <AtlasTokensProvider tokens={config.tokens}>
      {children}
    </AtlasTokensProvider>
  );
}
