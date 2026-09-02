import { PageBuilder } from "@/lib/page-builder";
import { getPageConfig } from "@/lib/page-config";
import {
  getActiveStorefrontTheme,
  getActiveStrikerBlueprint,
  getStorefrontProducts,
  type StorefrontProduct,
} from "@/lib/theme-storefront";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeTransition } from "@/components/ThemeTransition";
import StrikerStorefront from "@/components/striker/StrikerStorefront";
import { HeaderCity } from "@/components/city/HeaderCity";
import { HeroCity } from "@/components/city/HeroCity";
import { ProductTableCity } from "@/components/city/ProductTableCity";
import { IndustrialCalculator } from "@/components/city/IndustrialCalculator";
import { HeaderVI } from "@/components/vi/HeaderVI";
import { HeroVI } from "@/components/vi/HeroVI";
import { ProductGridVI } from "@/components/vi/ProductGridVI";
import { CorporateBanner } from "@/components/vi/CorporateBanner";
import CityMetStorefront from "@/components/themes/city-met/CityMetStorefront";
import IdealStorefront from "@/components/themes/ideal/IdealStorefront";
import { AtlasHomePage } from "@/components/atlas/AtlasHomePage";

export const dynamic = "force-dynamic";

/**
 * Главная страница. Активная тема приходит из админки (PageConfig.home.theme):
 * - "striker:*" → динамический чертёж STRIKER.Engine (токены + каркас из БД)
 * - "city" → «Сити!» (Industrial B2B Metal Depot)
 * - "vi"   → «ВИ» (Modern E-commerce Marketplace)
 * - любая другая → классический PageBuilder (блоки из конфига)
 */
export default async function HomePage() {
  const theme = await getActiveStorefrontTheme();
  const config = await getPageConfig("home");

  // STRIKER.Engine: чертёж дизайн-системы из БД, рендер динамическим рендерером
  const strikerBlueprint = await getActiveStrikerBlueprint();
  if (strikerBlueprint) {
    const products = await getStorefrontProducts(60);
    return (
      <ThemeTransition key={strikerBlueprint.slug}>
        <StrikerStorefront blueprint={strikerBlueprint} products={products} />
      </ThemeTransition>
    );
  }

  // Специализированные витрины (city/vi/city-met/ideal/atlas) — свои header/footer, без SiteChrome
  if (theme) {
    if (theme === "atlas") {
      return <AtlasHomePage />;
    }
    const products = await getStorefrontProducts(60);
    return (
      <ThemeTransition key={theme}>
        {theme === "city" ? (
          <CityTheme products={products} />
        ) : theme === "city-met" ? (
          <CityMetStorefront products={products} />
        ) : theme === "ideal" ? (
          <IdealStorefront products={products} />
        ) : (
          <VITheme products={products} />
        )}
      </ThemeTransition>
    );
  }

  // Классическая витрина: блоки из конфига + глобальные Header/Footer
  return (
    <>
      <Header />
      <main>
        <PageBuilder config={config} />
      </main>
      <Footer />
    </>
  );
}

/** Плавный переход между темами через Framer Motion (клиентский компонент) */

function CityTheme({ products }: { products: StorefrontProduct[] }) {
  return (
    <div className="min-h-screen bg-[#1B2129] font-sans antialiased">
      <HeaderCity />
      <main>
        <HeroCity />
        <ProductTableCity products={products} />
        <IndustrialCalculator />
      </main>
      <CityFooter />
    </div>
  );
}

function VITheme({ products }: { products: StorefrontProduct[] }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <HeaderVI />
      <main>
        <HeroVI />
        <ProductGridVI products={products} />
        <CorporateBanner />
      </main>
      <VIFooter />
    </div>
  );
}

function CityFooter() {
  return (
    <footer className="border-t border-[#3A4454] bg-[#14181E] py-10 text-[#9AA5B5]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 text-xs font-bold uppercase tracking-widest sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Сити! Металл-депо · Москва</p>
        <p>ИНН 7723456789 · ОГРН 1237700123456</p>
        <p className="text-[#FF3B1F]">Склад: Пн–Сб 8:00–20:00</p>
      </div>
    </footer>
  );
}

function VIFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white py-10 text-gray-500">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 text-xs font-bold uppercase tracking-widest sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} ВИ · Стройматериалы</p>
        <p>Доставка по Москве и МО в день заказа</p>
        <p className="text-[#FF6B00]">8 (495) 000-00-00</p>
      </div>
    </footer>
  );
}
