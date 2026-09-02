import { prisma } from "../../src/lib/prisma";
import { GEO_ZONES } from "../../src/lib/geo-zones";
import { inZone, toZone } from "../../src/lib/geo";
import type { PageConfig, PageBlock } from "../../src/types/page-builder";

function buildGeoConfig(zoneName: string): PageConfig {
  const blocks: PageBlock[] = [
    {
      type: "MainHeroBanner",
      title: `Металлопрокат и сыпучие материалы в ${inZone(zoneName)}`,
      subtitle: `Доставка в ${toZone(zoneName)} в день заказа: арматура, трубы, листы, сетка, песок и щебень в мешках и биг-бегах. Розница и опт.`,
      ctaLabel: "Рассчитать доставку",
      ctaHref: "#calculator",
      secondaryCtaLabel: "Смотреть каталог",
      secondaryCtaHref: "#catalog",
    },
    {
      type: "InteractiveCalculator",
      title: `ИИ-калькулятор доставки в ${toZone(zoneName)}`,
      description: "Подбор тары и машины с учётом локального тарифа доставки.",
    },
    {
      type: "LiveProductGrid",
      title: `Товары с доставкой в ${toZone(zoneName)}`,
      categorySlugs: [],
      limit: 8,
    },
    {
      type: "AiChatWidget",
      title: `ИИ-менеджер ${zoneName}`,
      placeholder: `Спросите про доставку в ${toZone(zoneName)}...`,
    },
    {
      type: "InvoiceGeneratorCard",
      title: "Счёт на оплату онлайн",
      description: "Сформируйте счёт за 30 секунд — без звонков и ожидания менеджера.",
    },
  ];
  return { slug: "", theme: "industrial-orange", blocks };
}

async function main() {
  console.log("=== Seeding Geo Zones ===");
  for (const zone of GEO_ZONES) {
    await prisma.geoZone.upsert({
      where: { slug: zone.slug },
      update: {
        name: zone.name,
        isRegion: zone.isRegion,
        deliveryTariffMultiplier: zone.deliveryTariffMultiplier,
      },
      create: {
        slug: zone.slug,
        name: zone.name,
        isRegion: zone.isRegion,
        deliveryTariffMultiplier: zone.deliveryTariffMultiplier,
      },
    });
    console.log(`  ✓ ${zone.name} (${zone.slug})`);
  }
  console.log(`\n${GEO_ZONES.length} geo zones seeded.`);

  console.log("\n=== Building Geo Page Configs ===");
  const zones = await prisma.geoZone.findMany({ orderBy: { name: "asc" } });
  for (const zone of zones) {
    const config = buildGeoConfig(zone.name);
    await prisma.pageConfig.upsert({
      where: { slug: `geo:${zone.slug}` },
      update: { blocks: config.blocks as unknown as object },
      create: {
        slug: `geo:${zone.slug}`,
        theme: config.theme,
        blocks: config.blocks as unknown as object,
      },
    });
    console.log(`  ✓ geo:${zone.slug}`);
  }

  console.log("\n=== Generating GeoProductData ===");
  const products = await prisma.product.findMany({
    where: { priceRetailBase: { not: null } },
    select: { id: true, name: true, priceRetailBase: true },
  });
  console.log(`Products with price: ${products.length}`);

  let created = 0;
  let updated = 0;
  for (const product of products) {
    for (const zone of zones) {
      const localPrice =
        Number(product.priceRetailBase) * Number(zone.deliveryTariffMultiplier);
      const seoTitle = `${product.name} — купить с доставкой в ${toZone(zone.name)} в день заказа`;
      const seoDescription = `${product.name} с доставкой в ${toZone(zone.name)} в день заказа. Розница и опт, соответствует ГОСТ. Цена ${Math.round(localPrice)} ₽.`;
      const existing = await prisma.geoProductData.findUnique({
        where: {
          geoZoneId_productId: { geoZoneId: zone.id, productId: product.id },
        },
        select: { id: true },
      });
      await prisma.geoProductData.upsert({
        where: {
          geoZoneId_productId: { geoZoneId: zone.id, productId: product.id },
        },
        update: { localPrice, seoTitle, seoDescription },
        create: {
          geoZoneId: zone.id,
          productId: product.id,
          localPrice,
          seoTitle,
          seoDescription,
        },
      });
      if (existing) updated += 1;
      else created += 1;
    }
  }
  console.log(`GeoProductData: created ${created}, updated ${updated}`);
  console.log("\n=== Done! ===");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
