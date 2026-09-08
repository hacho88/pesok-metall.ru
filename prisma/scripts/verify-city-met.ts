import { prisma } from "../../src/lib/prisma";
import { extractProducts, extractNextPageUrl } from "../../src/lib/parser/extract";
import { fetchHtml, closeSharedBrowser } from "../../src/lib/parser/transport";

/**
 * Верификация: сравнивает товары и цены в БД с city-met.ru
 *
 * Запуск:
 *   npx tsx prisma/scripts/verify-city-met.ts                    # все категории
 *   npx tsx prisma/scripts/verify-city-met.ts --category=armatura # одна категория
 *   npx tsx prisma/scripts/verify-city-met.ts --dry-run           # только отчёт
 *   npx tsx prisma/scripts/verify-city-met.ts --fix               # обновить цены в БД
 */

const BASE = "https://city-met.ru";
const MAX_PAGES = 20;
const DELAY_MS = 800;

function parseArgs() {
  const args: Record<string, string | boolean> = {};
  for (const arg of process.argv.slice(2)) {
    const [key, value] = arg.replace(/^--/, "").split("=");
    args[key] = value === undefined ? true : value;
  }
  return args;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface SourceProduct {
  name: string;
  price: number | null;
  unit: string | undefined;
  sourceUrl: string;
}

interface CategoryReport {
  categorySlug: string;
  categoryName: string;
  sourceUrl: string;
  dbCount: number;
  sourceCount: number;
  matched: number;
  priceMismatch: number;
  missingInDb: number;
  missingInSource: number;
  mismatches: { name: string; dbPrice: number | null; sourcePrice: number | null; unit: string }[];
  missingProducts: string[];
}

async function fetchCategoryProducts(categoryUrl: string): Promise<SourceProduct[]> {
  const products: SourceProduct[] = [];
  let url: string | null = categoryUrl;
  let pages = 0;

  while (url && pages < MAX_PAGES) {
    const html = await fetchHtml(url, "playwright");
    if (!html) break;

    const extracted = extractProducts(html, url, "", "");
    for (const p of extracted) {
      products.push({
        name: p.name.trim(),
        price: p.price,
        unit: p.unit,
        sourceUrl: p.sourceUrl || "",
      });
    }

    url = extractNextPageUrl(html, url);
    pages++;
    if (url) await sleep(DELAY_MS);
  }

  return products;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[ё]/g, "е")
    .replace(/[хx]/g, "х")
    .replace(/[^a-zа-я0-9х.,\s-]/gi, "")
    .trim();
}

async function main() {
  const args = parseArgs();
  const fix = args.fix === true;
  const categoryFilter = typeof args.category === "string" ? args.category : null;

  console.log(`\n🔍 Верификация БД с city-met.ru`);
  console.log(`   Режим: ${fix ? "исправление цен" : "только отчёт"}`);
  console.log(`   Категория: ${categoryFilter || "все"}`);
  console.log(`   Браузер: headed (KillBot обход)\n`);

  // KillBot требует headed браузер
  process.env.HEADLESS = "0";

  // Получаем категории из metal-categories.json
  const fs = await import("node:fs");
  let categories: { name: string; url: string; parentName?: string | null }[] = [];
  try {
    categories = JSON.parse(fs.readFileSync("metal-categories.json", "utf-8"));
  } catch {
    console.error("❌ metal-categories.json не найден");
    process.exit(1);
  }

  // Фильтруем только корневые категории (без parentName)
  let rootCats = categories.filter((c) => !c.parentName);
  if (categoryFilter) {
    rootCats = rootCats.filter((c) => c.url.includes(categoryFilter));
  }

  console.log(`   Корневых категорий: ${rootCats.length}\n`);

  const reports: CategoryReport[] = [];
  let totalMatched = 0;
  let totalMismatches = 0;
  let totalMissing = 0;
  let totalFixed = 0;

  for (const cat of rootCats) {
    console.log(`\n📂 ${cat.name} — ${cat.url}`);

    // Получаем товары с city-met.ru
    let sourceProducts: SourceProduct[] = [];
    try {
      sourceProducts = await fetchCategoryProducts(cat.url);
      console.log(`   С сайта: ${sourceProducts.length} товаров`);
    } catch (e) {
      console.log(`   ❌ Ошибка загрузки: ${e instanceof Error ? e.message : e}`);
      continue;
    }

    if (sourceProducts.length === 0) {
      console.log(`   ⏭️  Пропуск (нет товаров на сайте)`);
      continue;
    }

    // Получаем товары из БД (все подкатегории)
    const dbProducts = await prisma.product.findMany({
      where: {
        OR: [
          { category: { slug: { contains: cat.url.replace(BASE + "/", "").replace("/", "") } } },
          { category: { parent: { slug: { contains: cat.url.replace(BASE + "/", "").replace("/", "") } } } },
        ],
      },
      select: { id: true, name: true, priceRetailBase: true, unit: true, slug: true },
    });

    console.log(`   В БД: ${dbProducts.length} товаров`);

    // Сравниваем
    const sourceMap = new Map<string, SourceProduct>();
    for (const sp of sourceProducts) {
      sourceMap.set(normalizeName(sp.name), sp);
    }

    const dbMap = new Map<string, (typeof dbProducts)[0]>();
    for (const dp of dbProducts) {
      dbMap.set(normalizeName(dp.name), dp);
    }

    const mismatches: CategoryReport["mismatches"] = [];
    const missingProducts: string[] = [];
    let matched = 0;
    let priceMismatch = 0;

    // Проверяем цены
    for (const [normName, sp] of sourceMap) {
      const dp = dbMap.get(normName);
      if (!dp) {
        missingProducts.push(sp.name);
        continue;
      }

      matched++;
      const dbPrice = dp.priceRetailBase ? Number(dp.priceRetailBase) : null;
      const sourcePrice = sp.price;

      if (sourcePrice && dbPrice && Math.abs(sourcePrice - dbPrice) > 1) {
        priceMismatch++;
        mismatches.push({
          name: sp.name,
          dbPrice,
          sourcePrice,
          unit: sp.unit || dp.unit || "?",
        });

        // Исправляем цену если --fix
        if (fix) {
          await prisma.product.update({
            where: { id: dp.id },
            data: {
              priceRetailBase: sourcePrice,
              unit: sp.unit || dp.unit,
            },
          });
          totalFixed++;
        }
      } else if (sourcePrice && !dbPrice) {
        // В БД нет цены, на сайте есть
        priceMismatch++;
        mismatches.push({
          name: sp.name,
          dbPrice: null,
          sourcePrice,
          unit: sp.unit || dp.unit || "?",
        });

        if (fix) {
          await prisma.product.update({
            where: { id: dp.id },
            data: {
              priceRetailBase: sourcePrice,
              unit: sp.unit || dp.unit,
            },
          });
          totalFixed++;
        }
      }
    }

    const missingInDb = missingProducts.length;
    const missingInSource = dbProducts.length - matched;

    const report: CategoryReport = {
      categorySlug: cat.url.replace(BASE + "/", "").replace("/", ""),
      categoryName: cat.name,
      sourceUrl: cat.url,
      dbCount: dbProducts.length,
      sourceCount: sourceProducts.length,
      matched,
      priceMismatch,
      missingInDb,
      missingInSource,
      mismatches,
      missingProducts,
    };
    reports.push(report);

    totalMatched += matched;
    totalMismatches += priceMismatch;
    totalMissing += missingInDb;

    console.log(`   ✅ Совпало: ${matched}`);
    console.log(`   ⚠️  Цена отличается: ${priceMismatch}`);
    console.log(`   ❌ Нет в БД: ${missingInDb}`);
    console.log(`   ❓ Нет на сайте: ${missingInSource}`);

    if (mismatches.length > 0) {
      console.log(`\n   Расхождения цен (первые 5):`);
      mismatches.slice(0, 5).forEach((m) => {
        const dbP = m.dbPrice ? `${m.dbPrice} ₽` : "нет";
        console.log(`     ${m.name.substring(0, 40)}: БД=${dbP} → сайт=${m.sourcePrice} ₽/${m.unit}`);
      });
    }

    if (missingProducts.length > 0) {
      console.log(`\n   Отсутствует в БД (первые 5):`);
      missingProducts.slice(0, 5).forEach((m) => console.log(`     - ${m}`));
    }

    await sleep(DELAY_MS);
  }

  // Итоговый отчёт
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 ИТОГОВЫЙ ОТЧЁТ`);
  console.log(`${"=".repeat(60)}`);
  console.log(`   Категорий проверено:  ${reports.length}`);
  console.log(`   Всего совпало:        ${totalMatched}`);
  console.log(`   Расхождений цен:      ${totalMismatches}`);
  console.log(`   Нет в БД:             ${totalMissing}`);
  if (fix) {
    console.log(`   Цен исправлено:       ${totalFixed}`);
  }

  // Сохраняем отчёт в файл
  const reportPath = "verify-report.json";
  const fs2 = await import("node:fs");
  fs2.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        date: new Date().toISOString(),
        summary: {
          categoriesChecked: reports.length,
          totalMatched,
          totalMismatches,
          totalMissing,
          totalFixed,
        },
        reports: reports.map((r) => ({
          category: r.categoryName,
          url: r.sourceUrl,
          dbCount: r.dbCount,
          sourceCount: r.sourceCount,
          matched: r.matched,
          priceMismatch: r.priceMismatch,
          missingInDb: r.missingInDb,
          missingInSource: r.missingInSource,
          sampleMismatches: r.mismatches.slice(0, 10),
          sampleMissing: r.missingProducts.slice(0, 10),
        })),
      },
      null,
      2,
    ),
  );
  console.log(`\n📄 Отчёт сохранён: ${reportPath}`);

  await closeSharedBrowser();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Сбой:", e);
  process.exit(1);
});
