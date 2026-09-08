import { prisma } from "../src/lib/prisma";
import { readFileSync } from "fs";

/**
 * Импорт данных из data-export.json в БД (указанную в DATABASE_URL).
 * Требования: схема уже применена (npx prisma db push). Таблицы очищаются, данные
 * заливаются с оригинальными ID — все связи сохраняются.
 * Запуск: npx tsx scripts/import-db.ts
 */
async function insertRows(rows: any[], fn: (batch: any[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += 400) {
    await fn(rows.slice(i, i + 400));
  }
}

async function main() {
  const data = JSON.parse(readFileSync("data-export.json", "utf8"));

  console.log("Очистка целевой БД (TRUNCATE CASCADE)…");
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "OrderItem", "AtlasOrder", "TenderAnalysis", "MapLead", "Lead",
      "GeoProductData", "HeroBox", "ProductAttribute", "Product", "Category", "CatalogSection",
      "GeoZone", "BlogPost", "PageConfig", "Theme", "StrikerBlueprintVersion", "StrikerBlueprint",
      "StorefrontConfigVersion", "StorefrontConfig", "MediaAsset", "DeliveryTariff", "Banner",
      "ShopSettings", "CompetitorPrice", "AdCampaign", "FleetVehicle"
    CASCADE
  `);

  // 1. Справочники и настройки (без внешних зависимостей)
  if (data.shopSettings.length) await prisma.shopSettings.createMany({ data: data.shopSettings });
  await insertRows(data.catalogSections, (b) => prisma.catalogSection.createMany({ data: b }));
  await insertRows(data.geoZones, (b) => prisma.geoZone.createMany({ data: b }));
  await insertRows(data.pageConfigs, (b) => prisma.pageConfig.createMany({ data: b }));
  await insertRows(data.themes, (b) => prisma.theme.createMany({ data: b }));
  await insertRows(data.mediaAssets, (b) => prisma.mediaAsset.createMany({ data: b }));
  await insertRows(data.fleetVehicles, (b) => prisma.fleetVehicle.createMany({ data: b }));
  await insertRows(data.deliveryTariffs, (b) => prisma.deliveryTariff.createMany({ data: b }));
  await insertRows(data.banners, (b) => prisma.banner.createMany({ data: b }));
  await insertRows(data.storefrontConfigs, (b) => prisma.storefrontConfig.createMany({ data: b }));

  // 2. Категории: сначала корни, потом дети (self-reference parentId)
  const roots = data.categories.filter((c: any) => !c.parentId);
  const children = data.categories.filter((c: any) => c.parentId);
  await insertRows(roots, (b) => prisma.category.createMany({ data: b }));
  await insertRows(children, (b) => prisma.category.createMany({ data: b }));

  // 3. Товары и зависимости
  await insertRows(data.products, (b) => prisma.product.createMany({ data: b }));
  await insertRows(data.productAttributes, (b) => prisma.productAttribute.createMany({ data: b }));
  await insertRows(data.geoProductData, (b) => prisma.geoProductData.createMany({ data: b }));
  await insertRows(data.heroBoxes, (b) => prisma.heroBox.createMany({ data: b }));
  await insertRows(data.competitorPrices, (b) => prisma.competitorPrice.createMany({ data: b }));
  await insertRows(data.adCampaigns, (b) => prisma.adCampaign.createMany({ data: b }));
  await insertRows(data.blogPosts, (b) => prisma.blogPost.createMany({ data: b }));
  await insertRows(data.strikerBlueprints, (b) => prisma.strikerBlueprint.createMany({ data: b }));
  await insertRows(data.strikerBlueprintVersions, (b) => prisma.strikerBlueprintVersion.createMany({ data: b }));
  await insertRows(data.storefrontConfigVersions, (b) => prisma.storefrontConfigVersion.createMany({ data: b }));
  await insertRows(data.leads, (b) => prisma.lead.createMany({ data: b }));
  await insertRows(data.mapLeads, (b) => prisma.mapLead.createMany({ data: b }));
  await insertRows(data.tenderAnalyses, (b) => prisma.tenderAnalysis.createMany({ data: b }));
  await insertRows(data.orders, (b) => prisma.order.createMany({ data: b }));

  console.log(`import done. products: ${await prisma.product.count()}, geoRows: ${await prisma.geoProductData.count()}, posts: ${await prisma.blogPost.count()}, categories: ${await prisma.category.count()}, zones: ${await prisma.geoZone.count()}`);
  await prisma.$disconnect();
}

main();
