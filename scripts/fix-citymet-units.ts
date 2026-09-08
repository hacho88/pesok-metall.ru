import { prisma } from "../src/lib/prisma";

/** кг/м² ПВЛ по толщине */
const PVL_KG_M2: Record<number, number> = { 3: 12.9, 4: 15.7, 5: 19.75, 6: 20.4 };

async function syncWeightAttr(productId: string, attrs: { id: string; key: string }[], kg: number) {
  const rounded = Math.round(kg * 100) / 100;
  const wAttr = attrs.find((a) => /^вес/i.test(a.key));
  if (wAttr) {
    await prisma.productAttribute.update({ where: { id: wAttr.id }, data: { value: `${rounded} кг` } });
  } else {
    await prisma.productAttribute.create({ data: { productId, key: "Вес", value: `${rounded} кг` } });
  }
  return rounded;
}

async function main() {
  // === 1. ПВЛ: unit м -> шт (цена = ₽/м × длина листа) ===
  const pvl = await prisma.product.findMany({
    where: { name: { contains: "ПВЛ" }, unit: "м", priceRetailBase: { not: null } },
    include: { attributes: true },
  });
  for (const p of pvl) {
    const m = p.name.match(/ПВЛ-(\d{3})\s+(\d)[хx](\d+)[хx](\d+)/);
    if (!m) continue;
    const thickness = Number(m[2]);
    const widthM = Number(m[3]) / 1000;
    const lenM = Number(m[4]) / 1000;
    const kgM2 = PVL_KG_M2[thickness];
    if (!kgM2) continue;
    const sheetKg = Math.round(kgM2 * widthM * lenM * 100) / 100;
    const priceSheet = Math.round(Number(p.priceRetailBase) * lenM * 100) / 100;
    const rubPerKg = priceSheet / sheetKg;
    if (rubPerKg < 30 || rubPerKg > 150) {
      console.log(`PVL SKIP ${p.name}: ${priceSheet}/${sheetKg} = ${Math.round(rubPerKg)} rub/kg — ne bjetsya`);
      continue;
    }
    await prisma.product.update({
      where: { id: p.id },
      data: { unit: "шт", priceRetailBase: priceSheet, priceCost: priceSheet, weightKg: sheetKg },
    });
    await syncWeightAttr(p.id, p.attributes, sheetKg);
    console.log(`PVL->sht ${p.name}: ${p.priceRetailBase} rub/m x ${lenM}m = ${priceSheet} rub/sht, ves ${sheetKg} kg (${Math.round(rubPerKg)} rub/kg)`);
  }

  // === 2. Рабица: шт -> рулон ===
  const rabica = await prisma.product.updateMany({
    where: { name: { contains: "рабиц", mode: "insensitive" }, unit: "шт" },
    data: { unit: "рулон" },
  });
  console.log(`\nRabica: ${rabica.count} sht -> rulon`);

  // === 3. Полоса за кг -> за метр (по city-met полоса = м/т) ===
  const polosa = await prisma.product.findMany({
    where: { name: { contains: "Полоса" }, unit: "кг", priceRetailBase: { not: null } },
    include: { attributes: true },
  });
  for (const p of polosa) {
    const w = Number(p.weightKg); // кг/м справочно
    if (w <= 0) continue;
    const priceM = Math.round(Number(p.priceRetailBase) * w * 100) / 100;
    await prisma.product.update({
      where: { id: p.id },
      data: { unit: "м", priceRetailBase: priceM, priceCost: priceM },
    });
    console.log(`POLOSA->m ${p.name}: ${p.priceRetailBase} rub/kg x ${w} kg/m = ${priceM} rub/m`);
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
