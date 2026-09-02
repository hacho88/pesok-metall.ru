// Отладка KillBot: что видит Playwright на city-met.ru
import { chromium } from "playwright";

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
  // Маскируем автоматизацию
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    // @ts-ignore
    window.chrome = window.chrome || { runtime: {} };
  });

  const url = process.env.URL ?? "https://city-met.ru/armatura";
  console.log("Открываем:", url);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });

  for (const wait of [0, 3000, 6000, 10000]) {
    if (wait > 0) await page.waitForTimeout(wait);
    const title = await page.title();
    const html = await page.content();
    const hasKillBot = /killbot|user verification|подтвердите|проверка браузера/i.test(html.slice(0, 4000));
    const iframes = await page.locator("iframe").count();
    console.log(`--- t+${wait / 1000}s | title: "${title}" | killbot: ${hasKillBot} | iframes: ${iframes}`);
    if (!hasKillBot) {
      // Сохраняем HTML для анализа структуры
      const { writeFileSync } = await import("node:fs");
      writeFileSync("citymet-page.html", html);
      console.log("Сохранено в citymet-page.html, размер:", html.length);
      break;
    }
  }

  await browser.close();
}

main().catch((e) => {
  console.error("Ошибка:", e);
  process.exit(1);
});
