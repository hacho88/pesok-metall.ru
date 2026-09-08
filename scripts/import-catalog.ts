/**
 * Импорт каталога из catalog-export/catalog.json в БД.
 * Использование: npx tsx scripts/import-catalog.ts
 *
 * Что делает:
 *  1. Создаёт/обновляет CatalogSection (Металлопрокат, Песок и щебень)
 *  2. Создаёт/обновляет категории и подкатегории (с imageUrl)
 *  3. Создаёт/обновляет товары с атрибутами
 *  4. Копирует фото из catalog-export/photos/ в /public/products/
 */
import { readFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } from "fs";
import { join, basename } from "path";
import { prisma } from "../src/lib/prisma";

interface ExportProduct {
  id: string;
  name: string;
  slug: string;
  type: string;
  category: string;
  subcategory: string;
  section: string;
  price: number | null;
  unit: string | null;
  isOnOrder: boolean;
  weightKg: string;
  stock: number;
  sourceUrl?: string;
  imageLocal: string | null;
  imageFile: string | null;
  groupName: string | null;
  groupId: string | null;
  attributes: Record<string, string>;
  classifiedCategory: string;
  classifiedSubcategory: string;
}

interface ExportCategory {
  slug: string;
  name: string;
  route: string;
  section: string;
  imageUrl: string | null;
  subcategories: {
    slug: string;
    name: string;
    imageUrl: string | null;
    productCount: number;
  }[];
  productCount: number;
}

interface CatalogExport {
  exportDate: string;
  totalProducts: number;
  totalCategories: number;
  categories: ExportCategory[];
  products: ExportProduct[];
}

const EXPORT_PATH = join(process.cwd(), "catalog-export", "catalog.json");
const PHOTOS_DIR = join(process.cwd(), "catalog-export", "photos");
const PUBLIC_PRODUCTS = join(process.cwd(), "public", "products");

async function main() {
  console.log("📦 Импорт каталога из catalog-export/catalog.json\n");

  if (!existsSync(EXPORT_PATH)) {
    console.error("❌ Файл catalog-export/catalog.json не найден!");
    process.exit(1);
  }

  const data: CatalogExport = JSON.parse(readFileSync(EXPORT_PATH, "utf-8"));
  console.log(`   Категорий: ${data.categories.length}`);
  console.log(`   Товаров: ${data.products.length}\n`);

  // 1. Копируем фото
  console.log("📷 Копирование фото...");
  if (!existsSync(PUBLIC_PRODUCTS)) mkdirSync(PUBLIC_PRODUCTS, { recursive: true });
  let photoCount = 0;
  if (existsSync(PHOTOS_DIR)) {
    const files = readdirSync(PHOTOS_DIR);
    for (const file of files) {
      const src = join(PHOTOS_DIR, file);
      const dst = join(PUBLIC_PRODUCTS, file);
      try {
        copyFileSync(src, dst);
        photoCount++;
      } catch (e) {
        // ignore
      }
    }
  }
  console.log(`   Скопировано ${photoCount} фото в /public/products/\n`);

  // 2. Создаём/обновляем секции
  console.log("📁 Создание секций...");
  const sectionMap = new Map<string, string>();
  const sections = [...new Set(data.categories.map((c) => c.section))];
  for (const sectionSlug of sections) {
    const sectionName = sectionSlug === "metalloprokat" ? "Металлопрокат" : "Песок и щебень";
    const section = await prisma.catalogSection.upsert({
      where: { slug: sectionSlug },
      update: { name: sectionName },
      create: { slug: sectionSlug, name: sectionName, sortOrder: sectionSlug === "metalloprokat" ? 0 : 1 },
    });
    sectionMap.set(sectionSlug, section.id);
    console.log(`   ✅ ${section.name} (${section.slug})`);
  }
  console.log();

  // 3. Создаём/обновляем категории и подкатегории
  console.log("📂 Создание категорий...");
  const catMap = new Map<string, string>(); // slug -> id
  for (const cat of data.categories) {
    const sectionId = sectionMap.get(cat.section) ?? null;
    const dbCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, imageUrl: cat.imageUrl, sectionId, parentId: null },
      create: { slug: cat.slug, name: cat.name, imageUrl: cat.imageUrl, sectionId, sortOrder: 0 },
    });
    catMap.set(cat.slug, dbCat.id);

    // Подкатегории
    for (const sub of cat.subcategories) {
      const dbSub = await prisma.category.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, imageUrl: sub.imageUrl, parentId: dbCat.id, sectionId },
        create: { slug: sub.slug, name: sub.name, imageUrl: sub.imageUrl, parentId: dbCat.id, sectionId, sortOrder: 0 },
      });
      catMap.set(sub.slug, dbSub.id);
    }
  }
  console.log(`   ✅ ${catMap.size} категорий и подкатегорий\n`);

  // 4. Создаём/обновляем товары
  console.log("📦 Импорт товаров...");
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const p of data.products) {
    try {
      // Определяем категорию (подкатегорию)
      const catSlug = p.classifiedSubcategory || p.classifiedCategory;
      const categoryId = catMap.get(catSlug);
      if (!categoryId) {
        console.warn(`   ⚠️ Категория не найдена: ${catSlug} для товара ${p.name}`);
        errors++;
        continue;
      }

      // Маппинг типа
      const type = (["METALL", "BAG_30KG", "BIG_BAG_1TON", "GENERAL_CONSTRUCTION"].includes(p.type)
        ? p.type
        : "METALL") as any;

      // Удаляем старые атрибуты если товар существует
      const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
      if (existing) {
        await prisma.productAttribute.deleteMany({ where: { productId: existing.id } });
      }

      const dbProduct = await prisma.product.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          categoryId,
          type,
          priceRetailBase: p.price ?? null,
          isOnOrder: p.isOnOrder,
          weightKg: p.weightKg,
          stock: p.stock,
          sourceUrl: p.sourceUrl ?? null,
          imageLocal: p.imageLocal,
          imageUrl: null,
          unit: p.unit,
          groupId: p.groupId,
          groupName: p.groupName,
        },
        create: {
          id: p.id,
          name: p.name,
          slug: p.slug,
          categoryId,
          type,
          priceRetailBase: p.price ?? null,
          isOnOrder: p.isOnOrder,
          weightKg: p.weightKg,
          stock: p.stock,
          sourceUrl: p.sourceUrl ?? null,
          imageLocal: p.imageLocal,
          unit: p.unit,
          groupId: p.groupId,
          groupName: p.groupName,
        },
      });

      // Создаём атрибуты
      const attrEntries = Object.entries(p.attributes);
      if (attrEntries.length > 0) {
        await prisma.productAttribute.createMany({
          data: attrEntries.map(([key, value]) => ({
            productId: dbProduct.id,
            key,
            value,
          })),
        });
      }

      if (existing) updated++;
      else created++;
    } catch (e: any) {
      console.error(`   ❌ ${p.name}: ${e.message}`);
      errors++;
    }
  }

  console.log(`   ✅ Создано: ${created}`);
  console.log(`   ✅ Обновлено: ${updated}`);
  if (errors > 0) console.log(`   ⚠️ Ошибок: ${errors}`);
  console.log();

  // 5. Итоги
  const totalCats = await prisma.category.count();
  const totalProducts = await prisma.product.count();
  const totalAttrs = await prisma.productAttribute.count();

  console.log("📊 Итоги в БД:");
  console.log(`   Категорий: ${totalCats}`);
  console.log(`   Товаров: ${totalProducts}`);
  console.log(`   Атрибутов: ${totalAttrs}`);
  console.log(`\n✅ Импорт завершён!`);
}

main()
  .catch((e) => {
    console.error("❌ Критическая ошибка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
