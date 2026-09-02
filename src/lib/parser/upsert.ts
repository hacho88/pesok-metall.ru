import { prisma } from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import type { ExtractedProduct } from "./extract";

// Определяет тип товара по названию/атрибутам
function detectProductType(product: ExtractedProduct): ProductType {
  const text = `${product.name} ${product.attributes.map((a) => a.value).join(" ")}`.toLowerCase();
  if (/мешок|30 кг|30кг/.test(text)) return ProductType.BAG_30KG;
  if (/биг-бег|бигбег|мкр|1 т|1т|1000 кг/.test(text)) return ProductType.BIG_BAG_1TON;
  return ProductType.METALL;
}

// Создаёт категорию с иерархией: родительская (например "Арматура") + дочерняя
async function upsertCategory(
  name: string,
  parentName?: string
): Promise<{ id: string }> {
  const slug = slugify(name) || "import";
  let parentId: string | undefined;
  if (parentName) {
    const parent = await prisma.category.upsert({
      where: { slug: slugify(parentName) },
      update: { name: parentName },
      create: { slug: slugify(parentName), name: parentName },
    });
    parentId = parent.id;
  }
  return prisma.category.upsert({
    where: { slug },
    update: { name, parentId },
    create: { slug, name, parentId },
  });
}

// Вес единицы из атрибута "Вес" (например "0.222 кг.") — для калькулятора и логистики
function extractWeightKg(product: ExtractedProduct): number {
  const weightAttr = product.attributes.find((a) => /вес/i.test(a.key));
  if (!weightAttr) return 1;
  const match = weightAttr.value.replace(/\s/g, "").match(/([\d.,]+)\s*кг/i);
  if (!match) return 1;
  const value = Number.parseFloat(match[1].replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : 1;
}

// Генерирует уникальный slug: если занят, добавляет суффикс -2, -3, ...
async function uniqueSlug(base: string): Promise<string> {
  const existing = await prisma.product.findUnique({ where: { slug: base } });
  if (!existing) return base;
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`;
    const taken = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!taken) return candidate;
  }
  return `${base}-${Date.now()}`;
}

// Попытка извлечь имя группы (без размеров) для объединения вариантов
function extractGroupName(name: string): string {
  return name
    .replace(/\s*\d+([.,]\d+)?\s*х\s*\d+([.,]\d+)?\s*х\s*\d+([.,]\d+)?\s*(мм)?/gi, "")
    .replace(/\s*\d+([.,]\d+)?\s*х\s*\d+([.,]\d+)?\s*(мм)?/gi, "")
    .replace(/\s*\d+([.,]\d+)?\s*мм/gi, "")
    .replace(/\s*№\s*\d+([.,]\d+)?/gi, "")
    .replace(/\s+\d+([.,]\d+)?\s*$/g, "")
    .replace(/\s*\.\s*$/g, "")
    .trim()
    .replace(/-+$/g, "")
    .trim();
}

// Апсерт товара в БД: дедупликация по sourceUrl, авто-создание категории
// с иерархией, синхронизация атрибутов и единицы измерения цены.
// preserveImages=true (режим синхронизации цен) не трогает фото существующих товаров.
export async function upsertProduct(
  product: ExtractedProduct,
  imageLocal: string | null,
  opts?: { preserveImages?: boolean }
): Promise<{ created: boolean; id: string; priceChanged: boolean }> {
  const existing = await prisma.product.findUnique({
    where: { sourceUrl: product.sourceUrl },
    select: { id: true, priceRetailBase: true },
  });

  const category = await upsertCategory(
    product.categoryName || "Импорт",
    product.parentCategoryName
  );

  const groupName = extractGroupName(product.name);
  const groupId = slugify(groupName);

  const base = {
    categoryId: category.id,
    name: product.name,
    groupName,
    groupId,
    type: detectProductType(product),
    priceCost: product.price,
    priceRetailBase: product.price,
    isOnOrder: product.isOnOrder ?? false,
    weightKg: extractWeightKg(product),
    unit: product.unit ?? null,
    stock: 100,
    sourceUrl: product.sourceUrl,
  };

  if (existing) {
    const priceChanged =
      existing.priceRetailBase?.toString() !== (product.price ?? null)?.toString();
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        ...base,
        ...(opts?.preserveImages
          ? {}
          : { imageUrl: product.imageUrl, imageLocal }),
      },
    });
    // Синхронизируем атрибуты: удаляем старые, пишем актуальные
    await prisma.productAttribute.deleteMany({ where: { productId: existing.id } });
    await prisma.productAttribute.createMany({
      data: product.attributes.map((a) => ({ ...a, productId: existing.id })),
    });
    return { created: false, id: existing.id, priceChanged };
  }

  const row = await prisma.product.create({
    data: {
      ...base,
      imageUrl: product.imageUrl,
      imageLocal,
      slug: await uniqueSlug(product.slug),
    },
  });
  await prisma.productAttribute.createMany({
    data: product.attributes.map((a) => ({ ...a, productId: row.id })),
  });
  return { created: true, id: row.id, priceChanged: true };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
