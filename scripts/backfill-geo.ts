import { prisma } from "../src/lib/prisma";
import { inZone } from "../src/lib/geo-declensions";

async function main() {
  const zones = await prisma.geoZone.findMany({ select: { id: true, name: true, deliveryTariffMultiplier: true } });
  const products = await prisma.product.findMany({
    where: { priceRetailBase: { not: null } },
    select: { id: true, name: true, priceRetailBase: true, slug: true },
  });

  console.log(`zones: ${zones.length}, products: ${products.length}`);

  const existing = await prisma.geoProductData.findMany({ select: { geoZoneId: true, productId: true } });
  const existingKeys = new Set(existing.map((r) => `${r.geoZoneId}:${r.productId}`));

  const rows: {
    geoZoneId: string;
    productId: string;
    seoTitle: string;
    seoDescription: string;
    aiDescription: string;
    localPrice: number;
  }[] = [];

  for (const zone of zones) {
    const mult = Number(zone.deliveryTariffMultiplier) || 1;
    for (const p of products) {
      if (existingKeys.has(`${zone.id}:${p.id}`)) continue;
      const localPrice = Math.round(Number(p.priceRetailBase) * mult);
      rows.push({
        geoZoneId: zone.id,
        productId: p.id,
        seoTitle: `${p.name} — купить в ${inZone(zone.name)} с доставкой | pesok-metall.ru`,
        seoDescription: `${p.name} с доставкой в ${inZone(zone.name)} в день заказа. Локальная цена от ${localPrice} ₽, ГОСТ, розница и опт.`,
        aiDescription: "",
        localPrice,
      });
    }
  }

  console.log(`rows to create: ${rows.length}`);
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await prisma.geoProductData.createMany({ data: rows.slice(i, i + CHUNK), skipDuplicates: true });
    console.log(`created: ${Math.min(i + CHUNK, rows.length)}`);
  }

  const total = await prisma.geoProductData.count();
  console.log(`geoProductData total: ${total}`);
  await prisma.$disconnect();
}

main();
