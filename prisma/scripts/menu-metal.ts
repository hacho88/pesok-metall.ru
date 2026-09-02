// Анализ меню каталога city-met.ru: дамп HTML меню + извлечение категорий
// Использование: npx tsx prisma/scripts/menu-citymet.ts
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

async function main() {
  const headless = process.env.HEADLESS !== "0";
  const browser = await chromium.launch({
    headless,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-dev-shm-usage",
    ],
  });
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    locale: "ru-RU",
    viewport: { width: 1440, height: 900 },
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    // @ts-ignore
    window.chrome = window.chrome || { runtime: {} };
  });

  const url = process.env.URL ?? "https://city-met.ru/";
  console.log("Открываем:", url);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });

  let html = "";
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(3000);
    html = await page.content();
    const hasKillBot = /killbot|user verification|подтвердите|проверка браузера/i.test(
      html.slice(0, 4000)
    );
    console.log(`t+${(i + 1) * 3}s | killbot: ${hasKillBot}`);
    if (!hasKillBot) break;
  }

  // Ищем контейнеры меню каталога
  const menuInfo = await page.evaluate(() => {
    const candidates = [
      ".bx_catalog_menu",
      ".catalog-menu",
      ".catalog_menu",
      ".bx-menu",
      ".menu-catalog",
      ".catalog-nav",
      ".left-menu",
      ".sidebar-menu",
      ".catalog-section-list",
      ".bx_catalog_line",
      ".catalog-sections",
      ".catalog__menu",
      ".top-menu",
      ".main-menu",
      "nav",
      ".header-menu",
      ".menu",
    ];
    const found: { selector: string; count: number; html: string }[] = [];
    for (const sel of candidates) {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) {
        found.push({
          selector: sel,
          count: els.length,
          html: els[0].outerHTML.slice(0, 3000),
        });
      }
    }
    return found;
  });

  writeFileSync("citymet-menu.html", html, "utf-8");
  console.log("HTML сохранён в citymet-menu.html, размер:", html.length);
  console.log("\n=== Найденные меню ===");
  for (const m of menuInfo) {
    console.log(`\n--- ${m.selector} (${m.count}) ---`);
    console.log(m.html);
  }

  await browser.close();
}

main().catch((e) => {
  console.error("Ошибка:", e);
  process.exit(1);
});
