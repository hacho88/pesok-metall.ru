// Перекачивает фото товаров: удаляет битые HTML-файлы (KillBot отдавал HTML
// вместо картинок по HTTP) и скачивает оригиналы через Playwright
import { readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../../src/lib/prisma";
import { createImageDownloader } from "../../src/lib/parser/download-images";

const PUBLIC_PRODUCTS_DIR = path.join(process.cwd(), "public", "products");

async function main() {
  // 1. Удаляем битые файлы (HTML, сохранённые как .jpg/.png)
  const files = await readdir(PUBLIC_PRODUCTS_DIR);
  let removed = 0;
  for (const f of files) {
    if (f === ".gitkeep") continue;
    await unlink(path.join(PUBLIC_PRODUCTS_DIR, f)).catch(() => {});
    removed += 1;
  }
  console.log(`Удалено битых файлов: ${removed}`);

  // 2. Перекачиваем оригиналы
  const products = await prisma.product.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, slug: true, imageUrl: true },
  });
  console.log(`Товаров с фото: ${products.length}`);

  const images = await createImageDownloader();
  let ok = 0;
  try {
    for (const p of products) {
      const local = await images.download(p.slug, p.imageUrl!);
      if (local) {
        await prisma.product.update({ where: { id: p.id }, data: { imageLocal: local } });
        ok += 1;
      }
      if (ok % 25 === 0) console.log(`Скачано: ${ok}/${products.length}`);
    }
  } finally {
    await images.close();
  }
  console.log(`Готово: ${ok}/${products.length}`);
}

main()
  .catch((e) => {
    console.error("Ошибка:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
