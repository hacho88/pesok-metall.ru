export interface ProductDraft {
  name: string;
  categoryName: string;
  parentCategoryName?: string;
  price: number | null; // null = «под заказ» (нет цены на сайте-доноре)
  isOnOrder?: boolean;
  unit?: string;
  sourceUrl: string;
  imageUrl: string | null;
  attributes: { key: string; value: string }[];
}

export interface ParseCategory {
  name: string;
  url: string;
  parentName?: string | null;
}

export interface ParseOptions {
  /** Категория-донор, например https://city-met.ru/armatura */
  categoryUrl: string;
  /** Полный список категорий для обхода (приоритетнее categoryUrl) */
  categories?: ParseCategory[];
  /** Максимум страниц каталога (пагинация) */
  maxPages?: number;
  /** Транспорт: http | playwright (playwright — обход KillBot) */
  transport?: "http" | "playwright";
  /** Скачивать ли фото локально в /public/products */
  downloadImages?: boolean;
  /** Не трогать imageLocal/imageUrl у существующих товаров (режим синхронизации цен) */
  preserveImages?: boolean;
  /** Не писать в БД, только вывести результат */
  dryRun?: boolean;
}

export interface ParseResult {
  found: number;
  downloaded: number;
  upserted: number;
  /** Сколько существующих товаров изменили цену */
  priceChanged: number;
  failed: number;
  errors: string[];
  durationMs: number;
}
