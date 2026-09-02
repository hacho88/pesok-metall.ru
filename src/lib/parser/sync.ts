import { readFileSync } from "node:fs";
import { runMetalParse } from "./index";
import type { ParseCategory, ParseResult } from "./types";

export interface SyncOptions {
  /** Транспорт: http (быстрый) | playwright (обход KillBot) */
  transport?: "http" | "playwright";
  /** Максимум страниц пагинации на категорию */
  maxPages?: number;
  /** Ограничить синк конкретными категориями (по имени) — для теста и частичных синков */
  categoryNames?: string[];
}

/** Полный список категорий-доноров из citymet-categories.json */
export function loadDonorCategories(): ParseCategory[] {
  try {
    const raw = readFileSync("citymet-categories.json", "utf-8");
    const data = JSON.parse(raw) as {
      name: string;
      url: string;
      parentName?: string | null;
    }[];
    return data.map((c) => ({
      name: c.name,
      url: c.url,
      parentName: c.parentName ?? null,
    }));
  } catch {
    return [];
  }
}

/**
 * Синхронизация цен с city-met.ru.
 * Обходит все категории-доноры, обновляет цены/атрибуты существующих товаров
 * и добавляет новые позиции. Фото не скачивает и не затирает (preserveImages),
 * поэтому локальные картинки остаются нетронутыми.
 */
export async function syncPrices(options: SyncOptions = {}): Promise<ParseResult> {
  let categories = loadDonorCategories();
  if (categories.length === 0) {
    throw new Error("citymet-categories.json не найден или пуст");
  }
  if (options.categoryNames && options.categoryNames.length > 0) {
    // Матчинг по имени (без учёта регистра) или по фрагменту URL-слага
    // (слаг ASCII — надёжнее передавать через консоль, чем кириллицу)
    const wanted = options.categoryNames.map((n) => n.toLowerCase());
    categories = categories.filter(
      (c) =>
        wanted.includes(c.name.toLowerCase()) ||
        wanted.some((w) => c.url.toLowerCase().includes(w))
    );
    if (categories.length === 0) {
      throw new Error(
        `Категории не найдены: ${options.categoryNames.join(", ")}`
      );
    }
  }
  return runMetalParse({
    categoryUrl: "",
    categories,
    maxPages: options.maxPages ?? 20,
    transport: options.transport ?? "http",
    downloadImages: false,
    preserveImages: true,
  });
}
