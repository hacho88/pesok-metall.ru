import { fetchHtml, closeSharedBrowser } from "./transport";
import { extractProducts, extractNextPageUrl } from "./extract";
import { createImageDownloader, type ImageDownloader } from "./download-images";
import { upsertProduct } from "./upsert";
import type { ParseOptions, ParseResult, ParseCategory } from "./types";
import * as cheerio from "cheerio";

// Парсит одну категорию: пагинация → извлечение → фото → апсерт
async function parseCategory(
  category: ParseCategory,
  options: ParseOptions,
  result: ParseResult,
  images: ImageDownloader | null
): Promise<void> {
  const maxPages = options.maxPages ?? 20;
  let currentUrl: string | null = category.url;

  for (let page = 1; page <= maxPages && currentUrl; page++) {
    console.log(`[парсер] ${category.name}: страница ${page}: ${currentUrl}`);
    let html: string;
    try {
      html = await fetchHtml(currentUrl, options.transport ?? "http");
    } catch (error) {
      result.failed += 1;
      const msg = `Категория «${category.name}»: ${String(error).slice(0, 200)}`;
      result.errors.push(msg);
      console.error(`[парсер] ОШИБКА: ${msg}`);
      return;
    }

    const products = extractProducts(
      html,
      currentUrl,
      category.name,
      category.parentName ?? ""
    );
    result.found += products.length;
    console.log(`[парсер] Найдено товаров: ${products.length}`);

    for (const product of products) {
      try {
        let imageLocal: string | null = null;
        if (options.downloadImages && product.imageUrl && images) {
          imageLocal = await images.download(product.slug, product.imageUrl);
          if (imageLocal) result.downloaded += 1;
        }

        if (options.dryRun) {
          console.log(
            `  - ${product.name} | ${product.price} ₽/${product.unit ?? "ед"} | фото: ${imageLocal ?? product.imageUrl ?? "нет"}`
          );
          continue;
        }

        const { created, priceChanged } = await upsertProduct(product, imageLocal, {
          preserveImages: options.preserveImages,
        });
        if (created) result.upserted += 1;
        if (priceChanged) result.priceChanged += 1;
      } catch (error) {
        result.failed += 1;
        const message = `Товар «${product.name}»: ${String(error)}`;
        result.errors.push(message);
        console.error(`[парсер] ОШИБКА: ${message}`);
      }
    }

    currentUrl = extractNextPageUrl(html, currentUrl);
    if (currentUrl) {
      // Вежливая пауза между страницами
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
}

// Оркестратор: обход каталога → извлечение → скачивание фото → апсерт в БД
export async function runMetalParse(options: ParseOptions): Promise<ParseResult> {
  const startedAt = Date.now();
  const result: ParseResult = {
    found: 0,
    downloaded: 0,
    upserted: 0,
    priceChanged: 0,
    failed: 0,
    errors: [],
    durationMs: 0,
  };

  // Единый браузер для скачивания фото на весь прогон
  let images: ImageDownloader | null = null;
  if (options.downloadImages) {
    try {
      images = await createImageDownloader();
    } catch (error) {
      console.warn(`[парсер] Фото скачиваться не будут: ${String(error)}`);
    }
  }

  try {
    // Режим полного обхода: все категории из списка
    if (options.categories && options.categories.length > 0) {
      for (const category of options.categories) {
        console.log(`\n[парсер] === Категория: ${category.name} (${category.url}) ===`);
        await parseCategory(category, options, result, images);
      }
      result.durationMs = Date.now() - startedAt;
      return result;
    }

  // Режим одной категории
    const $ = cheerio.load(await fetchHtml(options.categoryUrl, options.transport ?? "http"));
    const pageTitle = $("h1").first().text().trim() || $("title").first().text().split("|")[0].trim();
    
    await parseCategory(
      { name: pageTitle || "Импорт", url: options.categoryUrl, parentName: null },
      options,
      result,
      images
    );
    result.durationMs = Date.now() - startedAt;
    return result;
  } finally {
    await images?.close();
    await closeSharedBrowser();
  }
}
