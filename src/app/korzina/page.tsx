import type { Metadata } from "next";
import { PmCart } from "@/components/pm-theme/PmCart";
import { CartProvider as PmCartProvider } from "@/components/pm-theme/cart-context";
import { SiteShell } from "@/components/pm-theme/SiteShell";
import { getCatalogNav } from "@/lib/pm-catalog";
import { getPublicSettings } from "@/lib/shop-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Корзина | pesok-metall.ru",
  description: "Оформление заказа: наличный и безналичный расчёт, доставка по Москве и МО",
};

export default async function CartPage() {
  const [nav, settings] = await Promise.all([getCatalogNav(), getPublicSettings()]);

  return (
    <PmCartProvider>
      <SiteShell catalog={nav} settings={settings}>
        <PmCart />
      </SiteShell>
    </PmCartProvider>
  );
}
