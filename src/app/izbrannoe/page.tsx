import type { Metadata } from "next";
import { FavoritesView } from "@/app/izbrannoe/FavoritesView";
import { CartProvider as PmCartProvider } from "@/components/pm-theme/cart-context";
import { SiteShell } from "@/components/pm-theme/SiteShell";
import { getCatalogNav } from "@/lib/pm-catalog";
import { getPublicSettings } from "@/lib/shop-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Избранное | pesok-metall.ru",
  description: "Отложенные товары: металлопрокат, песок и щебень с доставкой по Москве и МО",
};

export default async function FavoritesPage() {
  const [nav, settings] = await Promise.all([getCatalogNav(), getPublicSettings()]);

  return (
    <PmCartProvider>
      <SiteShell catalog={nav} settings={settings}>
        <FavoritesView />
      </SiteShell>
    </PmCartProvider>
  );
}
