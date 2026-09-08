import type { Metadata } from "next";
import { CartProvider } from "@/components/pm-theme/cart-context";
import { SiteShell } from "@/components/pm-theme/SiteShell";
import { CatalogGrid } from "@/components/pm-theme/home/CatalogGrid";
import { getCatalog, getCatalogNav } from "@/lib/pm-catalog";
import { getPublicSettings } from "@/lib/shop-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Каталог — металлопрокат, песок и щебень | pesok-metall.ru",
  description:
    "Полный каталог: арматура, трубы, уголок, швеллер, лист, сетка, песок, щебень. Цены от производителя, доставка в день заказа по Москве и МО.",
};

export default async function ShopPage() {
  const [catalog, nav, settings] = await Promise.all([
    getCatalog(),
    getCatalogNav(),
    getPublicSettings(),
  ]);

  return (
    <CartProvider>
      <SiteShell catalog={nav} settings={settings}>
        <CatalogGrid catalog={catalog} />
      </SiteShell>
    </CartProvider>
  );
}

