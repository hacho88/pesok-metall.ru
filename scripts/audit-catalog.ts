import { prisma } from "../src/lib/prisma";

/** Справочник кг/м для арматуры/катанки ГОСТ 5781-82 */
const REBAR_KG_M: Record<string, number> = {
  "6": 0.222, "8": 0.395, "10": 0.617, "12": 0.888, "14": 1.21,
  "16": 1.58, "18": 2.0, "20": 2.47, "22": 2.98, "25": 3.85,
  "28": 4.83, "32": 6.31, "36": 7.99, "40": 9.87,
};

function tubeKgM(a: number, b: number, t: number): number {
  return Math.round((2 * (a - t) + 2 * (b - t)) * t * 0.00785 * 1000) / 1000;
}
function roundTubeKgM(d: number, t: number): number {
  return Math.round(Math.PI * (d - t) * t * 0.00785 * 1000) / 1000;
}
function parseSection(name: string): [number, number, number] | null {
  const m = name.match(/(\d{2,3})[хx](\d{2,3})[хx](\d(?:[.,]\d)?)\s*$/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3].replace(",", "."))];
}
function parseRound(name: string): [number, number] | null {
  // "Труба 57х3.5" или "57x3"
  const m = name.match(/(\d{2,3})[хx](\d(?:[.,]\d)?)\s*$/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2].replace(",", "."))];
}

interface Issue {
  name: string;
  cat: string;
  unit: string | null;
  weight: number;
  price: number | null;
  problem: string;
}

async function main() {
  const products = await prisma.product.findMany({
    include: { attributes: true, category: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  const issues: Issue[] = [];
  let checked = 0;

  for (const p of products) {
    checked++;
    const name = p.name;
    const unit = p.unit;
    const w = Number(p.weightKg);
    const price = p.priceRetailBase != null ? Number(p.priceRetailBase) : null;
    const cat = p.category.name;
    const dia = p.attributes.find((a) => /диаметр/i.test(a.key))?.value ?? "";
    const diaNum = dia.replace(/[^\d,.]/g, "").replace(",", ".");
    const lenAttr = p.attributes.find((a) => /длина/i.test(a.key))?.value ?? "";
    const lenM = Number((lenAttr.match(/(\d+(?:[.,]\d+)?)/) ?? [])[1]?.replace(",", ".") ?? 0);
    const vesAttr = p.attributes.find((a) => /^вес/i.test(a.key))?.value ?? "";

    // === 1. Нет единицы ===
    if (!unit) {
      issues.push({ name, cat, unit, weight: w, price, problem: "НЕТ unit" });
      continue;
    }

    // === 2. Вес-заглушка 1 кг (кроме проволоки кг и петли) ===
    if (w === 1 && !/проволок/i.test(name) && !/петл/i.test(name)) {
      issues.push({ name, cat, unit, weight: w, price, problem: "вес-заглушка 1 кг" });
      continue;
    }

    // === 3. Расчётная цена за кг вне диапазона 15-300 ₽/кг ===
    if (price != null && w > 0 && !/электрод/i.test(name)) {
      const rubPerKg = price / w;
      if (rubPerKg > 300) {
        issues.push({ name, cat, unit, weight: w, price, problem: `ЦЕНА ЗА кг = ${Math.round(rubPerKg)} ₽/кг — ЗАВЫШЕНА` });
        continue;
      }
      if (rubPerKg < 15) {
        issues.push({ name, cat, unit, weight: w, price, problem: `цена за кг = ${Math.round(rubPerKg)} ₽/кг — занижена (вес завышен?)` });
        continue;
      }
    }

    // === 4. Арматура/катанка: вес не совпадает с ГОСТ ===
    if (/арматур|катанк/i.test(name) && !/стеклопластик/i.test(name) && diaNum && REBAR_KG_M[diaNum]) {
      const gost = REBAR_KG_M[diaNum];
      if (unit === "м" && Math.abs(w - gost) / gost > 0.05) {
        issues.push({ name, cat, unit, weight: w, price, problem: `вес ${w} ≠ ГОСТ ${gost} кг/м` });
        continue;
      }
    }

    // === 5. Труба профильная unit=м: вес ≠ формуле (±5%) ===
    if (/труба (профильная|квадратная|прямоугольная)/i.test(name) && unit === "м" && w > 0) {
      const sec = parseSection(name);
      if (sec) {
        const calc = tubeKgM(sec[0], sec[1], sec[2]);
        if (Math.abs(w - calc) / calc > 0.08) {
          issues.push({ name, cat, unit, weight: w, price, problem: `вес ${w} ≠ расчёт ${calc} кг/м` });
          continue;
        }
      }
    }

    // === 6. Труба круглая unit=м: вес ≠ формуле (±8%) ===
    if (/труба (круглая|профильная кругл)/i.test(name) && unit === "м" && w > 0 && diaNum) {
      const rt = parseRound(`${diaNum} `) ?? parseRound(name);
      if (rt && rt[1] >= 1 && rt[1] <= 12) {
        const calc = roundTubeKgM(rt[0], rt[1]);
        if (calc > 0 && Math.abs(w - calc) / calc > 0.1) {
          issues.push({ name, cat, unit, weight: w, price, problem: `вес ${w} ≠ расчёт ${calc} кг/м (D=${rt[0]} t=${rt[1]})` });
          continue;
        }
      }
    }

    // === 7. Атрибут «Вес» не совпадает с weightKg ===
    if (vesAttr) {
      const attrNum = Number(vesAttr.replace(/[^\d,.]/g, "").replace(",", "."));
      if (!isNaN(attrNum) && attrNum > 0 && Math.abs(attrNum - w) / w > 0.02) {
        issues.push({ name, cat, unit, weight: w, price, problem: `атрибут Вес=${vesAttr} ≠ weightKg=${w}` });
        continue;
      }
    }

    // === 8. Штучный погонаж: unit=шт но вес выглядит как кг/м (большая труба 6-12м) ===
    if (unit === "шт" && /труба/i.test(name) && w > 5 && w < 40 && price != null) {
      const sec = parseSection(name);
      if (sec) {
        const kgM = tubeKgM(sec[0], sec[1], sec[2]);
        if (kgM > 0 && Math.abs(w - kgM) / kgM < 0.1) {
          issues.push({ name, cat, unit, weight: w, price, problem: `unit=шт но вес ${w} = кг/м (${kgM}) — вес штуки не умножен на длину` });
          continue;
        }
      }
    }

    // === 9. Лист: вес ≠ 7.85 × толщина × площадь (±10%) ===
    const sheet = name.match(/(\d+(?:[.,]\d)?)\s*[хx]\s*(\d{3,4})\s*[хx]\s*(\d{3,4})/);
    if (unit === "шт" && /лист/i.test(name) && sheet && w > 0) {
      const t = Number(sheet[1].replace(",", "."));
      const area = (Number(sheet[2]) / 1000) * (Number(sheet[3]) / 1000);
      const calc = Math.round(7.85 * t * area * 100) / 100;
      if (Math.abs(w - calc) / calc > 0.12) {
        issues.push({ name, cat, unit, weight: w, price, problem: `лист: вес ${w} ≠ расчёт ${calc} кг (${t}мм ${sheet[2]}x${sheet[3]})` });
        continue;
      }
    }
  }

  const lines: string[] = [];
  lines.push(`Проверено товаров: ${checked}`);
  lines.push(`Найдено проблем: ${issues.length}\n`);

  const byCat = new Map<string, Issue[]>();
  for (const i of issues) {
    const key = i.problem.split("—")[0].split("=")[0].trim().slice(0, 40);
    if (!byCat.has(key)) byCat.set(key, []);
    byCat.get(key)!.push(i);
  }
  for (const [key, list] of byCat) {
    lines.push(`--- ${key} (${list.length}) ---`);
    for (const i of list.slice(0, 30)) {
      lines.push(`  ${i.name} | ${i.unit} | вес=${i.weight} | цена=${i.price} | ${i.problem}`);
    }
    if (list.length > 30) lines.push(`  ... и ещё ${list.length - 30}`);
  }

  const fs = await import("fs");
  fs.writeFileSync("scripts/audit-report.txt", lines.join("\n"), "utf8");
  console.log("Отчёт: scripts/audit-report.txt");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
