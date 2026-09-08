import { prisma } from "../src/lib/prisma";
import { writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { CATALOG_DICTIONARY, classifyProduct, extractMetric } from "../prisma/scripts/catalog-dictionary";

const EXPORT_DIR = path.join(process.cwd(), "catalog-export");
const PHOTOS_DIR = path.join(EXPORT_DIR, "photos");

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
  weightKg: string | null;
  stock: number;
  sourceUrl: string | null;
  imageLocal: string | null;
  imageFile: string | null;
  groupName: string | null;
  groupId: string | null;
  attributes: Record<string, string>;
  // Derived/classified fields
  classifiedCategory: string | null;
  classifiedSubcategory: string | null;
  metric: string | null;
  diameter: string | null;
  thickness: string | null;
  sectionSize: string | null;
  gost: string | null;
  steelGrade: string | null;
  length: string | null;
  weight: string | null;
  fraction: string | null;
  packaging: string | null;
  format: string | null;
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

async function main() {
  console.log("=".repeat(70));
  console.log("  FULL CATALOG EXPORT");
  console.log("=".repeat(70));

  await mkdir(EXPORT_DIR, { recursive: true });
  await mkdir(PHOTOS_DIR, { recursive: true });

  // ─── 1. Load all products with attributes and categories ──────────
  const products = await prisma.product.findMany({
    include: {
      category: {
        include: { section: true, parent: { include: { section: true } } },
      },
      attributes: true,
    },
    orderBy: { name: "asc" },
  });
  console.log(`Products: ${products.length}`);

  // ─── 2. Load category tree ────────────────────────────────────────
  const rootCategories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      section: true,
      children: {
        include: { _count: { select: { products: true } } },
      },
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  // ─── 3. Build category structure from dictionary ──────────────────
  const categoriesExport: ExportCategory[] = CATALOG_DICTIONARY.map((catDef) => {
    const dbCat = rootCategories.find((c) => c.slug === catDef.slug);
    const subcats = catDef.subcategories.map((sub) => {
      const dbSub = dbCat?.children.find((c) => c.slug === sub.slug);
      return {
        slug: sub.slug,
        name: sub.name,
        imageUrl: dbSub?.imageUrl ?? null,
        productCount: dbSub?._count.products ?? 0,
      };
    });
    return {
      slug: catDef.slug,
      name: catDef.name,
      route: catDef.route,
      section: catDef.sectionSlug,
      imageUrl: dbCat?.imageUrl ?? null,
      subcategories: subcats,
      productCount: dbCat?._count.products ?? 0,
    };
  });

  // ─── 4. Process each product ──────────────────────────────────────
  const productsExport: ExportProduct[] = [];
  let photosCopied = 0;
  let photosMissing = 0;

  for (const p of products) {
    // Classify product using dictionary
    const classified = classifyProduct(p.name);
    const metric = classified ? extractMetric(p.name, classified.categorySlug) : null;

    // Build attributes map (keys already normalized in DB)
    const attrMap: Record<string, string> = {};
    for (const a of p.attributes) {
      attrMap[a.key] = a.value;
    }

    // Extract specific attributes
    const gost = attrMap["ГОСТ"] || null;
    const length = attrMap["Длина"] || null;
    const weight = attrMap["Вес"] || null;
    const diameterAttr = attrMap["Диаметр"] || null;
    const thicknessAttr = attrMap["Толщина"] || null;
    const sectionAttr = attrMap["Сечение"] || null;
    const cellAttr = attrMap["Ячейка"] || null;
    const fractionAttr = attrMap["Фракция"] || null;
    const packagingAttr = attrMap["Фасовка"] || null;
    const formatAttr = attrMap["Формат"] || null;

    // Extract steel grade from attributes or name
    let steelGrade = attrMap["Марка стали"] || null;
    if (!steelGrade) {
      // Try to extract from name: А500С, А500Т, А1, А3, Ст3сп, 35ГС, 25Г2С, 09Г2С
      const gradeMatch = p.name.match(/\b(А[0-9]+[СТ]?|Ст\d+[а-я]+|\d+Г\d+[СЦ]?|09Г2С)\b/i);
      if (gradeMatch) steelGrade = gradeMatch[1];
      if (!steelGrade) {
        const aMatch = p.name.match(/(А[0-9]+[СТ]?)(?:\s|$)/);
        if (aMatch) steelGrade = aMatch[1];
      }
    }

    // Extract diameter/thickness/section from attributes, metric, or name
    const isBulk = classified?.categorySlug === "pesok-shcheben";
    let diameter: string | null = isBulk ? null : diameterAttr;
    let thickness: string | null = thicknessAttr;
    let sectionSize: string | null = sectionAttr || cellAttr;

    // 2. Try metric from dictionary (skip for bulk materials)
    if (!isBulk && !diameter && !sectionSize && metric) {
      if (metric.includes("х")) {
        sectionSize = metric;
      } else {
        diameter = metric;
      }
    }

    // Fallback: try to extract from name if still missing (skip for bulk materials)
    if (!isBulk) {
      if (!diameter && !sectionSize && !thickness) {
        const nameMatch = p.name.match(/(\d+(?:[.,]\d+)?)\s*мм/i);
        if (nameMatch) diameter = `${nameMatch[1]} мм`;
      }

      // Extract section from name (e.g., "40х20" or "40х20х2" or "d= 133х4")
      if (!sectionSize) {
        const sectionMatch = p.name.match(/(?:d=\s*)?(\d+)\s*[хx]\s*(\d+)(?:\s*[хx]\s*(\d+))?/i);
        if (sectionMatch) {
          sectionSize = sectionMatch[3]
            ? `${sectionMatch[1]}х${sectionMatch[2]}х${sectionMatch[3]}`
            : `${sectionMatch[1]}х${sectionMatch[2]}`;
        }
      }
    }

    // For sheet products: thickness is first dimension (e.g., "3х1250х2500")
    if (!thickness && classified?.categorySlug === "listovoj-prokat") {
      const sheetMatch = p.name.match(/(\d+[.,]?\d*)\s*х\s*\d+\s*х\s*\d+/i);
      if (sheetMatch) thickness = `${sheetMatch[1]} мм`;
    }

    // Extract GOST from name if not in attributes
    let finalGost = gost;
    if (!finalGost) {
      const gostMatch = p.name.match(/ГОСТ\s*[\d-]+/i);
      if (gostMatch) finalGost = gostMatch[0];
    }

    // Determine weight: prefer attribute, then weightKg field
    const finalWeight = weight || (p.weightKg && Number(p.weightKg) > 1 ? `${p.weightKg} кг` : null);

    // Copy photo
    let imageFile: string | null = null;
    if (p.imageLocal) {
      const srcPath = path.join(process.cwd(), "public", p.imageLocal);
      const fileName = path.basename(p.imageLocal);
      const destPath = path.join(PHOTOS_DIR, fileName);
      try {
        await copyFile(srcPath, destPath);
        imageFile = `photos/${fileName}`;
        photosCopied++;
      } catch {
        photosMissing++;
      }
    }

    // Determine category/subcategory
    const categoryName = p.category?.name ?? "Без категории";
    const parentCategory = p.category?.parent;
    const subcategoryName = parentCategory ? categoryName : "";
    const rootCategoryName = parentCategory?.name ?? categoryName;
    const sectionName = p.category?.section?.name ?? p.category?.parent?.section?.name ?? "Металлопрокат";

    productsExport.push({
      id: p.id,
      name: p.name,
      slug: p.slug,
      type: p.type,
      category: rootCategoryName,
      subcategory: subcategoryName,
      section: sectionName,
      price: p.priceRetailBase ? Number(p.priceRetailBase) : null,
      unit: p.unit,
      isOnOrder: p.isOnOrder,
      weightKg: p.weightKg ? String(p.weightKg) : null,
      stock: p.stock,
      sourceUrl: p.sourceUrl,
      imageLocal: p.imageLocal,
      imageFile,
      groupName: p.groupName,
      groupId: p.groupId,
      attributes: attrMap,
      classifiedCategory: classified?.categorySlug ?? null,
      classifiedSubcategory: classified?.subcategorySlug ?? null,
      metric,
      diameter,
      thickness,
      sectionSize,
      gost: finalGost,
      steelGrade,
      length,
      weight: finalWeight,
      fraction: fractionAttr,
      packaging: packagingAttr,
      format: formatAttr,
    });
  }

  // ─── 5. Write files ───────────────────────────────────────────────
  
  // Full catalog JSON
  await writeFile(
    path.join(EXPORT_DIR, "catalog.json"),
    JSON.stringify({
      exportDate: new Date().toISOString(),
      totalProducts: productsExport.length,
      totalCategories: categoriesExport.length,
      categories: categoriesExport,
      products: productsExport,
    }, null, 2),
    "utf-8"
  );

  // Categories only
  await writeFile(
    path.join(EXPORT_DIR, "categories.json"),
    JSON.stringify(categoriesExport, null, 2),
    "utf-8"
  );

  // Products only (without large fields)
  const productsLite = productsExport.map(p => ({
    name: p.name,
    slug: p.slug,
    type: p.type,
    category: p.category,
    subcategory: p.subcategory,
    section: p.section,
    price: p.price,
    unit: p.unit,
    isOnOrder: p.isOnOrder,
    imageFile: p.imageFile,
    diameter: p.diameter,
    thickness: p.thickness,
    sectionSize: p.sectionSize,
    gost: p.gost,
    steelGrade: p.steelGrade,
    length: p.length,
    weight: p.weight,
    weightKg: p.weightKg,
    fraction: p.fraction,
    packaging: p.packaging,
    format: p.format,
    classifiedCategory: p.classifiedCategory,
    classifiedSubcategory: p.classifiedSubcategory,
    metric: p.metric,
  }));
  await writeFile(
    path.join(EXPORT_DIR, "products.json"),
    JSON.stringify(productsLite, null, 2),
    "utf-8"
  );

  // Combined CSV: categories + products in one file
  const catCsvHeader = "=== КАТЕГОРИИ ===\nКатегория;Slug;Секция;Фото;Товаров;Подкатегория;SubSlug;SubФото;SubТоваров\n";
  const catCsvRows: string[] = [];
  for (const cat of categoriesExport) {
    if (cat.subcategories.length === 0) {
      catCsvRows.push([cat.name, cat.slug, cat.section, cat.imageUrl ?? "", cat.productCount, "", "", "", ""].join(";"));
    } else {
      for (const sub of cat.subcategories) {
        catCsvRows.push([cat.name, cat.slug, cat.section, cat.imageUrl ?? "", cat.productCount, sub.name, sub.slug, sub.imageUrl ?? "", sub.productCount].join(";"));
      }
    }
  }

  const prodCsvHeader = "\n\n=== ТОВАРЫ ===\nНазвание;Slug;Тип;Категория;Подкатегория;Секция;Цена;Ед;Под заказ;Вес(кг);Диаметр;Толщина;Сечение;ГОСТ;Марка;Длина;Вес;Фракция;Фасовка;Формат;Фото;ClassifiedCategory;ClassifiedSubcategory;Metric\n";
  const prodCsvRows = productsExport.map(p => [
    p.name,
    p.slug,
    p.type,
    p.category,
    p.subcategory,
    p.section,
    p.price ?? "",
    p.unit ?? "",
    p.isOnOrder ? "да" : "нет",
    p.weightKg ?? "",
    p.diameter ?? "",
    p.thickness ?? "",
    p.sectionSize ?? "",
    p.gost ?? "",
    p.steelGrade ?? "",
    p.length ?? "",
    p.weight ?? "",
    p.fraction ?? "",
    p.packaging ?? "",
    p.format ?? "",
    p.imageFile ?? "",
    p.classifiedCategory ?? "",
    p.classifiedSubcategory ?? "",
    p.metric ?? "",
  ].join(";")).join("\n");

  await writeFile(
    path.join(EXPORT_DIR, "catalog.csv"),
    "\uFEFF" + catCsvHeader + catCsvRows.join("\n") + prodCsvHeader + prodCsvRows,
    "utf-8"
  );

  // Statistics
  const stats = {
    totalProducts: productsExport.length,
    withPrice: productsExport.filter(p => p.price !== null).length,
    withImage: productsExport.filter(p => p.imageFile !== null).length,
    onOrder: productsExport.filter(p => p.isOnOrder).length,
    withGost: productsExport.filter(p => p.gost !== null).length,
    withSteelGrade: productsExport.filter(p => p.steelGrade !== null).length,
    withDiameter: productsExport.filter(p => p.diameter !== null).length,
    withSection: productsExport.filter(p => p.sectionSize !== null).length,
    withThickness: productsExport.filter(p => p.thickness !== null).length,
    withLength: productsExport.filter(p => p.length !== null).length,
    withWeight: productsExport.filter(p => p.weight !== null).length,
    classified: productsExport.filter(p => p.classifiedCategory !== null).length,
    notClassified: productsExport.filter(p => p.classifiedCategory === null).length,
    byType: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    bySection: {} as Record<string, number>,
    photosCopied,
    photosMissing,
  };

  for (const p of productsExport) {
    stats.byType[p.type] = (stats.byType[p.type] ?? 0) + 1;
    stats.byCategory[p.category] = (stats.byCategory[p.category] ?? 0) + 1;
    stats.bySection[p.section] = (stats.bySection[p.section] ?? 0) + 1;
  }

  await writeFile(
    path.join(EXPORT_DIR, "stats.json"),
    JSON.stringify(stats, null, 2),
    "utf-8"
  );

  // README
  const readme = `# Каталог pesok-metall.ru

Дата экспорта: ${new Date().toISOString()}

## Структура

\`\`\`
catalog-export/
├── catalog.json       — полный экспорт (категории + товары + атрибуты)
├── categories.json    — только категории и подкатегории
├── products.json      — только товары (облегчённая версия)
├── products.csv       — CSV для Excel (BOM UTF-8, разделитель ;)
├── stats.json         — статистика экспорта
├── photos/            — все фотографии товаров
└── README.md          — этот файл
\`\`\`

## Статистика

- Всего товаров: ${stats.totalProducts}
- С ценой: ${stats.withPrice}
- С фото: ${stats.withImage}
- Под заказ: ${stats.onOrder}
- С ГОСТ: ${stats.withGost}
- С маркой стали: ${stats.withSteelGrade}
- С диаметром: ${stats.withDiameter}
- С сечением: ${stats.withSection}
- С толщиной: ${stats.withThickness}
- С длиной: ${stats.withLength}
- С весом: ${stats.withWeight}
- Классифицировано: ${stats.classified}
- Не классифицировано: ${stats.notClassified}
- Фото скопировано: ${stats.photosCopied}
- Фото отсутствует: ${stats.photosMissing}

## Категории

${categoriesExport.map(c => `- **${c.name}** (${c.slug}): ${c.productCount} товаров\n${c.subcategories.map(s => `  - ${s.name} (${s.slug}): ${s.productCount}`).join("\n")}`).join("\n\n")}
`;
  await writeFile(
    path.join(EXPORT_DIR, "README.md"),
    readme,
    "utf-8"
  );

  // Print stats
  console.log("\n" + "=".repeat(70));
  console.log("  СТАТИСТИКА ЭКСПОРТА");
  console.log("=".repeat(70));
  console.log(`  Всего товаров:     ${stats.totalProducts}`);
  console.log(`  С ценой:           ${stats.withPrice}`);
  console.log(`  С фото:            ${stats.withImage}`);
  console.log(`  Под заказ:         ${stats.onOrder}`);
  console.log(`  С ГОСТ:            ${stats.withGost}`);
  console.log(`  С маркой стали:    ${stats.withSteelGrade}`);
  console.log(`  С диаметром:       ${stats.withDiameter}`);
  console.log(`  С сечением:        ${stats.withSection}`);
  console.log(`  С толщиной:        ${stats.withThickness}`);
  console.log(`  С длиной:          ${stats.withLength}`);
  console.log(`  С весом:           ${stats.withWeight}`);
  console.log(`  Классифицировано:  ${stats.classified}`);
  console.log(`  Не классифицир.:   ${stats.notClassified}`);
  console.log(`  Фото скопировано:  ${stats.photosCopied}`);
  console.log(`  Фото отсутствует:  ${stats.photosMissing}`);
  console.log("\n  По типам:");
  for (const [type, count] of Object.entries(stats.byType).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${type}: ${count}`);
  }
  console.log("\n  По категориям:");
  for (const [cat, count] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cat}: ${count}`);
  }
  console.log("\n  Папка экспорта: " + EXPORT_DIR);
  console.log("=".repeat(70));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Ошибка экспорта:", e);
  process.exit(1);
});
