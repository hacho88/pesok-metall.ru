import { prisma } from "../../src/lib/prisma";

/**
 * DeepSeek SEO Generator
 *
 * Генерирует уникальные SEO-описания для товаров через DeepSeek API.
 * Для каждого товара создаёт:
 *   - seoTitle (60-70 символов)
 *   - shortDescription (90-160 символов)
 *   - description (500-800 символов, HTML)
 *   - seoDescription (150-200 символов)
 *
 * Запуск:
 *   npx tsx prisma/scripts/deepseek-seo.ts                    # товары без описаний (пакетами по 20)
 *   npx tsx prisma/scripts/deepseek-seo.ts --limit=50         # только 50 товаров
 *   npx tsx prisma/scripts/deepseek-seo.ts --force            # перегенерировать все
 *   npx tsx prisma/scripts/deepseek-seo.ts --category=armatura # только категория
 *   npx tsx prisma/scripts/deepseek-seo.ts --dry-run          # без записи в БД
 */

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";
const BATCH_SIZE = 20;
const DELAY_MS = 500; // задержка между запросами

function parseArgs() {
  const args: Record<string, string | boolean> = {};
  for (const arg of process.argv.slice(2)) {
    const [key, value] = arg.replace(/^--/, "").split("=");
    args[key] = value === undefined ? true : value;
  }
  return args;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface SEOResult {
  seoTitle: string;
  shortDescription: string;
  description: string;
  seoDescription: string;
}

async function generateSEO(
  product: { name: string; unit: string; categoryName: string },
  apiKey: string,
): Promise<SEOResult> {
  const prompt = `Ты SEO-копирайтер для интернет-магазина металлопроката pesok-metall.ru.

Напиши уникальные SEO-тексты для товара:
- Название: ${product.name}
- Категория: ${product.categoryName}
- Единица измерения: ${product.unit}

Требования:
1. seoTitle: 60-70 символов, содержит название товара + "купить" + "с доставкой" + "Москва и МО"
2. shortDescription: 90-160 символов, одно предложение о товаре
3. description: 500-800 символов, HTML-формат (<p>...</p>), уникальный текст:
   - Что это за товар и его назначение
   - Размеры/характеристики (из названия)
   - ГОСТ (если применимо)
   - Применение в строительстве
   - Доставка по Москве и МО
4. seoDescription: 150-200 символов, для meta description

ВАЖНО:
- Текст должен быть уникальным, не шаблонным
- Используй синонимы и вариации
- Не выдумывай цены
- Не выдумывай ГОСТ если его нет в названии

Ответь в формате JSON:
{"seoTitle":"...","shortDescription":"...","description":"<p>...</p>","seoDescription":"..."}`;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Пустой ответ от DeepSeek");

  const parsed = JSON.parse(content);
  return {
    seoTitle: parsed.seoTitle || "",
    shortDescription: parsed.shortDescription || "",
    description: parsed.description || "",
    seoDescription: parsed.seoDescription || "",
  };
}

async function main() {
  const args = parseArgs();
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error("❌ DEEPSEEK_API_KEY не задан в .env");
    process.exit(1);
  }

  const limit = typeof args.limit === "string" ? Number(args.limit) : 0;
  const force = args.force === true;
  const dryRun = args["dry-run"] === true;
  const categorySlug = typeof args.category === "string" ? args.category : null;

  // Build query
  const where: any = {};
  if (!force) {
    where.descriptionStatus = "none";
  }
  if (categorySlug) {
    where.OR = [
      { category: { slug: categorySlug } },
      { category: { parent: { slug: categorySlug } } },
    ];
  }

  const total = await prisma.product.count({ where });
  console.log(`\n📝 DeepSeek SEO Generator`);
  console.log(`   Товаров для обработки: ${total}`);
  console.log(`   Режим: ${force ? "перегенерация всех" : "только без описаний"}`);
  console.log(`   Категория: ${categorySlug || "все"}`);
  console.log(`   Dry-run: ${dryRun ? "да" : "нет"}\n`);

  if (total === 0) {
    console.log("✅ Нет товаров для обработки");
    return;
  }

  let processed = 0;
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  // Process in batches
  const batchSize = BATCH_SIZE;
  const batches = Math.ceil(total / batchSize);

  for (let batch = 0; batch < batches; batch++) {
    if (limit > 0 && processed >= limit) {
      console.log(`\n⏹️  Достигнут лимит ${limit} товаров`);
      break;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
      },
      skip: batch * batchSize,
      take: Math.min(batchSize, limit > 0 ? limit - processed : batchSize),
      orderBy: { id: "asc" },
    });

    console.log(`\n📦 Пакет ${batch + 1}/${batches} (${products.length} товаров)`);

    for (const product of products) {
      processed++;
      const progress = `[${processed}/${total}]`;

      try {
        console.log(`  ${progress} ${product.name.substring(0, 50)}...`);

        const seo = await generateSEO(
          {
            name: product.name,
            unit: product.unit || "шт",
            categoryName: product.category?.name || "Металлопрокат",
          },
          apiKey,
        );

        if (!dryRun) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              seoTitle: seo.seoTitle,
              shortDescription: seo.shortDescription,
              description: seo.description,
              seoDescription: seo.seoDescription,
              descriptionStatus: "generated",
              descriptionGeneratedAt: new Date(),
              descriptionModel: DEEPSEEK_MODEL,
            },
          });
        }

        success++;
        console.log(`    ✅ ${seo.seoTitle.substring(0, 60)}...`);
      } catch (e) {
        failed++;
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${product.name}: ${msg}`);
        console.log(`    ❌ ${msg.substring(0, 80)}`);

        if (!dryRun) {
          await prisma.product.update({
            where: { id: product.id },
            data: { descriptionStatus: "failed" },
          });
        }
      }

      await sleep(DELAY_MS);
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 Итог:`);
  console.log(`   Обработано: ${processed}`);
  console.log(`   Успешно:    ${success}`);
  console.log(`   Ошибок:     ${failed}`);
  if (errors.length > 0) {
    console.log(`\nОшибки (первые 5):`);
    errors.slice(0, 5).forEach((e) => console.log(`  - ${e}`));
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Сбой:", e);
  process.exit(1);
});
