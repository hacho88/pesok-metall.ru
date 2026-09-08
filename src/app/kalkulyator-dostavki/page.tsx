import type { Metadata } from "next";
import { CartProvider } from "@/components/pm-theme/cart-context";
import { SiteShell } from "@/components/pm-theme/SiteShell";
import { DeliveryCalculator } from "@/components/pm-theme/DeliveryCalculator";
import { getCatalogNav } from "@/lib/pm-catalog";
import { getPublicSettings } from "@/lib/shop-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ИИ-калькулятор доставки | pesok-metall.ru",
  description:
    "Перевод объёма в тару, автоподбор машины и расчёт стоимости доставки в реальном времени.",
};

export default async function DeliveryCalculatorPage() {
  const [nav, settings] = await Promise.all([getCatalogNav(), getPublicSettings()]);

  return (
    <CartProvider>
      <SiteShell catalog={nav} settings={settings}>
        <DeliveryCalculator />
      </SiteShell>
    </CartProvider>
  );
}
