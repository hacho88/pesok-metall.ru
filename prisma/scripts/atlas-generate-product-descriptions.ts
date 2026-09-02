/**
 * Atlas: генерация описаний товаров через DeepSeek.
 *
 * Флаги:
 *   --limit=N           — ограничить количество товаров
 *   --category=<slug>   — только товары указанной категории
 *   --force             — регенерировать даже с descriptionStatus=generated|manual
 *   --dry-run           — без записи в БД
 *   --concurrency=N     — параллельных запросов (по умолчанию 4)
 *
 * Пропускает товары с descriptionStatus=generated|manual, если не --force.
 * Ретраи с экспоненциальным бэкоффом на 429/5xx (до 3 попыток).
 * Пауза 300 мс между запросами в потоке.
 * Прогресс в консоль и в файл .qa/descriptions.log.
 *
 * Запуск: npx tsx prisma/scripts/atlas-generate-product-descriptions.ts
 */
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const LIMIT = parseArg(args, "limit") ? Number(parseArg(args, "limit")) : 0;
const CATEGORY = parseArg(args, "category") || "";
const FORCE = args.includes("--force");
const DRY_RUN = args.includes("--dry-run");
const CONCURRENCY = parseArg(args, "concurrency") ? Number(parseArg(args, "concurrency")) : 4;

const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const apiKey = process.env.DEEPSEEK_API_KEY || "";
const client = apiKey ? new OpenAI({ baseURL, apiKey }) : null;

const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const PAUSE_MS = 300;
const MAX_RETRIES = 3;

const fs = require("fs");
const path = require("path");
const LOG_DIR = path.join(process.cwd(), ".qa");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = path.join(LOG_DIR, "descriptions.log");

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + "\n");
}

function parseArg(args: string[], name: string): string | null {
  const flag = `--${name}=`;
  const found = args.find((a) => a.startsWith(flag));
  return found ? found.slice(flag.length) : null;
}

const SYSTEM_PROMPT = `Ты — технический копирайтер поставщика металлопроката и сыпучих строительных материалов в Москве и Московской области (магазин pesok-metall.ru). Пишешь точные, полезные описания товаров для интернет-магазина. Правила: русский язык; живой профессиональный стиль без канцелярита, воды и рекламных штампов; НЕ выдумывай характеристики, ГОСТы, размеры и цифры — используй только переданные данные; не называй цены; не упоминай конкурентов, другие сайты и бренды-источники; не пиши превосходных степеней о компании. Ответ — строго JSON без markdown.`;

interface GenResult {
  shortDescription: string;
  descriptionHtml: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
}

async function generateOne(product: any): Promise<GenResult> {
  const categoryPath = product.category?.name || "Категория не указана";
  const attrs = product.attributes.map((a: any) => `${a.key}: ${a.value}`).join(", ");
  const typeLabel = typeToLabel(product.type);
  const unit = product.unit || "шт";
  const weightInfo = product.weightKg ? `Вес единицы: ${product.weightKg} кг` : "";
  const onOrderInfo = product.isOnOrder ? "Товар поставляется под заказ (1–3 дня)." : "Товар в наличии на складе.";

  const userPrompt = `Напиши описание для товара интернет-магазина.

Товар: ${product.name}
Категория: ${categoryPath}
Тип: ${typeLabel}
Единица измерения цены: ${unit}
${weightInfo}
Атрибуты: ${attrs}
Наличие: ${onOrderInfo}
Регион: Москва и Московская область

Требуемый JSON:
{
  "shortDescription": "1 предложение, 90–160 символов: что это и для чего",
  "descriptionHtml": "<p>вводный абзац: назначение, где применяется</p><h3>Характеристики</h3><ul>...только из переданных атрибутов...</ul><h3>Применение</h3><ul>3–5 пунктов</ul><h3>Преимущества</h3><ul>3–4 пункта о свойствах материала/профиля</ul><h3>Доставка и хранение</h3><p>доставка в день заказа по Москве и МО, самовывоз со склада, условия хранения; для под заказ — поставка 1–3 дня; для сыпучих — фасовка по unit</p><h3>Частые вопросы</h3><h4>вопрос</h4><p>ответ</p> ×2–3",
  "seoTitle": "≤70 символов",
  "seoDescription": "≤160 символов",
  "keywords": ["5–8 ключевых фраз"]
}

Ограничения: текст descriptionHtml 1200–2200 символов без тегов. Разрешённые теги: p, h3, h4, ul, ol, li, strong, em, table, thead, tbody, tr, th, td. Не выдумывай ГОСТы и цифры, которых нет во входных данных.`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const resp = await client!.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000,
      });
      const content = resp.choices[0]?.message?.content || "";
      const parsed = JSON.parse(content) as GenResult;
      validateResult(parsed, product);
      return parsed;
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 429 || (status >= 500 && status < 600)) {
        const backoff = Math.pow(2, attempt) * 1000;
        log(`  retry ${attempt + 1}/${MAX_RETRIES} after ${backoff}ms (status ${status})`);
        await sleep(backoff);
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

function typeToLabel(type: string): string {
  switch (type) {
    case "METALL": return "Металлопрокат";
    case "BAG_30KG": return "Сыпучие в мешках 30 кг";
    case "BIG_BAG_1TON": return "Сыпучие в биг-бегах 1 т";
    default: return "Стройматериалы";
  }
}

function validateResult(r: GenResult, product: any) {
  if (!r.shortDescription || r.shortDescription.length < 50) throw new Error("shortDescription too short");
  if (!r.descriptionHtml || r.descriptionHtml.length < 500) throw new Error("descriptionHtml too short");
  if (r.descriptionHtml.includes("\uFFFD")) throw new Error("U+FFFD in description");
  if (r.descriptionHtml.toLowerCase().includes("city-met")) throw new Error("mentions city-met");
  if (r.descriptionHtml.toLowerCase().includes("конкурент")) throw new Error("mentions конкурент");
  if (!r.seoTitle || r.seoTitle.length > 70) throw new Error("seoTitle invalid");
  if (!r.seoDescription || r.seoDescription.length > 160) throw new Error("seoDescription invalid");
  if (!Array.isArray(r.keywords) || r.keywords.length < 3) throw new Error("keywords invalid");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function processOne(product: any): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = await generateOne(product);
    if (!DRY_RUN) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          shortDescription: result.shortDescription,
          description: result.descriptionHtml,
          seoTitle: result.seoTitle,
          seoDescription: result.seoDescription,
          keywords: result.keywords,
          descriptionStatus: "generated",
          descriptionGeneratedAt: new Date(),
          descriptionModel: MODEL,
        },
      });
    }
    return { ok: true };
  } catch (err: any) {
    if (!DRY_RUN) {
      await prisma.product.update({
        where: { id: product.id },
        data: { descriptionStatus: "failed" },
      });
    }
    return { ok: false, error: err.message };
  }
}

async function main() {
  if (!client) {
    log("ERROR: DEEPSEEK_API_KEY not set. Exiting.");
    process.exit(1);
  }

  const where: any = {};
  if (!FORCE) {
    where.descriptionStatus = { in: ["none", "failed"] };
  }
  if (CATEGORY) {
    where.category = { slug: CATEGORY };
  }

  const products = await prisma.product.findMany({
    where,
    take: LIMIT || undefined,
    include: { category: true, attributes: true },
    orderBy: { updatedAt: "desc" },
  });

  log(`Products to process: ${products.length} (force=${FORCE}, concurrency=${CONCURRENCY})`);

  let done = 0;
  let ok = 0;
  let failed = 0;
  const errors: string[] = [];

  // Обработка с ограниченной параллельностью
  const queue = [...products];
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length > 0) {
      const product = queue.shift()!;
      done++;
      const result = await processOne(product);
      if (result.ok) {
        ok++;
      } else {
        failed++;
        errors.push(`${product.name}: ${result.error}`);
        log(`  FAIL [${done}/${products.length}] ${product.name}: ${result.error}`);
      }
      if (done % 10 === 0) {
        log(`  progress: ${done}/${products.length} (ok=${ok}, fail=${failed})`);
      }
      await sleep(PAUSE_MS);
    }
  });

  await Promise.all(workers);

  log(`\n=== DONE ===`);
  log(`Total: ${done}, OK: ${ok}, Failed: ${failed}`);
  if (errors.length > 0) {
    log(`Errors (first 20):`);
    errors.slice(0, 20).forEach((e) => log(`  - ${e}`));
  }
}

main()
  .catch((e) => { log(`FATAL: ${e.message}`); process.exit(1); })
  .finally(() => prisma.$disconnect());
