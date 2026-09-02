/**
 * Atlas: генерация описаний категорий через DeepSeek.
 * Для всех категорий с товарами: shortDescription, description, seoTitle, seoDescription.
 *
 * Флаги: --limit=N, --force, --dry-run, --concurrency=2
 * Запуск: npx tsx prisma/scripts/atlas-generate-category-descriptions.ts
 */
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const LIMIT = parseArg(args, "limit") ? Number(parseArg(args, "limit")) : 0;
const FORCE = args.includes("--force");
const DRY_RUN = args.includes("--dry-run");
const CONCURRENCY = parseArg(args, "concurrency") ? Number(parseArg(args, "concurrency")) : 2;

const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const apiKey = process.env.DEEPSEEK_API_KEY || "";
const client = apiKey ? new OpenAI({ baseURL, apiKey }) : null;
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

const fs = require("fs");
const path = require("path");
const LOG_DIR = path.join(process.cwd(), ".qa");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = path.join(LOG_DIR, "descriptions.log");

function log(msg: string) {
  const line = `[${new Date().toISOString()}] [categories] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + "\n");
}

function parseArg(args: string[], name: string): string | null {
  const flag = `--${name}=`;
  const found = args.find((a) => a.startsWith(flag));
  return found ? found.slice(flag.length) : null;
}

const SYSTEM_PROMPT = `Ты — технический копирайтер поставщика металлопроката и сыпучих строительных материалов в Москве и Московской области (магазин pesok-metall.ru). Пишешь точные, полезные описания категорий товаров для интернет-магазина. Правила: русский язык; живой профессиональный стиль без канцелярита, воды и рекламных штампов; не называй цены; не упоминай конкурентов и другие сайты. Ответ — строго JSON без markdown.`;

interface CatResult {
  shortDescription: string;
  descriptionHtml: string;
  seoTitle: string;
  seoDescription: string;
}

async function generateOne(cat: any, productCount: number, sampleProducts: string[]): Promise<CatResult> {
  const userPrompt = `Напиши описание для категории интернет-магазина.

Категория: ${cat.name}
Количество товаров: ${productCount}
Примеры товаров: ${sampleProducts.join(", ")}

Требуемый JSON:
{
  "shortDescription": "1 предложение, ≤160 символов: что входит в категорию",
  "descriptionHtml": "<p>вводный абзац: что входит в категорию</p><h3>Как выбрать</h3><p>...</p><h3>Применение</h3><ul>...</ul><h3>Частые вопросы</h3><h4>вопрос</h4><p>ответ</p> ×2",
  "seoTitle": "≤70 символов",
  "seoDescription": "≤160 символов"
}

Ограничения: текст descriptionHtml 600–1200 символов без тегов. Разрешённые теги: p, h3, h4, ul, ol, li, strong, em. Не выдумывай характеристики.`;

  const resp = await client!.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 1500,
  });
  const content = resp.choices[0]?.message?.content || "";
  return JSON.parse(content) as CatResult;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!client) {
    log("ERROR: DEEPSEEK_API_KEY not set.");
    process.exit(1);
  }

  const where: any = { products: { some: {} } };
  if (!FORCE) {
    where.descriptionStatus = { in: ["none", "failed"] };
  }

  const categories = await prisma.category.findMany({
    where,
    take: LIMIT || undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  log(`Categories to process: ${categories.length}`);

  let ok = 0;
  let failed = 0;

  const queue = [...categories];
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length > 0) {
      const cat = queue.shift()!;
      try {
        const samples = await prisma.product.findMany({
          where: { categoryId: cat.id },
          select: { name: true },
          take: 5,
          orderBy: { updatedAt: "desc" },
        });
        const result = await generateOne(cat, cat._count.products, samples.map((s) => s.name));
        if (!DRY_RUN) {
          await prisma.category.update({
            where: { id: cat.id },
            data: {
              shortDescription: result.shortDescription,
              description: result.descriptionHtml,
              seoTitle: result.seoTitle,
              seoDescription: result.seoDescription,
              descriptionStatus: "generated",
              descriptionGeneratedAt: new Date(),
            },
          });
        }
        ok++;
        log(`  OK: ${cat.name}`);
      } catch (err: any) {
        failed++;
        log(`  FAIL: ${cat.name}: ${err.message}`);
        if (!DRY_RUN) {
          await prisma.category.update({
            where: { id: cat.id },
            data: { descriptionStatus: "failed" },
          });
        }
      }
      await sleep(300);
    }
  });

  await Promise.all(workers);
  log(`\n=== DONE === OK: ${ok}, Failed: ${failed}`);
}

main()
  .catch((e) => { log(`FATAL: ${e.message}`); process.exit(1); })
  .finally(() => prisma.$disconnect());
