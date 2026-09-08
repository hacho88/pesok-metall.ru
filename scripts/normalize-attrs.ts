import { prisma } from "../src/lib/prisma";

// Map English/seed keys → normalized Russian keys
const KEY_MAP: Record<string, string> = {
  gost: "ГОСТ",
  steel_grade: "Марка стали",
  diameter: "Диаметр",
  thickness: "Толщина",
  section: "Сечение",
  length: "Длина",
  fraction: "Фракция",
  packaging: "Фасовка",
  format: "Формат",
  cell: "Ячейка",
  wall: "Стенка",
  wire: "Проволока",
};

async function main() {
  console.log("=".repeat(70));
  console.log("  НОРМАЛИЗАЦИЯ АТРИБУТОВ");
  console.log("=".repeat(70));

  // 1. Rename English keys to Russian
  let renamed = 0;
  for (const [oldKey, newKey] of Object.entries(KEY_MAP)) {
    // Check if product already has both old and new key (would create duplicate)
    const productsWithBoth = await prisma.$queryRaw<Array<{productId: string}>>`
      SELECT DISTINCT a1."productId"
      FROM "ProductAttribute" a1
      JOIN "ProductAttribute" a2 ON a1."productId" = a2."productId"
      WHERE a1.key = ${oldKey} AND a2.key = ${newKey}
    `;
    
    if (productsWithBoth.length > 0) {
      // Delete old key where new key already exists
      for (const row of productsWithBoth) {
        await prisma.productAttribute.deleteMany({
          where: { productId: row.productId, key: oldKey },
        });
        renamed++;
      }
    }

    // Rename remaining old keys
    const result = await prisma.productAttribute.updateMany({
      where: { key: oldKey },
      data: { key: newKey },
    });
    renamed += result.count;
    if (result.count > 0) {
      console.log(`  ${oldKey} → ${newKey}: ${result.count} обновлено`);
    }
  }
  console.log(`\nПереименовано: ${renamed}`);

  // 2. Split "Размер" into proper attributes based on content
  const razmerAttrs = await prisma.productAttribute.findMany({
    where: { key: "Размер" },
    select: { id: true, value: true, productId: true },
  });
  console.log(`\n"Размер" атрибутов: ${razmerAttrs.length}`);

  let splitToDiameter = 0;
  let splitToSection = 0;
  let splitToThickness = 0;
  let keptAsRazmer = 0;

  for (const attr of razmerAttrs) {
    const val = attr.value.trim();
    
    // Check if it's a section (contains х or x between two numbers)
    if (/\d+\s*[хx]\s*\d+/.test(val)) {
      // It's a section like "40х40" or "200х6" or "40х20х2"
      // Check if product already has "Сечение"
      const existing = await prisma.productAttribute.findFirst({
        where: { productId: attr.productId, key: "Сечение" },
      });
      if (!existing) {
        await prisma.productAttribute.update({
          where: { id: attr.id },
          data: { key: "Сечение", value: val },
        });
        splitToSection++;
      } else {
        // Already has section, delete this
        await prisma.productAttribute.delete({ where: { id: attr.id } });
        splitToSection++;
      }
    } else if (/^\d+[.,]?\d*\s*мм$/i.test(val) || /^\d+[.,]?\d*$/i.test(val)) {
      // It's a single dimension like "10 мм" or "1200 мм" or "0,8 мм"
      // For sheet products this is thickness, for round products this is diameter
      const product = await prisma.product.findUnique({
        where: { id: attr.productId },
        select: { name: true },
      });
      
      if (product && /лист|пвл|просечно/i.test(product.name)) {
        // Sheet product → thickness
        const existing = await prisma.productAttribute.findFirst({
          where: { productId: attr.productId, key: "Толщина" },
        });
        if (!existing) {
          await prisma.productAttribute.update({
            where: { id: attr.id },
            data: { key: "Толщина", value: val },
          });
        } else {
          await prisma.productAttribute.delete({ where: { id: attr.id } });
        }
        splitToThickness++;
      } else {
        // Round product → diameter
        const existing = await prisma.productAttribute.findFirst({
          where: { productId: attr.productId, key: "Диаметр" },
        });
        if (!existing) {
          await prisma.productAttribute.update({
            where: { id: attr.id },
            data: { key: "Диаметр", value: val },
          });
        } else {
          await prisma.productAttribute.delete({ where: { id: attr.id } });
        }
        splitToDiameter++;
      }
    } else {
      // Keep as "Размер" if doesn't match patterns
      keptAsRazmer++;
    }
  }

  console.log(`  → Сечение: ${splitToSection}`);
  console.log(`  → Диаметр: ${splitToDiameter}`);
  console.log(`  → Толщина: ${splitToThickness}`);
  console.log(`  осталось "Размер": ${keptAsRazmer}`);

  // 3. Clean up "Вес" values — normalize format
  const vesAttrs = await prisma.productAttribute.findMany({
    where: { key: "Вес" },
    select: { id: true, value: true },
  });
  let weightFixed = 0;
  for (const attr of vesAttrs) {
    // Remove trailing dot: "0.888 кг." → "0.888 кг"
    const cleaned = attr.value.replace(/\.\s*$/, "").trim();
    if (cleaned !== attr.value) {
      await prisma.productAttribute.update({
        where: { id: attr.id },
        data: { value: cleaned },
      });
      weightFixed++;
    }
  }
  console.log(`\n"Вес" нормализовано: ${weightFixed}`);

  // 4. Clean up "Длина" values
  const dlinaAttrs = await prisma.productAttribute.findMany({
    where: { key: "Длина" },
    select: { id: true, value: true },
  });
  let lengthFixed = 0;
  for (const attr of dlinaAttrs) {
    const cleaned = attr.value.replace(/\.\s*$/, "").trim();
    if (cleaned !== attr.value) {
      await prisma.productAttribute.update({
        where: { id: attr.id },
        data: { value: cleaned },
      });
      lengthFixed++;
    }
  }
  console.log(`"Длина" нормализовано: ${lengthFixed}`);

  // 5. Final attribute audit
  const finalAttrs = await prisma.productAttribute.groupBy({
    by: ["key"],
    _count: true,
    orderBy: { _count: { key: "desc" } },
  });
  console.log(`\n=== ИТОГОВЫЕ КЛЮЧИ АТРИБУТОВ ===`);
  finalAttrs.forEach(a => console.log(`  "${a.key}": ${a._count}`));

  // 6. Check for duplicate keys per product
  const products = await prisma.product.findMany({
    select: { id: true, name: true, attributes: { select: { key: true } } },
  });
  let dupCount = 0;
  for (const p of products) {
    const keys = p.attributes.map(a => a.key);
    const dups = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dups.length > 0) {
      dupCount++;
      if (dupCount <= 5) console.log(`  DUP: ${p.name} — ${dups.join(", ")}`);
    }
  }
  console.log(`\nТоваров с дубликатами ключей: ${dupCount}`);

  // 7. Products with no attributes
  const noAttr = await prisma.product.count({
    where: { attributes: { none: {} } },
  });
  console.log(`Товаров без атрибутов: ${noAttr}`);

  await prisma.$disconnect();
  console.log("\n=".repeat(70));
  console.log("  НОРМАЛИЗАЦИЯ ЗАВЕРШЕНА");
  console.log("=".repeat(70));
}

main().catch(console.error);
