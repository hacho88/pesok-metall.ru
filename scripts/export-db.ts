import { prisma } from "../src/lib/prisma";
import { writeFileSync } from "fs";

/**
 * Полный экспорт БД в JSON для переноса на сервер (Timeweb и т.д.).
 * Запуск: npx tsx scripts/export-db.ts  →  data-export.json
 * Импорт на сервере: npx tsx scripts/import-db.ts
 */
async function main() {
  const data = {
    exportedAt: new Date().toISOString(),
    shopSettings: await prisma.shopSettings.findMany(),
    catalogSections: await prisma.catalogSection.findMany(),
    geoZones: await prisma.geoZone.findMany(),
    categories: await prisma.category.findMany({ orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }] }),
    products: await prisma.product.findMany(),
    productAttributes: await prisma.productAttribute.findMany(),
    geoProductData: await prisma.geoProductData.findMany(),
    heroBoxes: await prisma.heroBox.findMany(),
    competitorPrices: await prisma.competitorPrice.findMany(),
    adCampaigns: await prisma.adCampaign.findMany(),
    fleetVehicles: await prisma.fleetVehicle.findMany(),
    tenderAnalyses: await prisma.tenderAnalysis.findMany(),
    leads: await prisma.lead.findMany(),
    mapLeads: await prisma.mapLead.findMany(),
    orders: await prisma.order.findMany(),
    blogPosts: await prisma.blogPost.findMany(),
    pageConfigs: await prisma.pageConfig.findMany(),
    themes: await prisma.theme.findMany(),
    strikerBlueprints: await prisma.strikerBlueprint.findMany(),
    strikerBlueprintVersions: await prisma.strikerBlueprintVersion.findMany(),
    storefrontConfigs: await prisma.storefrontConfig.findMany(),
    storefrontConfigVersions: await prisma.storefrontConfigVersion.findMany(),
    mediaAssets: await prisma.mediaAsset.findMany(),
    atlasOrders: await prisma.atlasOrder.findMany(),
    orderItems: await prisma.orderItem.findMany(),
    deliveryTariffs: await prisma.deliveryTariff.findMany(),
    banners: await prisma.banner.findMany(),
  };

  writeFileSync("data-export.json", JSON.stringify(data, null, 1), "utf8");

  const counts = Object.entries(data)
    .filter(([, v]) => Array.isArray(v))
    .map(([k, v]) => `${k}: ${(v as unknown[]).length}`)
    .join("\n");
  console.log(`exported to data-export.json:\n${counts}`);
  await prisma.$disconnect();
}

main();

