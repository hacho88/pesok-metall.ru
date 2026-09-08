const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

export class KillBotDetectedError extends Error {
  constructor(url: string) {
    super(
      `KillBot-защита на ${url}. Используйте транспорт "playwright" ` +
        `(npm i -D playwright && npx playwright install chromium) или укажите страницу-донор без защиты.`
    );
    this.name = "KillBotDetectedError";
  }
}

function isKillBotPage(html: string): boolean {
  return /killbot|user verification|подтвердите, что вы человек|проверка браузера/i.test(
    html.slice(0, 4000)
  );
}

// HTTP-транспорт: простой fetch с браузерными заголовками
// С fallback на node:https если native fetch не работает (SSL/TLS на Windows)
export async function httpFetchHtml(url: string): Promise<string> {
  try {
    const response = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} для ${url}`);
    }
    const html = await response.text();
    if (isKillBotPage(html)) {
      throw new KillBotDetectedError(url);
    }
    return html;
  } catch (e) {
    // Fallback на node:https
    if (e instanceof KillBotDetectedError) throw e;
    const https = await import("node:https");
    return new Promise<string>((resolve, reject) => {
      const req = https.request(
        url,
        { headers: BROWSER_HEADERS, method: "GET" },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            // Редирект
            const newUrl = new URL(res.headers.location, url).toString();
            httpFetchHtml(newUrl).then(resolve).catch(reject);
            return;
          }
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode} для ${url}`));
            return;
          }
          let data = "";
          res.setEncoding("utf-8");
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            if (isKillBotPage(data)) {
              reject(new KillBotDetectedError(url));
              return;
            }
            resolve(data);
          });
        },
      );
      req.on("error", reject);
      req.end();
    });
  }
}

// ─── Shared Playwright browser pool ──────────────────────────────────────
// Один браузер на весь прогон парсера вместо запуска нового на каждый URL.
// Это ускоряет полный обход с 120+ категорий в ~10 раз.

let _browser: any = null;
let _context: any = null;
let _chromium: any = null;

const LAUNCH_ARGS = [
  "--disable-blink-features=AutomationControlled",
  "--no-sandbox",
  "--disable-dev-shm-usage",
];

async function getSharedBrowser(): Promise<{ browser: any; context: any }> {
  if (_browser && _context) return { browser: _browser, context: _context };

  try {
    const mod = await import("playwright");
    _chromium = mod.chromium;
  } catch {
    throw new Error(
      "Playwright не установлен. Выполните: npm i -D playwright && npx playwright install chromium"
    );
  }

  const headless = process.env.HEADLESS !== "0";
  _browser = await _chromium.launch({ headless, args: LAUNCH_ARGS });
  _context = await _browser.newContext({
    userAgent: BROWSER_HEADERS["User-Agent"],
    locale: "ru-RU",
    viewport: { width: 1440, height: 900 },
  });
  await _context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    // @ts-ignore
    window.chrome = window.chrome || { runtime: {} };
  });
  console.log("[transport] Playwright browser started (shared, headless=" + headless + ")");
  return { browser: _browser, context: _context };
}

export async function closeSharedBrowser(): Promise<void> {
  if (_browser) {
    await _browser.close();
    _browser = null;
    _context = null;
    console.log("[transport] Playwright browser closed");
  }
}

// Возвращает общий контекст браузера (для image downloader)
export async function getSharedContext(): Promise<any> {
  const { context } = await getSharedBrowser();
  return context;
}

// Playwright-транспорт с общим браузером: одна страница на запрос
export async function playwrightFetchHtml(url: string): Promise<string> {
  const { context } = await getSharedBrowser();
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    // Даём KillBot и динамическому контенту время (до 10 с)
    let html = "";
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(2500);
      html = await page.content();
      if (!isKillBotPage(html) && (html.includes("catalog-item") || html.includes("product"))) {
        return html;
      }
    }
    if (!isKillBotPage(html)) return html;
    throw new KillBotDetectedError(url);
  } finally {
    await page.close();
  }
}

export async function fetchHtml(url: string, transport: "http" | "playwright" = "http") {
  if (transport === "playwright") {
    return playwrightFetchHtml(url);
  }
  try {
    return await httpFetchHtml(url);
  } catch (error) {
    if (error instanceof KillBotDetectedError) {
      try {
        return await playwrightFetchHtml(url);
      } catch (fallbackError) {
        throw new Error(
          `${error.message}. Фолбэк Playwright не сработал: ${String(fallbackError)}`,
          { cause: error }
        );
      }
    }
    throw error;
  }
}

// Скачивание бинарных файлов (фото) с браузерными заголовками
export async function fetchBinary(url: string): Promise<Buffer> {
  const response = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} для изображения ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}
