import type { Metadata } from "next";
import { CartProvider } from "@/components/pm-theme/cart-context";
import { SiteShell } from "@/components/pm-theme/SiteShell";
import { MetalCalculator } from "@/components/pm-theme/MetalCalculator";
import { getCatalog, getCatalogNav } from "@/lib/pm-catalog";
import { getPublicSettings } from "@/lib/shop-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ИИ-калькулятор металла | pesok-metall.ru",
  description:
    "Перевод метров в тонны, подбор сечения и мгновенный расчёт стоимости партии металлопроката.",
};

export default async function MetalCalculatorPage() {
  const [catalog, nav, settings] = await Promise.all([
    getCatalog(),
    getCatalogNav(),
    getPublicSettings(),
  ]);

  return (
    <CartProvider>
      <SiteShell catalog={nav} settings={settings}>
        <MetalCalculator catalog={catalog} />
      </SiteShell>
    </CartProvider>
  );
}
