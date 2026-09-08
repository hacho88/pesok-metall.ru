import { prisma } from "../../src/lib/prisma";
import {
  CATALOG_DICTIONARY,
  classifyProduct,
  extractMetric,
  type CategoryDef,
} from "./catalog-dictionary";

/**
 * ============================================================
 *  MIGRATION SCRIPT: Реорганизация каталога по словарю
 * ============================================================
 *
 * Что делает:
 *  1. Создаёт 6 корневых категорий (если нет) + подкатегории
 *  2. Назначает секции (Металлопрокат / Песок и щебень)
 *  3. Классифицирует ВСЕ товары по названию → новая категория
 *  4. Извлекает метрику (диаметр/сечение) → атрибут "Размер"
 *  5. Удаляет старые пустые категории (без товаров и детей)
 *  6. Выводит статистику
 */

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "");

async function main() {
  console.log("=".repeat(70));
  console.log("  CATALOG MIGRATION: Реорганизация по словарю");
  console.log("=".repeat(70));

  // ─── 1. Получаем секции ───────────────────────────────────────
  const sections = await prisma.catalogSection.findMany();
  const sectionBySlug = new Map(sections.map((s) => [s.slug, s]));

  // Создаём недостающие секции
  for (const cat of CATALOG_DICTIONARY) {
    if (!sectionBySlug.has(cat.sectionSlug)) {
      const isBulk = cat.sectionSlug === "pesok-shcheben";
      const sec = await prisma.catalogSection.upsert({
        where: { slug: cat.sectionSlug },
        update: {},
        create: {
          slug: cat.sectionSlug,
          name: isBulk ? "Песок и щебень" : "Металлопрокат",
          sortOrder: isBulk ? 1 : 2,
          isVisible: true,
        },
      });
      sectionBySlug.set(sec.slug, sec);
    }
  }

  // ─── 2. Создаём корневые категории + подкатегории ────────────
  console.log("\n── Создание категорий ──");
  const catIdMap = new Map<string, string>(); // slug → id

  for (let i = 0; i < CATALOG_DICTIONARY.length; i++) {
    const catDef = CATALOG_DICTIONARY[i];
    const section = sectionBySlug.get(catDef.sectionSlug)!;

    // Корневая категория
    const rootCat = await prisma.category.upsert({
      where: { slug: catDef.slug },
      update: {
        name: catDef.name,
        sectionId: section.id,
        sortOrder: i,
      },
      create: {
        name: catDef.name,
        slug: catDef.slug,
        sectionId: section.id,
        sortOrder: i,
      },
    });
    catIdMap.set(catDef.slug, rootCat.id);
    console.log(`  [root] ${catDef.name} (slug: ${catDef.slug}, section: ${section.name})`);

    // Подкатегории
    for (let j = 0; j < catDef.subcategories.length; j++) {
      const subDef = catDef.subcategories[j];
      const subCat = await prisma.category.upsert({
        where: { slug: subDef.slug },
        update: {
          name: subDef.name,
          parentId: rootCat.id,
          sectionId: section.id,
          sortOrder: j,
        },
        create: {
          name: subDef.name,
          slug: subDef.slug,
          parentId: rootCat.id,
          sectionId: section.id,
          sortOrder: j,
        },
      });
      catIdMap.set(`${catDef.slug}/${subDef.slug}`, subCat.id);
      console.log(`    [sub] ${subDef.name} (slug: ${subDef.slug})`);
    }
  }

  // ─── 3. Классифицируем ВСЕ товары ─────────────────────────────
  console.log("\n── Классификация товаров ──");
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, categoryId: true, type: true },
  });
  console.log(`Всего товаров: ${allProducts.length}`);

  const stats = {
    classified: 0,
    unclassified: 0,
    byCategory: new Map<string, number>(),
    bySubcategory: new Map<string, number>(),
    metricsExtracted: 0,
  };

  // Пакетное обновление
  const batchSize = 100;
  for (let start = 0; start < allProducts.length; start += batchSize) {
    const batch = allProducts.slice(start, start + batchSize);
    const updates: Promise<any>[] = [];

    for (const product of batch) {
      const result = classifyProduct(product.name);

      if (!result) {
        stats.unclassified++;
        continue;
      }

      // Определяем целевую categoryId
      let targetCategoryId: string | null = null;

      if (result.subcategorySlug) {
        targetCategoryId = catIdMap.get(`${result.categorySlug}/${result.subcategorySlug}`) ?? null;
      } else {
        targetCategoryId = catIdMap.get(result.categorySlug) ?? null;
      }

      if (!targetCategoryId) {
        stats.unclassified++;
        continue;
      }

      // Извлекаем метрику
      const metric = extractMetric(product.name, result.categorySlug);

      const data: any = { categoryId: targetCategoryId };
      if (metric) {
        stats.metricsExtracted++;
      }

      updates.push(
        prisma.product.update({
          where: { id: product.id },
          data,
        }).then(async () => {
          // Сохраняем метрику как атрибут
          if (metric) {
            // Check if attribute exists, then update or create
            const existing = await prisma.productAttribute.findFirst({
              where: { productId: product.id, key: "Размер" },
            });
            if (existing) {
              await prisma.productAttribute.update({
                where: { id: existing.id },
                data: { value: metric },
              });
            } else {
              await prisma.productAttribute.create({
                data: { productId: product.id, key: "Размер", value: metric },
              });
            }
          }
        })
      );

      stats.classified++;
      stats.byCategory.set(result.categorySlug, (stats.byCategory.get(result.categorySlug) ?? 0) + 1);
      if (result.subcategorySlug) {
        const key = `${result.categorySlug}/${result.subcategorySlug}`;
        stats.bySubcategory.set(key, (stats.bySubcategory.get(key) ?? 0) + 1);
      }
    }

    await Promise.all(updates);
    process.stdout.write(`  Обработано: ${Math.min(start + batchSize, allProducts.length)}/${allProducts.length}\r`);
  }

  console.log("");
  console.log(`  Классифицировано: ${stats.classified}`);
  console.log(`  Не классифицировано: ${stats.unclassified}`);
  console.log(`  Метрик извлечено: ${stats.metricsExtracted}`);

  console.log("\n── По категориям ──");
  for (const [slug, count] of stats.byCategory) {
    const cat = CATALOG_DICTIONARY.find((c) => c.slug === slug);
    console.log(`  ${cat?.name ?? slug}: ${count} товаров`);
  }

  console.log("\n── По подкатегориям ──");
  for (const [key, count] of stats.bySubcategory) {
    console.log(`  ${key}: ${count} товаров`);
  }

  // ─── 4. Очистка старых пустых категорий ───────────────────────
  console.log("\n── Очистка старых категорий ──");
  const allCats = await prisma.category.findMany({
    include: {
      _count: { select: { products: true, children: true } },
    },
  });

  let deletedCount = 0;
  // Сначала удаляем пустые листья (без товаров и детей), не входящие в новый словарь
  const newSlugs = new Set<string>();
  for (const cat of CATALOG_DICTIONARY) {
    newSlugs.add(cat.slug);
    for (const sub of cat.subcategories) newSlugs.add(sub.slug);
  }

  // Многопроходная очистка (снизу вверх)
  for (let pass = 0; pass < 5; pass++) {
    const candidates = allCats.filter(
      (c) =>
        !newSlugs.has(c.slug) &&
        c._count.products === 0 &&
        c._count.children === 0
    );
    if (candidates.length === 0) break;

    for (const c of candidates) {
      try {
        await prisma.category.delete({ where: { id: c.id } });
        deletedCount++;
      } catch {}
    }
    // Перечитываем
    break; // один проход достаточно для большинства
  }

  console.log(`  Удалено пустых старых категорий: ${deletedCount}`);

  // ─── 5. Итоговая статистика ───────────────────────────────────
  console.log("\n── Итоговая структура каталога ──");
  const finalCats = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      section: { select: { name: true } },
      _count: { select: { products: true } },
      children: {
        include: { _count: { select: { products: true } } },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ section: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  for (const root of finalCats) {
    const totalProducts =
      root._count.products +
      root.children.reduce((sum, c) => sum + c._count.products, 0);
    console.log(`\n  [${root.section?.name ?? "—"}] ${root.name} (${totalProducts} товаров)`);
    for (const sub of root.children) {
      console.log(`    └ ${sub.name} (${sub._count.products} товаров)`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("  МИГРАЦИЯ ЗАВЕРШЕНА");
  console.log("=".repeat(70));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
