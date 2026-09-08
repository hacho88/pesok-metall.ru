import { prisma } from "../../src/lib/prisma";

/**
 * Полная корректировка единиц измерения
 * 1. Листовой прокат "м" → "шт"
 * 2. Сетка тканая "м" → "шт"
 * 3. Товары без единицы → определить по категории
 */
async function main() {
  let fixed = 0;

  // 1. Листовой прокат с "м" → "шт"
  const listMeter = await prisma.product.findMany({
    where: {
      unit: "м",
      OR: [
        { name: { contains: "лист", mode: "insensitive" } },
        { name: { contains: "ПВЛ", mode: "insensitive" } },
        { name: { contains: "профнастил", mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, unit: true },
  });
  console.log(`\n1. Листовой прокат с "м": ${listMeter.length}`);
  for (const p of listMeter) {
    const unit = /пвл/i.test(p.name) ? "лист" : "шт";
    await prisma.product.update({ where: { id: p.id }, data: { unit } });
    console.log(`   ${p.unit} → ${unit}: ${p.name}`);
    fixed++;
  }

  // 2. Сетка с "м" → "шт"
  const setkaMeter = await prisma.product.findMany({
    where: {
      unit: "м",
      name: { contains: "сетка", mode: "insensitive" },
    },
    select: { id: true, name: true, unit: true },
  });
  console.log(`\n2. Сетка с "м": ${setkaMeter.length}`);
  for (const p of setkaMeter) {
    await prisma.product.update({ where: { id: p.id }, data: { unit: "шт" } });
    console.log(`   м → шт: ${p.name}`);
    fixed++;
  }

  // 3. Товары без единицы — определить по категории
  const noUnit = await prisma.product.findMany({
    where: { OR: [{ unit: null }, { unit: "" }] },
    select: {
      id: true,
      name: true,
      unit: true,
      category: {
        select: {
          name: true,
          slug: true,
          parent: { select: { name: true, slug: true } },
        },
      },
    },
  });
  console.log(`\n3. Товары без единицы: ${noUnit.length}`);

  for (const p of noUnit) {
    const catName = p.category?.name || "";
    const parentName = p.category?.parent?.name || "";
    const allCats = (catName + " " + parentName).toLowerCase();

    let unit = "шт"; // по умолчанию

    // Сортовой прокат — метры
    if (/арматур|труб|уголок|швеллер|балка|двутавр|полос|квадрат|круг|катанк|штакетник|профил/.test(allCats)) {
      unit = "м";
    }
    // Листовой — штуки
    else if (/лист|пвл|профнастил/.test(allCats)) {
      unit = "шт";
    }
    // Сетка — штуки
    else if (/сетка/.test(allCats)) {
      unit = "шт";
    }
    // Сваи, отводы, заглушки — штуки
    else if (/свай|отвод|заглуш|дополн/.test(allCats)) {
      unit = "шт";
    }
    // Проволока — кг
    else if (/проволок/.test(allCats)) {
      unit = "кг";
    }
    // Сыпучие — тонны
    else if (/песок|щебен|керамзит|сыпуч/.test(allCats)) {
      unit = "т";
    }

    await prisma.product.update({ where: { id: p.id }, data: { unit } });
    fixed++;
  }
  console.log(`   Исправлено: ${noUnit.length} (по категории)`);

  // Итоговая статистика
  const units = await prisma.product.groupBy({
    by: ["unit"],
    _count: { unit: true },
    orderBy: { _count: { unit: "desc" } },
  });
  console.log(`\n=== ИТОГ ===`);
  console.log(`Всего исправлено: ${fixed}`);
  console.log(`Единицы:`);
  units.forEach((u) => console.log(`  "${u.unit}": ${u._count.unit}`));

  await prisma.$disconnect();
}

main().catch(console.error);
