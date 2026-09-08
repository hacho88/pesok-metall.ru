import { prisma } from "../../src/lib/prisma";

/**
 * DeepSeek Unit Detector
 *
 * Анализирует название товара и определяет правильную единицу измерения.
 * Полезно для товаров где парсер мог ошибиться.
 *
 * Запуск:
 *   npx tsx prisma/scripts/deepseek-units.ts --dry-run    # только показать
 *   npx tsx prisma/scripts/deepseek-units.ts --limit=50   # 50 товаров
 *   npx tsx prisma/scripts/deepseek-units.ts              # все сомнительные
 */

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";
const BATCH_SIZE = 20;
const DELAY_MS = 300;

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

interface UnitResult {
  unit: string;
  reason: string;
}

async function detectUnit(
  productName: string,
  currentUnit: string,
  categoryName: string,
  apiKey: string,
): Promise<UnitResult> {
  const prompt = `Ты эксперт по металлопрокату. Определи правильную единицу измерения для товара.

Товар: ${productName}
Категория: ${categoryName}
Текущая единица: ${currentUnit}

Правила:
- "м" — если товар продаётся метрами (арматура, труба, профиль, уголок, полоса, швеллер, балка, катанка)
- "шт" — если товар продаётся поштучно (лист, профнастил, сетка, шифер, панель, плита, блок)
- "лист" — если это листовой прокат продающийся листами
- "т" — если товар продаётся тоннами (сыпучие материалы: песок, щебень, керамзит)
- "кг" — если товар продаётся на вес
- "уп" — если товар продаётся упаковками (мешки, биг-беги)
- "м²" — если товар продаётся квадратными метрами (сетка кладочная, профнастил кровельный)

Ответь JSON: {"unit":"...","reason":"краткое объяснение"}`;

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
      temperature: 0.1,
      max_tokens: 200,
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
    unit: parsed.unit || currentUnit,
    reason: parsed.reason || "",
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
  const dryRun = args["dry-run"] === true;

  // Сомнительные единицы: "м" для листов, "шт" для арматуры и т.д.
  const where: any = {
    OR: [
      // Листовые товары с единицей "м" — подозрительно
      { AND: [{ name: { contains: "лист", mode: "insensitive" } }, { unit: "м" }] },
      { AND: [{ name: { contains: "профнастил", mode: "insensitive" } }, { unit: "м" }] },
      { AND: [{ name: { contains: "сетка", mode: "insensitive" } }, { unit: "м" }] },
      // Арматура/трубы с "шт" — может быть правильно (хлысты), но проверить
      { AND: [{ name: { contains: "песок", mode: "insensitive" } }, { unit: { not: "т" } }] },
      { AND: [{ name: { contains: "щебень", mode: "insensitive" } }, { unit: { not: "т" } }] },
      { AND: [{ name: { contains: "керамзит", mode: "insensitive" } }, { unit: { not: "т" } }] },
    ],
  };

  const total = await prisma.product.count({ where });
  console.log(`\n🔍 DeepSeek Unit Detector`);
  console.log(`   Сомнительных товаров: ${total}`);
  console.log(`   Dry-run: ${dryRun ? "да" : "нет"}\n`);

  if (total === 0) {
    console.log("✅ Нет сомнительных товаров");
    return;
  }

  let processed = 0;
  let changed = 0;
  let kept = 0;
  let failed = 0;

  const products = await prisma.product.findMany({
    where,
    include: { category: { select: { name: true } } },
    take: limit > 0 ? limit : undefined,
    orderBy: { id: "asc" },
  });

  for (const product of products) {
    processed++;
    const progress = `[${processed}/${products.length}]`;

    try {
      const result = await detectUnit(
        product.name,
        product.unit || "шт",
        product.category?.name || "Металлопрокат",
        apiKey,
      );

      const changed_ = result.unit !== product.unit;

      if (changed_) {
        changed++;
        console.log(`  ${progress} ⚠️  ${product.name.substring(0, 45)}`);
        console.log(`    ${product.unit} → ${result.unit} (${result.reason})`);

        if (!dryRun) {
          await prisma.product.update({
            where: { id: product.id },
            data: { unit: result.unit },
          });
        }
      } else {
        kept++;
        if (args.verbose === true) {
          console.log(`  ${progress} ✅ ${product.name.substring(0, 45)} → ${product.unit} (ок)`);
        }
      }
    } catch (e) {
      failed++;
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`  ${progress} ❌ ${product.name.substring(0, 45)}: ${msg.substring(0, 60)}`);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 Итог:`);
  console.log(`   Проверено:    ${processed}`);
  console.log(`   Изменено:     ${changed}`);
  console.log(`   Оставлено:    ${kept}`);
  console.log(`   Ошибок:       ${failed}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Сбой:", e);
  process.exit(1);
});
