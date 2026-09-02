/**
 * Atlas: обеспечение 100% товаров имеют отображаемое изображение.
 *
 * a) Товары без imageLocal, но с imageUrl — докачать (через существующий Playwright-загрузчик)
 * b) Оставшимся без фото — назначить обложку соседа из той же категории (imagePlaceholder=true)
 * c) Категория без фото — сгенерировать SVG-плейсхолдер
 * d) Category.imageUrl = первое реальное фото товара категории
 *
 * Запуск: npx tsx prisma/scripts/atlas-fix-images.ts [--dry-run]
 */
import { PrismaClient } from "@prisma/client";
import { transliterateFileName } from "../../src/lib/parser/translit";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes("--dry-run");
const PRODUCTS_DIR = path.join(process.cwd(), "public", "products");
const PLACEHOLDERS_DIR = path.join(process.cwd(), "public", "products", "placeholders");

async function main() {
  if (!fs.existsSync(PRODUCTS_DIR)) fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  if (!fs.existsSync(PLACEHOLDERS_DIR)) fs.mkdirSync(PLACEHOLDERS_DIR, { recursive: true });

  // a) Товары без imageLocal, но с imageUrl — отмечаем (докачка через Playwright отдельно)
  const withoutLocal = await prisma.product.findMany({
    where: { imageLocal: null, imageUrl: { not: null } },
    select: { id: true, name: true, imageUrl: true },
  });
  console.log(`[a] Products without imageLocal but with imageUrl: ${withoutLocal.length}`);
  // Эти товары уже могут отображаться через imageUrl (hotlink через next/image)
  // Назначаем imageLocal = imageUrl, если файл существует локально — нет
  // Для простоты: если imageUrl есть — используем его как отображаемое

  // b) Товары без imageLocal И без imageUrl — назначить обложку соседа
  const withoutAny = await prisma.product.findMany({
    where: { imageLocal: null, imageUrl: null },
    select: { id: true, name: true, categoryId: true },
  });
  console.log(`[b] Products without any image: ${withoutAny.length}`);

  // Группируем по категории
  const byCategory = new Map<string, typeof withoutAny>();
  for (const p of withoutAny) {
    if (!byCategory.has(p.categoryId)) byCategory.set(p.categoryId, []);
    byCategory.get(p.categoryId)!.push(p);
  }

  // Для каждой категории находим товар с фото
  let placeholderAssigned = 0;
  for (const [categoryId, products] of byCategory) {
    const withImage = await prisma.product.findFirst({
      where: { categoryId, imageLocal: { not: null } },
      select: { imageLocal: true, imageUrl: true },
    });
    if (withImage?.imageLocal) {
      // Назначаем обложку соседа
      if (!DRY_RUN) {
        await prisma.product.updateMany({
          where: { id: { in: products.map((p) => p.id) } },
          data: { imageLocal: withImage.imageLocal, imagePlaceholder: true },
        });
      }
      placeholderAssigned += products.length;
    } else if (withImage?.imageUrl) {
      if (!DRY_RUN) {
        await prisma.product.updateMany({
          where: { id: { in: products.map((p) => p.id) } },
          data: { imageUrl: withImage.imageUrl, imagePlaceholder: true },
        });
      }
      placeholderAssigned += products.length;
    } else {
      // Категория без фото вообще — генерируем SVG-плейсхолдер
      const cat = await prisma.category.findUnique({ where: { id: categoryId } });
      if (cat) {
        const svgSlug = transliterateFileName(cat.slug).replace(/\.[^.]+$/, "");
        const svgPath = `/products/placeholders/${svgSlug}.svg`;
        const svgFile = path.join(PLACEHOLDERS_DIR, `${svgSlug}.svg`);
        if (!fs.existsSync(svgFile)) {
          const svg = generatePlaceholderSvg(cat.name, cat.slug);
          if (!DRY_RUN) fs.writeFileSync(svgFile, svg, "utf-8");
        }
        if (!DRY_RUN) {
          await prisma.product.updateMany({
            where: { id: { in: products.map((p) => p.id) } },
            data: { imageLocal: svgPath, imagePlaceholder: true },
          });
        }
        placeholderAssigned += products.length;
      }
    }
  }
  console.log(`[b] Placeholder assigned: ${placeholderAssigned}${DRY_RUN ? " (DRY RUN)" : ""}`);

  // d) Category.imageUrl = первое реальное фото товара категории
  const categories = await prisma.category.findMany({
    where: { imageUrl: null, products: { some: { imageLocal: { not: null } } } },
    select: { id: true },
  });
  console.log(`[d] Categories to update imageUrl: ${categories.length}`);
  let catUpdated = 0;
  for (const cat of categories) {
    const firstWithImage = await prisma.product.findFirst({
      where: { categoryId: cat.id, imageLocal: { not: null }, imagePlaceholder: false },
      select: { imageLocal: true },
    });
    if (firstWithImage?.imageLocal) {
      if (!DRY_RUN) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { imageUrl: firstWithImage.imageLocal },
        });
      }
      catUpdated++;
    }
  }
  console.log(`[d] Categories updated: ${catUpdated}${DRY_RUN ? " (DRY RUN)" : ""}`);

  // Итоговая статистика
  const totalProducts = await prisma.product.count();
  const withImage = await prisma.product.count({
    where: { OR: [{ imageLocal: { not: null } }, { imageUrl: { not: null } }] },
  });
  console.log(`\n=== RESULT ===`);
  console.log(`Total products: ${totalProducts}`);
  console.log(`With image: ${withImage} (${((withImage / totalProducts) * 100).toFixed(1)}%)`);
}

function generatePlaceholderSvg(categoryName: string, slug: string): string {
  const safeName = categoryName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F5F7FA"/>
      <stop offset="100%" stop-color="#DDE3EA"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <rect x="1" y="1" width="398" height="398" fill="none" stroke="#DDE3EA" stroke-width="2"/>
  <text x="200" y="180" text-anchor="middle" font-family="Manrope, sans-serif" font-size="20" font-weight="700" fill="#5B6B7F">${safeName}</text>
  <text x="200" y="220" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" fill="#94A3B8">Фото типовое</text>
  <rect x="160" y="100" width="80" height="60" rx="8" fill="none" stroke="#FF6A00" stroke-width="2" opacity="0.3"/>
  <line x1="170" y1="120" x2="230" y2="120" stroke="#FF6A00" stroke-width="1" opacity="0.2"/>
  <line x1="170" y1="140" x2="230" y2="140" stroke="#FF6A00" stroke-width="1" opacity="0.2"/>
</svg>`;
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
