// Извлечение структуры каталога city-met.ru (категории металлопроката)
// Использование: npx tsx prisma/scripts/categories-citymet.ts
// Результат: citymet-categories.json в корне проекта
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

interface CategoryNode {
  name: string;
  url: string;
  children: CategoryNode[];
}

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

  // Ждём прохождения KillBot
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

  // Собираем ссылки каталога: пункты меню и все ссылки на разделы
  const links = await page.evaluate(() => {
    const out: { text: string; href: string }[] = [];
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = (a as HTMLAnchorElement).href;
      const text = (a.textContent || "").trim().replace(/\s+/g, " ");
      if (!href || !text) return;
      try {
        const u = new URL(href);
        // Только внутренние ссылки city-met.ru, не служебные
        if (
          u.hostname !== "city-met.ru" ||
          /^\/(contacts|blog|news|search|basket|cart|auth|personal|about|delivery|payment|reviews|sale|actions|brands|company|requisites|vacancy|partners|opt|wholesale|stock|akcii|aktsii|dostavka|oplata|kontakty|otzyvy|novosti|stati|stat'i|vakansii)\b/i.test(
            u.pathname
          ) ||
          u.pathname.split("/").filter(Boolean).length < 2
        ) {
          return;
        }
        out.push({ text, href: u.href });
      } catch {
        // ignore
      }
    });
    return out;
  });

  // Дедупликация по URL и построение дерева: /раздел/подраздел/... 
  const seen = new Map<string, string>();
  for (const l of links) {
    const u = new URL(l.href);
    const path = u.pathname.replace(/\/+$/, "");
    if (!seen.has(path)) seen.set(path, l.text);
  }

  const tree: CategoryNode[] = [];
  const byPath = new Map<string, CategoryNode>();
  for (const [path, text] of [...seen.entries()].sort()) {
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) continue;
    const node: CategoryNode = { name: text, url: `https://city-met.ru${path}/`, children: [] };
    byPath.set(path, node);
    if (parts.length === 1) {
      tree.push(node);
    } else {
      const parentPath = "/" + parts.slice(0, -1).join("/");
      const parent = byPath.get(parentPath);
      if (parent) parent.children.push(node);
      else tree.push(node);
    }
  }

  writeFileSync("citymet-categories.json", JSON.stringify(tree, null, 2), "utf-8");
  console.log("\n=== Категории city-met.ru ===");
  const print = (nodes: CategoryNode[], depth: number) => {
    for (const n of nodes) {
      console.log(`${"  ".repeat(depth)}- ${n.name} (${n.url})`);
      print(n.children, depth + 1);
    }
  };
  print(tree, 0);
  console.log(`\nВсего ссылок: ${seen.size}, сохранено в citymet-categories.json`);

  await browser.close();
}

main().catch((e) => {
  console.error("Ошибка:", e);
  process.exit(1);
});
