/**
 * Atlas: нормализация slug товаров в латиницу (транслит).
 * Идемпотентен: повторный запуск не меняет уже латинские slug.
 * При коллизии — суффикс -2, -3, ...
 *
 * Запуск: npx tsx prisma/scripts/atlas-normalize-slugs.ts [--dry-run]
 */
import { PrismaClient } from "@prisma/client";
import { transliterate } from "../../src/lib/parser/translit";

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes("--dry-run");

function makeLatinSlug(name: string): string {
  let s = transliterate(name);
  // Заменяем всё кроме a-z0-9 на дефис
  s = s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!s) s = "product";
  return s;
}

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, name: true, slug: true } });
  console.log(`Total products: ${products.length}`);

  let updated = 0;
  let skipped = 0;
  const usedSlugs = new Set<string>();
  // Предварительно собираем все существующие slug
  for (const p of products) usedSlugs.add(p.slug);

  for (const p of products) {
    // Если slug уже латинский — пропускаем
    if (/^[a-z0-9-]+$/.test(p.slug)) {
      skipped++;
      continue;
    }

    let newSlug = makeLatinSlug(p.name);
    // Убираем старый slug из занятых
    usedSlugs.delete(p.slug);
    // Разрешаем коллизии
    if (usedSlugs.has(newSlug)) {
      let i = 2;
      while (usedSlugs.has(`${newSlug}-${i}`)) i++;
      newSlug = `${newSlug}-${i}`;
    }
    usedSlugs.add(newSlug);

    if (!DRY_RUN) {
      await prisma.product.update({ where: { id: p.id }, data: { slug: newSlug } });
    }
    updated++;
    if (updated % 100 === 0) console.log(`  updated ${updated}...`);
  }

  console.log(`Done. Updated: ${updated}, Skipped (already latin): ${skipped}${DRY_RUN ? " (DRY RUN)" : ""}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
