import { prisma } from "../../src/lib/prisma";

/**
 * Исправляет единицы измерения для листового проката.
 * Проблема: парсер записал "м" для листов, которые продаются за штуку.
 * Правило:
 *   - Лист горячекатаный / рифленый → "шт" (цена за лист)
 *   - Лист просечно-вытяжной → "лист"
 *   - Лист холоднокатаный / оцинкованный → уже "шт" (правильно)
 */
async function main() {
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { slug: "listovoj-prokat" },
        { parent: { slug: "listovoj-prokat" } },
      ],
    },
    select: { id: true, name: true, slug: true },
  });

  console.log(`Найдено категорий листового проката: ${categories.length}`);

  let totalFixed = 0;

  for (const cat of categories) {
    // Пропускаем категории где уже "шт"
    if (cat.slug === "list-holodnokatanyj" || cat.slug === "list-otsinkovannyj") {
      console.log(`  ⏭️  ${cat.name} — уже корректно (шт)`);
      continue;
    }

    // Для ПВЛ — ставим "лист"
    const targetUnit = cat.slug === "list-prosechno-vytyazhnoj" ? "лист" : "шт";

    const result = await prisma.product.updateMany({
      where: {
        categoryId: cat.id,
        unit: { in: ["м", "meter", "metr"] },
      },
      data: { unit: targetUnit },
    });

    console.log(`  ✅ ${cat.name} → unit="${targetUnit}" | обновлено: ${result.count}`);
    totalFixed += result.count;
  }

  console.log(`\nИтого исправлено: ${totalFixed} товаров`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Ошибка:", e);
  process.exit(1);
});
