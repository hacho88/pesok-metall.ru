import { readFileSync } from "node:fs";
import { runMetalParse } from "../../src/lib/parser";
import type { ParseCategory } from "../../src/lib/parser/types";

// CLI: npm run parse:metal -- --url=https://city-met.ru/armatura --pages=5 --transport=playwright
// Флаги:
//   --url=...       страница каталога-донора (обязательно, если не --all)
//   --all           полный обход всех категорий из metal-categories.json
//   --pages=N       максимум страниц пагинации (по умолчанию 20)
//   --transport=... http | playwright (по умолчанию http, при KillBot авто-попытка playwright)
//   --no-images     не скачивать фото локально
//   --dry-run       не писать в БД, только показать найденное

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      args[key] = value === undefined ? true : value;
    }
  }
  return args;
}

function loadCategories(): ParseCategory[] {
  try {
    const raw = readFileSync("metal-categories.json", "utf-8");
    const data = JSON.parse(raw) as { name: string; url: string; parentName?: string | null }[];
    return data.map((c) => ({ name: c.name, url: c.url, parentName: c.parentName ?? null }));
  } catch {
    return [];
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // Windows/npm не всегда пробрасывает аргументы — поддерживаем env-переменные:
  // $env:URL="https://city-met.ru/armatura"; npm run parse:metal
  const url =
    (typeof args.url === "string" ? args.url : null) ||
    process.env.URL ||
    null;

  const all = args.all === true || process.env.ALL === "1";
  const categories = all ? loadCategories() : undefined;

  if (!url && (!categories || categories.length === 0)) {
    console.error(
      "Укажите страницу каталога или режим полного обхода:\n" +
        "  npm run parse:metal -- --url=https://city-met.ru/armatura\n" +
        "  npm run parse:metal -- --all\n" +
        "  или через env: $env:URL='https://city-met.ru/armatura'; npm run parse:metal"
    );
    process.exit(1);
  }

  const result = await runMetalParse({
    categoryUrl: url ?? "",
    categories,
    maxPages:
      (typeof args.pages === "string" ? Number(args.pages) : null) ??
      (process.env.PAGES ? Number(process.env.PAGES) : 20),
    transport:
      args.transport === "playwright" || process.env.TRANSPORT === "playwright"
        ? "playwright"
        : "http",
    downloadImages: args["no-images"] !== true && process.env.NO_IMAGES !== "1",
    dryRun: args["dry-run"] === true || process.env.DRY_RUN === "1",
  });

  console.log("\n=== Итог парсинга ===");
  console.log(`Найдено товаров:   ${result.found}`);
  console.log(`Скачано фото:      ${result.downloaded}`);
  console.log(`Добавлено в БД:    ${result.upserted}`);
  console.log(`Ошибок:            ${result.failed}`);
  console.log(`Время:             ${(result.durationMs / 1000).toFixed(1)} с`);
  if (result.errors.length > 0) {
    console.log("\nОшибки:");
    result.errors.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
  }
}

main()
  .catch((error) => {
    console.error("Сбой парсера:", error);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../../src/lib/prisma");
    await prisma.$disconnect();
  });
