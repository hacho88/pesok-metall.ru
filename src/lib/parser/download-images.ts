import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { transliterate } from "./translit";
import { playwrightFetchHtml, getSharedContext } from "./transport";

const PUBLIC_PRODUCTS_DIR = path.join(process.cwd(), "public", "products");
const MAX_ATTEMPTS = 3;
const KILLBOT_RE = /killbot|подтвердите, что вы человек|проверка браузера/i;

function extensionFromUrl(url: string): string {
  const match = url.split("?")[0].match(/\.(jpe?g|png|webp|gif|avif)$/i);
  return match ? match[1].toLowerCase() : "jpg";
}

// Преобразует URL миниатюры в URL оригинала:
// /upload/resize_cache/iblock/c1f/110_110_1/xxx.jpg -> /upload/iblock/c1f/xxx.jpg
// /upload/resize_cache/upload/iblock/c1f/110_110_1/xxx.jpg -> /upload/iblock/c1f/xxx.jpg
// /upload/resize_cache/upload/iblock/c1f/xxx.jpg -> /upload/iblock/c1f/xxx.jpg
export function originalImageUrl(url: string): string {
  return url.replace(
    /\/upload\/resize_cache\/(?:upload\/)?(iblock\/[^/]+)(?:\/\d+_\d+_\d+)?\//,
    "/upload/$1/"
  );
}

export interface ImageDownloader {
  download(slug: string, imageUrl: string): Promise<string | null>;
  close(): Promise<void>;
}

// Создаёт загрузчик фото: использует общий браузер из transport.ts.
// Сначала проходит KillBot на city-met.ru (создавая общий контекст),
// затем скачивает фото через in-page fetch (cookies + Referer браузера).
export async function createImageDownloader(): Promise<ImageDownloader> {
  // Первый запрос — создаёт общий браузер и проходит KillBot
  await playwrightFetchHtml("https://city-met.ru/");
  const context = await getSharedContext();

  const page = await context.newPage();
  await page.goto("https://city-met.ru/", { waitUntil: "domcontentloaded", timeout: 60_000 });
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(2000);
    const html = await page.content();
    if (!KILLBOT_RE.test(html.slice(0, 4000))) break;
  }

  const download = async (slug: string, imageUrl: string): Promise<string | null> => {
    const url = originalImageUrl(imageUrl);
    const ext = extensionFromUrl(url);
    const fileName = `${transliterate(slug)}.${ext}`;
    const filePath = path.join(PUBLIC_PRODUCTS_DIR, fileName);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const result = await page.evaluate(async (u: string) => {
          const resp = await fetch(u);
          const buf = await resp.arrayBuffer();
          return {
            status: resp.status,
            type: resp.headers.get("content-type"),
            data: Array.from(new Uint8Array(buf)),
          };
        }, url);
        if (result.status !== 200 || !result.type?.startsWith("image/")) {
          throw new Error(`Не изображение: HTTP ${result.status}, ${result.type}`);
        }
        if (/no_photo/i.test(url) || result.data.length <= 1024) {
          return null;
        }
        await mkdir(PUBLIC_PRODUCTS_DIR, { recursive: true });
        await writeFile(filePath, Buffer.from(result.data));
        return `/products/${fileName}`;
      } catch (error) {
        if (attempt === MAX_ATTEMPTS) {
          console.warn(`  фото: ${url} — ${String(error).slice(0, 80)}`);
          return null;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    return null;
  };

  return { download, close: async () => { await page.close(); } };
}
