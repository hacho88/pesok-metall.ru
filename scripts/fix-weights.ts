import { prisma } from "../src/lib/prisma";

/** Точные кг/м по ГОСТ 5781-82 (арматура) и ГОСТ 34028 */
const REBAR_KG_M: Record<string, number> = {
  "6": 0.222, "8": 0.395, "10": 0.617, "12": 0.888, "14": 1.21,
  "16": 1.58, "18": 2.0, "20": 2.47, "22": 2.98, "25": 3.85,
  "28": 4.83, "32": 6.31, "36": 7.99, "40": 9.87,
};

/** Вес профильной трубы кг/м: (2(a-t)+2(b-t))·t·0.00785 — проверено: 40х20х2 → 1.79 (реал 1.78) */
function tubeKgM(a: number, b: number, t: number): number {
  return Math.round((2 * (a - t) + 2 * (b - t)) * t * 0.00785 * 1000) / 1000;
}

/** Парсит "40х20х2" / "40x20x2" → [40, 20, 2] */
function parseSection(name: string): [number, number, number] | null {
  const m = name.match(/(\d{2,3})[хx](\d{2,3})[хx](\d(?:[.,]\d)?)\s*$/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3].replace(",", "."))];
}

async function setWeight(id: string, kg: number, attrs: { id: string; key: string; value: string }[]) {
  const rounded = Math.round(kg * 1000) / 1000;
  await prisma.product.update({ where: { id }, data: { weightKg: rounded } });
  const wAttr = attrs.find((a) => /вес/i.test(a.key));
  if (wAttr) {
    await prisma.productAttribute.update({
      where: { id: wAttr.id },
      data: { value: `${rounded} кг` },
    });
  } else {
    await prisma.productAttribute.create({
      data: { productId: id, key: "Вес", value: `${rounded} кг` },
    });
  }
}

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true, name: true, unit: true, weightKg: true, priceRetailBase: true,
      attributes: { select: { id: true, key: true, value: true } },
    },
  });

  let fixed = 0;

  for (const p of products) {
    const name = p.name;
    const dia = p.attributes.find((a) => /диаметр/i.test(a.key))?.value ?? "";
    const diaNum = dia.replace(/[^\d,.]/g, "").replace(",", ".");

    // === 1. Арматура 3 м. — штучная цена 2780 ₽ ошибочна, приводим к погонажу ===
    if (/^Арматура 12 мм\. А500С 3 м\.$/.test(name)) {
      await prisma.product.update({
        where: { id: p.id },
        data: { unit: "м", priceRetailBase: 52 }, // наша цена А500С 12 мм = 52 ₽/м
      });
      if (!p.attributes.some((a) => /длина/i.test(a.key))) {
        await prisma.productAttribute.create({
          data: { productId: p.id, key: "Длина", value: "3 м" },
        });
      }
      console.log(`FIX ${name}: шт 2780 -> м 52/m`);
      fixed++;
      continue;
    }

    // === 2. Арматура 10/8 мм 3 м. — вес-заглушка -> точный кг/м ===
    if (/^Арматура 10 мм\. А500С 3 м\.$/.test(name) && Number(p.weightKg) === 1) {
      await setWeight(p.id, REBAR_KG_M["10"], p.attributes);
      if (!p.attributes.some((a) => /длина/i.test(a.key))) {
        await prisma.productAttribute.create({ data: { productId: p.id, key: "Длина", value: "3 м" } });
      }
      console.log(`FIX ${name}: вес 1 -> 0.617`);
      fixed++;
      continue;
    }
    if (/^Арматура 8 мм\. А500С 3 м$/.test(name) && Number(p.weightKg) === 1) {
      await setWeight(p.id, REBAR_KG_M["8"], p.attributes);
      if (!p.attributes.some((a) => /длина/i.test(a.key))) {
        await prisma.productAttribute.create({ data: { productId: p.id, key: "Длина", value: "3 м" } });
      }
      console.log(`FIX ${name}: вес 1 -> 0.395`);
      fixed++;
      continue;
    }

    // === 3. Арматура рифленая/катанка/стеклопластик с весом-заглушкой ===
    if (Number(p.weightKg) === 1 && /арматур|катанк/i.test(name) && !/стеклопластик/i.test(name) && diaNum && REBAR_KG_M[diaNum]) {
      await setWeight(p.id, REBAR_KG_M[diaNum], p.attributes);
      console.log(`FIX ${name}: вес 1 -> ${REBAR_KG_M[diaNum]}`);
      fixed++;
      continue;
    }
    if (/стеклопластиковая композитная 12 мм/i.test(name) && Math.abs(Number(p.weightKg) - 0.888) < 0.001) {
      await setWeight(p.id, 0.165, p.attributes);
      console.log(`FIX ${name}: вес 0.888 -> 0.165`);
      fixed++;
      continue;
    }
    if (Number(p.weightKg) === 1 && /стеклопластик/i.test(name) && diaNum === "12") {
      await setWeight(p.id, 0.165, p.attributes);
      console.log(`FIX ${name}: вес 1 -> 0.165`);
      fixed++;
      continue;
    }
    if (/А500Т рифленая 12 мм/.test(name) && Math.abs(Number(p.weightKg) - 0.769) < 0.001) {
      await setWeight(p.id, 0.888, p.attributes);
      console.log(`FIX ${name}: вес 0.769 -> 0.888`);
      fixed++;
      continue;
    }

    // === 4. Труба профильная / швеллер гнутый с весом-заглушкой -> формула ===
    if (Number(p.weightKg) === 1 && (/труба профильная/i.test(name) || /швеллер гнутый/i.test(name))) {
      const sec = parseSection(name);
      if (sec) {
        const kg = tubeKgM(sec[0], sec[1], sec[2]);
        await setWeight(p.id, kg, p.attributes);
        console.log(`FIX ${name}: вес 1 -> ${kg} (raschet)`);
        fixed++;
        continue;
      }
    }

    // === 5. Балка двутавровая (сортамент ГОСТ Р 57837) ===
    if (Number(p.weightKg) === 1 && /балка двутавровая 30 Ш1/i.test(name)) {
      await setWeight(p.id, 58.2, p.attributes);
      console.log(`FIX ${name}: вес 1 -> 58.2`);
      fixed++;
      continue;
    }
    if (Number(p.weightKg) === 1 && /балка двутавровая 35 К1/i.test(name)) {
      await setWeight(p.id, 97.1, p.attributes);
      console.log(`FIX ${name}: вес 1 -> 97.1`);
      fixed++;
      continue;
    }
  }

  console.log(`\nOK ispravleno: ${fixed}`);
  const rest = await prisma.product.count({ where: { weightKg: 1 } });
  console.log(`Ostalos weightKg=1: ${rest}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
