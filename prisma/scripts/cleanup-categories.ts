// Чистка категорий: удаляет сид-дубли металла (латинские slug),
// тестовую категорию и пустые категории-сироты
import { prisma } from "../../src/lib/prisma";

async function deleteCategoryTree(cat: { id: string; slug: string }) {
  const count = await prisma.product.count({ where: { categoryId: cat.id } });
  // Сначала связанные записи (FK без каскада)
  await prisma.competitorPrice.deleteMany({ where: { product: { categoryId: cat.id } } });
  await prisma.adCampaign.deleteMany({ where: { product: { categoryId: cat.id } } });
  await prisma.geoProductData.deleteMany({ where: { product: { categoryId: cat.id } } });
  await prisma.productAttribute.deleteMany({ where: { product: { categoryId: cat.id } } });
  await prisma.product.deleteMany({ where: { categoryId: cat.id } });
  await prisma.category.delete({ where: { id: cat.id } });
  console.log(`Удалена категория ${cat.slug} (${count} товаров)`);
}

async function main() {
  // 1. Тестовая категория от моего теста апсерта
  const testCat = await prisma.category.findUnique({ where: { slug: "труба-профильная-тест" } });
  if (testCat) await deleteCategoryTree(testCat);

  // 2. Сид-категории металла — дубли парсерных (латинские slug)
  const seedSlugs = ["armatura", "truby", "listy", "setka", "import"];
  for (const slug of seedSlugs) {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (cat) await deleteCategoryTree(cat);
  }

  // 3. Пустые категории без товаров и без детей (сироты от неудачных парсингов)
  const empty = await prisma.category.findMany({
    where: {
      products: { none: {} },
      children: { none: {} },
    },
  });
  for (const cat of empty) {
    await prisma.category.delete({ where: { id: cat.id } });
    console.log(`Удалена пустая категория ${cat.slug} (${cat.name})`);
  }

  const [products, categories] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
  ]);
  console.log(`\nИтог: товаров ${products}, категорий ${categories}`);
}

main()
  .catch((e) => {
    console.error("Ошибка:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
