import { getCatalog, getCatalogNav, getHeroBoxProducts } from "@/lib/pm-catalog";
import { getPublicSettings, getActiveBanners, getHeroConfig } from "@/lib/shop-settings";
import { prisma } from "@/lib/prisma";
import { CartProvider } from "@/components/pm-theme/cart-context";
import { SiteShell } from "@/components/pm-theme/SiteShell";
import { Hero, HeroBoxes } from "@/components/pm-theme/home/Hero";
import { HeroSection } from "@/components/hero-builder/HeroSection";
import { CatalogGrid } from "@/components/pm-theme/home/CatalogGrid";
import { PopularProducts } from "@/components/pm-theme/home/PopularProducts";
import { ParamPicker } from "@/components/pm-theme/home/ParamPicker";
import { Features, Stats } from "@/components/pm-theme/home/Features";
import { Geography } from "@/components/pm-theme/home/Geography";
import { Faq } from "@/components/pm-theme/home/Faq";
import { Reviews } from "@/components/pm-theme/home/Reviews";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [catalog, nav, settings, geoZones, banners, heroConfig] = await Promise.all([
      getCatalog(),
      getCatalogNav(),
      getPublicSettings(),
      prisma.geoZone.findMany({ select: { name: true, slug: true }, orderBy: { name: "asc" } }),
      getActiveBanners("home_top"),
      getHeroConfig(),
    ]);

    // Популярные товары: с фото и ценой, из наличия, вперемешку из категорий
    const popular = catalog
      .flatMap((c) => c.products)
      .filter((p) => p.inStock && (p.pricePerUnit || p.pricePerMeter) && (p.imageLocal || p.imageUrl))
      .sort(() => 0.5 - Math.random())
      .slice(0, 8);

    // Боксы на главной: закреплённые в админке (раздел «Боксы»), иначе — авто из сыпучих
    const heroBoxProducts = await getHeroBoxProducts();
    const bulkProducts =
      heroBoxProducts.length > 0
        ? heroBoxProducts
        : (catalog.find((c) => c.slug === "pesok-shcheben")?.products ?? []);

  return (
    <CartProvider>
      <SiteShell catalog={nav} settings={settings}>
        <div className="flex flex-col gap-12">
          {heroConfig ? (
            <>
              <HeroSection data={heroConfig} />
              <HeroBoxes products={bulkProducts} />
            </>
          ) : (
            <Hero
              bulkProducts={bulkProducts}
              banners={banners}
              texts={{ badge: settings.heroBadge, title: settings.heroTitle, subtitle: settings.heroSubtitle }}
            />
          )}
          <CatalogGrid catalog={catalog} />
          <ParamPicker products={catalog.flatMap((c) => c.products)} />
          <PopularProducts products={popular} />
          <Features />
          <Stats items={settings.statsItems} />
          <Geography
            cities={geoZones}
            warehouse={{
              address: settings.warehouseAddress,
              lat: settings.warehouseLat,
              lng: settings.warehouseLng,
            }}
          />
          <Faq phone={settings.phone} workHours={settings.workHours} />
          <Reviews />
        </div>
      </SiteShell>
    </CartProvider>
  );
}
