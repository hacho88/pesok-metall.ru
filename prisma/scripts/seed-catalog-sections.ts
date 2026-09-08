import { prisma } from "../../src/lib/prisma";

/**
 * Создание секций каталога + недостающих категорий "Песок и щебень"
 * и назначение всех корневых категорий по секциям с сортировкой.
 */
(async () => {
  // 1. Создаём секции
  const bulkSection = await prisma.catalogSection.upsert({
    where: { slug: "pesok-shcheben" },
    update: { name: "Песок и щебень", sortOrder: 1, isVisible: true },
    create: { slug: "pesok-shcheben", name: "Песок и щебень", sortOrder: 1, isVisible: true },
  });
  const metallSection = await prisma.catalogSection.upsert({
    where: { slug: "metalloprokat" },
    update: { name: "Металлопрокат", sortOrder: 2, isVisible: true },
    create: { slug: "metalloprokat", name: "Металлопрокат", sortOrder: 2, isVisible: true },
  });

  console.log("Sections:");
  console.log("  1.", bulkSection.name, "(sort:", bulkSection.sortOrder, ")");
  console.log("  2.", metallSection.name, "(sort:", metallSection.sortOrder, ")");

  // 2. Создаём недостающие категории "Песок и щебень"
  const bulkCategories = [
    { name: "Песок речной (в мешках 30 кг)", slug: "pesok-rechnoy-30kg" },
    { name: "Песок речной (биг-бег 1 т)", slug: "pesok-rechnoy-bigbag" },
    { name: "Песок строительный (навалом)", slug: "pesok-stroitelnyy-navalom" },
    { name: "Щебень гранитный фр. 5-20", slug: "scheben-granitnyy-5-20" },
    { name: "Щебень гранитный фр. 20-40", slug: "scheben-granitnyy-20-40" },
    { name: "Щебень известняковый", slug: "scheben-izvestnyakovyy" },
    { name: "Отсев гранитный", slug: "otsev-granitnyy" },
    { name: "Торф", slug: "torf" },
  ];

  console.log("\nCreating bulk categories:");
  for (let i = 0; i < bulkCategories.length; i++) {
    const bc = bulkCategories[i];
    const cat = await prisma.category.upsert({
      where: { slug: bc.slug },
      update: { sectionId: bulkSection.id, sortOrder: i },
      create: { name: bc.name, slug: bc.slug, sectionId: bulkSection.id, sortOrder: i },
    });
    console.log(`  [${i}] ${cat.name} (slug: ${cat.slug})`);
  }

  // 3. Порядок металлопрокатных категорий
  const metallOrder = [
    "Арматура",
    "Балка двутавровая",
    "Винтовые сваи",
    "Дополнительные материалы",
    "Квадрат стальной",
    "Лист металлический",
    "Металлический штакетник",
    "Полоса металлическая",
    "Профнастил",
    "Проволока",
    "Сетка металлическая",
    "Труба профильная",
    "Трубы",
    "Уголок",
    "Швеллер",
  ];

  // 4. Назначаем секции всем корневым категориям
  const allRoots = await prisma.category.findMany({ where: { parentId: null } });
  console.log(`\nAssigning ${allRoots.length} root categories:`);

  for (const cat of allRoots) {
    // Пропускаем уже назначенные в bulk
    if (cat.sectionId === bulkSection.id) {
      console.log(`  [skip] ${cat.name} (already in Песок и щебень)`);
      continue;
    }

    // Точное совпадение с metallOrder
    const exactIdx = metallOrder.findIndex((name) => cat.name === name);
    if (exactIdx >= 0) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { sectionId: metallSection.id, sortOrder: exactIdx },
      });
      console.log(`  [Металлопрокат #${exactIdx}] ${cat.name}`);
      continue;
    }

    // Частичное совпадение
    const partialIdx = metallOrder.findIndex((name) =>
      cat.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(cat.name.toLowerCase())
    );
    if (partialIdx >= 0) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { sectionId: metallSection.id, sortOrder: partialIdx },
      });
      console.log(`  [Металлопрокат #${partialIdx}] ${cat.name} (partial match)`);
      continue;
    }

    // Нераспознанные — в металлопрокат с sortOrder=99
    await prisma.category.update({
      where: { id: cat.id },
      data: { sectionId: metallSection.id, sortOrder: 99 },
    });
    console.log(`  [Металлопрокат #99] ${cat.name} (unrecognized)`);
  }

  // Итоговая статистика
  const bulkCount = await prisma.category.count({ where: { sectionId: bulkSection.id, parentId: null } });
  const metallCount = await prisma.category.count({ where: { sectionId: metallSection.id, parentId: null } });
  console.log(`\nResult: ${bulkCount} bulk categories, ${metallCount} metall categories`);

  await prisma.$disconnect();
})();
