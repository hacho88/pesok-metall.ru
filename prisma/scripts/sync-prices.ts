// Синхронизация цен с city-met.ru
// CLI:
//   npm run sync:prices                        — один проход (HTTP, без фото)
//   npm run sync:prices -- --watch             — постоянный режим, каждые 6 часов
//   npm run sync:prices -- --interval=3600000  — интервал в мс (по умолчанию 6 ч)
//   npm run sync:prices -- --transport=playwright  — обход KillBot через браузер
//   npm run sync:prices -- --pages=5           — ограничить пагинацию (для теста)
//   npm run sync:prices -- --category=armatura — синк категории по слагу URL (для теста,
//                                                кириллица в консоли Windows искажается)
import { syncPrices } from "../../src/lib/parser/sync";
import type { ParseResult } from "../../src/lib/parser/types";

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

function printResult(result: ParseResult) {
  console.log("\n=== Итог синхронизации цен ===");
  console.log(`Найдено товаров:   ${result.found}`);
  console.log(`Добавлено новых:   ${result.upserted}`);
  console.log(`Обновлено цен:     ${result.priceChanged}`);
  console.log(`Ошибок:            ${result.failed}`);
  console.log(`Время:             ${(result.durationMs / 1000).toFixed(1)} с`);
  if (result.errors.length > 0) {
    console.log("\nОшибки:");
    result.errors.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const watch = args.watch === true || process.env.WATCH === "1";
  const intervalMs = Number(
    (typeof args.interval === "string" ? args.interval : null) ??
      process.env.INTERVAL_MS ??
      6 * 60 * 60 * 1000
  );
  const transport =
    args.transport === "playwright" || process.env.TRANSPORT === "playwright"
      ? "playwright"
      : "http";
  const maxPages =
    (typeof args.pages === "string" ? Number(args.pages) : null) ??
    (process.env.PAGES ? Number(process.env.PAGES) : 20);
  const categoryNames =
    typeof args.category === "string" && args.category
      ? [args.category]
      : undefined;

  const runOnce = async () => {
    console.log(
      `\n[синк] ${new Date().toISOString()} — синхронизация цен с city-met.ru (${transport}, до ${maxPages} стр.${categoryNames ? `, категория: ${categoryNames.join(", ")}` : ", все категории"})`
    );
    try {
      const result = await syncPrices({ transport, maxPages, categoryNames });
      printResult(result);
    } catch (error) {
      console.error("[синк] Сбой прохода:", error);
    }
  };

  await runOnce();

  if (watch) {
    console.log(
      `[синк] Постоянный режим: следующий проход через ${Math.round(intervalMs / 60000)} мин`
    );
    // Процесс живёт дальше, Prisma остаётся подключённым
    setInterval(runOnce, intervalMs);
    return;
  }

  const { prisma } = await import("../../src/lib/prisma");
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Сбой синхронизации:", error);
  process.exit(1);
});
