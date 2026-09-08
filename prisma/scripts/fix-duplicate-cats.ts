import { prisma } from "../../src/lib/prisma";

/**
 * Удаляет пустые дублирующиеся категории (старые транслит-слаги)
 * и переносит товары из дубликатов в основные категории
 */
async function main() {
  // Пустые корневые категории (0 товаров в корне + 0 во всех подкатегориях)
  const emptySlugs = [
    "armatura",
    "vintovye-svai",
    "dopolnitelnye-materialy",
    "listovoj-prokat",
    "metallicheskiy-shtaketnik",
    "polosa-metallicheskaya",
    "provoloka",
    "profnastil",
    "setka-metallicheskaya",
    "pesok-shcheben",
    "truby-kruglye",
    "fasonnyj-prokat",
  ];

  console.log("=== УДАЛЕНИЕ ПУСТЫХ ДУБЛИКАТОВ ===\n");

  for (const slug of emptySlugs) {
    const cat = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });

    if (!cat) {
      console.log(`⏭️  ${slug} — не найдена`);
      continue;
    }

    // Проверяем что действительно пустая
    const childProducts = await prisma.product.count({
      where: { category: { parent: { slug } } },
    });

    if (cat._count.products > 0 || childProducts > 0) {
      console.log(`⚠️  ${cat.name} (${slug}) — НЕ пустая: ${cat._count.products} + ${childProducts} товаров. Пропуск.`);
      continue;
    }

    // Удаляем подкатегории
    for (const child of cat.children) {
      // Проверяем что подкатегория тоже пустая
      const childCount = await prisma.product.count({ where: { categoryId: child.id } });
      if (childCount === 0) {
        await prisma.category.delete({ where: { id: child.id } });
        console.log(`   └─ удалена подкатегория: ${child.name} (${child.slug})`);
      } else {
        console.log(`   ⚠️  подкатегория ${child.name} имеет ${childCount} товаров — оставлена`);
      }
    }

    // Удаляем корневую категорию
    await prisma.category.delete({ where: { id: cat.id } });
    console.log(`❌ удалена: ${cat.name} (${slug})`);
  }

  // Особый случай: "Труба профильная" — 2 категории с товарами
  // truba-profilnaya (7 товаров) → перенести в труба-профильная (53 товаров)
  const dupProfile = await prisma.category.findUnique({
    where: { slug: "truba-profilnaya" },
    include: { children: true, products: { select: { id: true } } },
  });

  if (dupProfile && dupProfile.products.length > 0) {
    const mainProfile = await prisma.category.findUnique({
      where: { slug: "труба-профильная" },
    });

    if (mainProfile) {
      console.log(`\n=== ОБЪЕДИНЕНИЕ "Труба профильная" ===`);
      // Переносим товары
      await prisma.product.updateMany({
        where: { categoryId: dupProfile.id },
        data: { categoryId: mainProfile.id },
      });
      console.log(`   Перенесено товаров: ${dupProfile.products.length}`);

      // Переносим непустые подкатегории
      for (const child of dupProfile.children) {
        const count = await prisma.product.count({ where: { categoryId: child.id } });
        if (count > 0) {
          await prisma.category.update({
            where: { id: child.id },
            data: { parentId: mainProfile.id },
          });
          console.log(`   Перенесена подкатегория: ${child.name} (${count} товаров)`);
        } else {
          await prisma.category.delete({ where: { id: child.id } });
          console.log(`   Удалена пустая подкатегория: ${child.name}`);
        }
      }

      // Удаляем дубль
      await prisma.category.delete({ where: { id: dupProfile.id } });
      console.log(`   Удалён дубль: truba-profilnaya`);
    }
  }

  // Итог
  const roots = await prisma.category.count({ where: { parentId: null } });
  const subs = await prisma.category.count({ where: { parentId: { not: null } } });
  const products = await prisma.product.count();
  console.log(`\n=== ИТОГ ===`);
  console.log(`Корневых категорий: ${roots}`);
  console.log(`Подкатегорий: ${subs}`);
  console.log(`Товаров: ${products}`);

  await prisma.$disconnect();
}

main().catch(console.error);
