import { prisma } from "../src/lib/prisma";

function tubeKgM(a: number, b: number, t: number): number {
  return Math.round((2 * (a - t) + 2 * (b - t)) * t * 0.00785 * 1000) / 1000;
}
function parseSection(name: string): [number, number, number] | null {
  const m = name.match(/(\d{2,3})[хx](\d{2,3})[хx](\d(?:[.,]\d)?)\s*$/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3].replace(",", "."))];
}

async function setWeight(p: any, kg: number) {
  const rounded = Math.round(kg * 1000) / 1000;
  await prisma.product.update({ where: { id: p.id }, data: { weightKg: rounded } });
  const wAttr = p.attributes.find((a: any) => /^вес/i.test(a.key));
  if (wAttr) {
    await prisma.productAttribute.update({ where: { id: wAttr.id }, data: { value: `${rounded} кг` } });
  } else {
    await prisma.productAttribute.create({ data: { productId: p.id, key: "Вес", value: `${rounded} кг` } });
  }
  return rounded;
}

async function setOnOrder(p: any) {
  await prisma.product.update({
    where: { id: p.id },
    data: { priceRetailBase: null, priceCost: null, isOnOrder: true },
  });
}

async function main() {
  const products = await prisma.product.findMany({
    include: { attributes: true, category: { select: { name: true } } },
  });

  let nUnit = 0, nPrice = 0, nWeight = 0;

  for (const p of products) {
    const name = p.name;
    const unit = p.unit;
    const w = Number(p.weightKg);
    const price = p.priceRetailBase != null ? Number(p.priceRetailBase) : null;
    if (!unit || /заглушк/i.test(name) || /песок|щебень/i.test(name)) continue;

    const lenAttr = p.attributes.find((a) => /длина/i.test(a.key))?.value ?? "";
    const lenM = Number((lenAttr.match(/(\d+(?:[.,]\d+)?)/) ?? [])[1]?.replace(",", ".") ?? 0);

    // === A. ЛИСТЫ г/к и рифленые с unit=м: цена за лист записана с unit=м ===
    // Пример: Лист 10х1500х6000 | м | вес=78.5 (кг/м²!) | цена=53262 (цена ЛИСТА)
    if (/^Лист( рифленый)? \d+[хx]\d+[хx]\d+/.test(name) && unit === "м" && price != null) {
      const m = name.match(/Лист(?: рифленый)? (\d+(?:[.,]\d)?)[хx](\d+)[хx](\d+)/);
      if (m) {
        const t = Number(m[1].replace(",", "."));
        const area = (Number(m[2]) / 1000) * (Number(m[3]) / 1000);
        // Рифленый лист тяжелее гладкого на ~3-5%
        const rib = /рифлен/i.test(name) ? 1.04 : 1;
        const kgM2 = Math.round(7.85 * t * rib * 100) / 100;
        const sheetKg = Math.round(kgM2 * area * 100) / 100;
        const rubPerKg = price / sheetKg;
        if (rubPerKg >= 30 && rubPerKg <= 150) {
          // Цена за лист правдоподобна → unit=шт, вес=вес листа
          await prisma.product.update({ where: { id: p.id }, data: { unit: "шт" } });
          await setWeight(p, sheetKg);
          if (!p.attributes.some((a) => /длина|формат/i.test(a.key))) {
            await prisma.productAttribute.create({
              data: { productId: p.id, key: "Формат", value: `${m[2]}x${m[3]} мм` },
            });
          }
          console.log(`ЛИСТ→шт ${name}: вес ${w} → ${sheetKg} кг/лист, цена ${price} ₽/лист (${Math.round(rubPerKg)} ₽/кг)`);
          nUnit++;
          continue;
        }
        // Цена не бьётся даже с весом листа → под заказ
        await setOnOrder(p);
        console.log(`ЛИСТ→заказ ${name}: цена ${price} не бьётся (${Math.round(rubPerKg)} ₽/кг) → под заказ`);
        nPrice++;
        continue;
      }
    }

    // === A2. Трубы (все виды) с ценой за кг < 15 → под заказ ===
    if (/труба/i.test(name) && price != null && w > 0 && price / w < 15) {
      await setOnOrder(p);
      console.log(`ТРУБА→заказ ${name}: ${price} ₽/${unit} при ${w} кг (${Math.round((price / w) * 10) / 10} ₽/кг) → под заказ`);
      nPrice++;
      continue;
    }

    // === B. ПВЛ: вес-заглушки и мусорные цены ===
    if (/ПВЛ/i.test(name)) {
      const m = name.match(/ПВЛ-(\d)(\d)\d?\s+(\d)[хx](\d+)[хx](\d+)/);
      if (m && w === 1) {
        // ПВЛ-406 4х1000х3000: толщина 4мм → ~15.7 кг/м², площадь из размеров
        const t = Number(m[3]);
        const area = (Number(m[4]) / 1000) * (Number(m[5]) / 1000);
        const kgM2 = t === 3 ? 12.9 : t === 4 ? 15.7 : t === 5 ? 19.75 : t === 6 ? 20.4 : 25;
        const sheetKg = Math.round(kgM2 * area * 100) / 100;
        if (unit === "шт") {
          await setWeight(p, sheetKg);
          console.log(`ПВЛ ${name}: вес 1 → ${sheetKg} кг/лист`);
        } else {
          await setWeight(p, Math.round((sheetKg / Number(m[5])) * 100) / 100);
          console.log(`ПВЛ ${name}: вес 1 → кг/м`);
        }
        nWeight++;
        continue;
      }
      // ПВЛ с ценой за кг < 15 → под заказ
      if (price != null && w > 0 && price / w < 15) {
        await setOnOrder(p);
        console.log(`ПВЛ→заказ ${name}: цена ${price} ₽ при весе ${w} кг → под заказ`);
        nPrice++;
        continue;
      }
    }

    // === C. Полоса с ценой за кг < 15 → под заказ ===
    if (/Полоса/i.test(name) && price != null && w > 0 && price / w < 15) {
      await setOnOrder(p);
      console.log(`ПОЛОСА→заказ ${name}: ${price} ₽/${unit} при ${w} кг → под заказ`);
      nPrice++;
      continue;
    }

    // === D. Труба ЭСВ оцинк. с мусорной ценой → под заказ ===
    if (/Труба ЭСВ/i.test(name) && price != null && w > 0 && price / w < 15) {
      await setOnOrder(p);
      console.log(`ТРУБА→заказ ${name}: ${price} ₽/м при ${w} кг/м → под заказ`);
      nPrice++;
      continue;
    }

    // === E. Сетка рулонная с мусорной ценой → под заказ ===
    if (/Сетка/i.test(name) && price != null && w > 0 && price / w < 15) {
      await setOnOrder(p);
      console.log(`СЕТКА→заказ ${name}: ${price} ₽ при ${w} кг → под заказ`);
      nPrice++;
      continue;
    }

    // === F. Труба профильная unit=шт с весом кг/м → вес × длина ===
    if (/труба профильная/i.test(name) && unit === "шт" && w > 0 && price != null) {
      const sec = parseSection(name);
      if (sec) {
        const kgM = tubeKgM(sec[0], sec[1], sec[2]);
        if (kgM > 0 && Math.abs(w - kgM) / kgM < 0.12) {
          const len = lenM > 0 ? lenM : 6;
          const pieceKg = await setWeight(p, kgM * len);
          const rubPerKg = price / pieceKg;
          if (rubPerKg < 15) {
            await setOnOrder(p);
            console.log(`ТРУБА→заказ ${name}: вес ${w} → ${pieceKg} кг/шт, цена ${price} не бьётся → под заказ`);
            nPrice++;
          } else {
            console.log(`ТРУБА ${name}: вес ${w} → ${pieceKg} кг/шт (${len}м), цена ${price} ₽/шт = ${Math.round(rubPerKg)} ₽/кг OK`);
            nWeight++;
          }
          continue;
        }
      }
    }

    // === G. Труба профильная unit=м с весом ≠ формуле >10% → формула ===
    if (/труба профильная/i.test(name) && unit === "м" && w > 0 && price != null) {
      const sec = parseSection(name);
      if (sec) {
        const calc = tubeKgM(sec[0], sec[1], sec[2]);
        if (Math.abs(w - calc) / calc > 0.1) {
          const rubPerKgOld = price / w;
          const rubPerKgNew = price / calc;
          if (rubPerKgNew >= 25 && rubPerKgNew <= 200) {
            await setWeight(p, calc);
            console.log(`ТРУБА ${name}: вес ${w} → ${calc} кг/м (цена ${Math.round(rubPerKgNew)} ₽/кг OK, была ${Math.round(rubPerKgOld)})`);
            nWeight++;
          } else {
            await setOnOrder(p);
            console.log(`ТРУБА→заказ ${name}: вес ${w} ≠ ${calc}, цена не бьётся → под заказ`);
            nPrice++;
          }
        }
      }
    }

    // === H. Лист оцинкованный 2х1250х2000: вес 31.4 → 39.25 ===
    if (/Лист оцинкованный 2 х 1250 х 2000/.test(name) && Math.abs(w - 31.4) < 0.1) {
      const fixed = await setWeight(p, 39.25);
      console.log(`ЛИСТ ${name}: вес 31.4 → ${fixed} кг`);
      nWeight++;
    }
  }

  console.log(`\nИтог: unit/вес листов ${nUnit}, под заказ ${nPrice}, весов ${nWeight}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
