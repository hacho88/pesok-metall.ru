import * as cheerio from "cheerio";
import type { ProductDraft } from "./types";

// Селекторы карточек товаров для типовых платформ (1C-Bitrix, ShopCMS и др.)
// city-met.ru: табличный каталог <tr class="catalog-item-container"> с .catalog-list__*
const CARD_SELECTORS = [
  ".catalog-item-container",
  ".catalog-item",
  ".product-card",
  ".catalog-card",
  ".item-card",
  ".product-item",
  ".product",
  "[data-product-id]",
  ".js-product",
  "article",
];

const NAME_SELECTORS = [
  ".catalog-list__title a",
  ".catalog-item__title",
  ".product-card__title",
  ".product-card__name",
  ".item-card__title",
  ".product-item__title",
  ".product__title",
  ".product-name",
  ".title",
  "a[title]",
  "h3 a",
  "h4 a",
  ".name a",
];

// ВАЖНО: на city-met.ru .red-price — это старая (зачёркнутая) цена в табличном
// макете, а текущая — в span[id$="_price"] без класса. В сеточном макете текущая
// цена — .catalog-item__price__value (без .jstotalsum — это блок «Сумма»).
const PRICE_SELECTORS = [
  ".catalog-item__price__value:not(.jstotalsum)",
  ".catalog-item__price-wrap span:not(.red-price)",
  ".red-price",
  ".product-card__price",
  ".catalog-item__price",
  ".item-card__price",
  ".product-item__price",
  ".product__price",
  ".price",
  "[data-price]",
  ".price-current",
];

const IMAGE_SELECTORS = [
  ".catalog-list__image img",
  ".catalog-item__image img",
  ".product-card__image img",
  ".item-card__image img",
  ".product-item__image img",
  ".product__image img",
  ".product-image img",
  "img[data-src]",
  ".card-img img",
  "img",
];

function normalizePrice(raw: string): number | null {
  const digits = raw.replace(/\s/g, "").replace(/[^\d.,]/g, "");
  const normalized = digits.replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}

// Единица измерения из текста цены: "19.40 ₽/м" -> "м", "87377.60 ₽/т" -> "т"
function extractUnit(raw: string): string | undefined {
  const match = raw.match(/₽\s*\/\s*([а-яёa-z²]+)/i);
  if (!match) return undefined;
  const unit = match[1].toLowerCase();
  const map: Record<string, string> = {
    м: "м",
    метр: "м",
    т: "т",
    тонн: "т",
    шт: "шт",
    штук: "шт",
    лист: "лист",
    "м²": "м²",
    "м2": "м²",
    кг: "кг",
  };
  return map[unit] ?? unit;
}

function absoluteUrl(base: string, href: string | undefined): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export interface ExtractedProduct extends ProductDraft {
  slug: string;
}

// Извлекает товары из HTML страницы каталога
// categoryName — имя категории-донора (например "Арматура А3 рифленая")
// parentCategoryName — имя родительской категории (например "Арматура")
export function extractProducts(
  html: string,
  pageUrl: string,
  categoryName = "",
  parentCategoryName = ""
): ExtractedProduct[] {
  const $ = cheerio.load(html);
  const products: ExtractedProduct[] = [];

  // Обрабатываем карточки по всем селекторам, дедуплицируя по URL товара
  const seen = new Set<string>();
  for (const cardSelector of CARD_SELECTORS) {
    $(cardSelector).each((_, el) => {
      const $card = $(el);

      // Название
      let name = "";
      for (const selector of NAME_SELECTORS) {
        const node = $card.find(selector).first();
        name = node.attr("title") || node.text().trim();
        if (name) break;
      }
      if (!name) return;

      // Ссылка на товар
      const linkHref = $card.find("a[href]").first().attr("href");
      const sourceUrl = absoluteUrl(pageUrl, linkHref);
      if (!sourceUrl || seen.has(sourceUrl)) return;
      seen.add(sourceUrl);

      // Цена и единица измерения
      let price: number | null = null;
      let unit: string | undefined;
      for (const selector of PRICE_SELECTORS) {
        const node = $card.find(selector).first();
        const raw = node.attr("data-price") || node.text();
        // Только если это действительно цена: data-price или текст с ₽/руб.
        // Иначе «Под заказ 1-3 дня» (нет в наличии) парсится как число 13.
        if (!node.attr("data-price") && !/₽|руб/i.test(raw)) continue;
        price = normalizePrice(raw);
        if (price !== null) {
          unit = extractUnit(raw);
          break;
        }
      }
      // «Под заказ 1-3 дня» / «Нет в наличии» — товар без цены, импортируем с пометкой
      let isOnOrder = false;
      if (price === null) {
        const priceBlockText = $card
          .find(
            '[data-entity="price-block"], .catalog-item__price-wrap, .catalog-item__price, .price, .product-card__price'
          )
          .text();
        isOnOrder = /под заказ|нет в наличии|уточняйте/i.test(priceBlockText);
        if (!isOnOrder) return;
      }

      // Фото
      let imageUrl: string | null = null;
      for (const selector of IMAGE_SELECTORS) {
        const node = $card.find(selector).first();
        const src = node.attr("data-src") || node.attr("src") || node.attr("data-lazy") || node.attr("srcset")?.split(" ")[0];
        imageUrl = absoluteUrl(pageUrl, src);
        if (imageUrl && !imageUrl.includes("no_photo") && !imageUrl.includes("blank.gif")) break;
        imageUrl = null;
      }

      // Атрибуты: длина/вес из табличного каталога + общие списки
      const attributes: { key: string; value: string }[] = [];

      // 1. Прямые селекторы для city-met
      const lengthText = $card.find(".catalog-list__length, [data-property='length']").first().text().trim().replace(/^Длина\s*/i, "");
      if (lengthText) attributes.push({ key: "Длина", value: lengthText });

      const weightText = $card.find(".catalog-list__weight, [data-property='weight']").first().text().trim().replace(/^Вес\s*/i, "");
      if (weightText) attributes.push({ key: "Вес", value: weightText });

      const brandText = $card.find(".catalog-list__brand, [data-property='brand']").first().text().trim().replace(/^Марка\s*/i, "");
      if (brandText) attributes.push({ key: "Марка стали", value: brandText });

      // 2. Универсальный парсинг списков характеристик
      $card
        .find(".product-card__props li, .props li, .char li, .characteristics li, .catalog-item__props li")
        .each((_, propEl) => {
          const text = $(propEl).text().trim();
          const [key, ...rest] = text.split(":");
          if (key && rest.length > 0) {
            const k = key.trim();
            const v = rest.join(":").trim();
            if (k && v && !attributes.some(a => a.key === k)) {
              attributes.push({ key: k, value: v });
            }
          }
        });

      // 3. Попытка вытащить ГОСТ из названия или описания, если не нашли
      if (!attributes.some(a => /гост/i.test(a.key))) {
        const gostMatch = name.match(/ГОСТ\s+[\d-]+/i) || html.match(/ГОСТ\s+[\d-]+/i);
        if (gostMatch) {
          attributes.push({ key: "ГОСТ", value: gostMatch[0] });
        }
      }

      products.push({
        name,
        parentCategoryName,
        slug: slugify(name),
        categoryName,
        price,
        isOnOrder,
        unit,
        sourceUrl,
        imageUrl,
        attributes,
      });
    });
  }

  return products;
}

// Извлекает ссылку на следующую страницу пагинации
export function extractNextPageUrl(html: string, pageUrl: string): string | null {
  const $ = cheerio.load(html);
  const nextSelectors = [
    ".bx-pag-next a",
    ".pagination .next a",
    ".pagination a.next",
    "a.next",
    "a[rel='next']",
    ".pager .next a",
  ];
  for (const selector of nextSelectors) {
    const href = $(selector).first().attr("href");
    if (href) return absoluteUrl(pageUrl, href);
  }
  return null;
}
