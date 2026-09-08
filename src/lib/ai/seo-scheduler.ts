import { prisma } from "@/lib/prisma";
import { generateDailyArticles } from "./seo-generator";
import { generateGeoArticle } from "./geo-article-generator";
import { isDeepSeekConfigured } from "./deepseek";

/**
 * Встроенный планировщик SEO-статей: сам пишет статьи каждый день.
 * Первые 2 недели блога — 3 статьи/день, дальше — 5/день.
 * Проверка каждые 30 минут: если за сегодня написано меньше цели — дописывает разницу.
 * Если DeepSeek недоступен — повторяет не чаще раза в 2 часа.
 */

const CHECK_INTERVAL_MS = 30 * 60 * 1000; // проверка каждые 30 минут
const MIN_RETRY_GAP_MS = 2 * 60 * 60 * 1000; // при ошибках не чаще раза в 2 часа
const FIRST_CHECK_DELAY_MS = 60 * 1000; // первая проверка через минуту после старта
const RAMP_UP_DAYS = 14; // сколько дней держать щадящий темп 3/день
const TARGET_EARLY = 3;
const TARGET_NORMAL = 5;

let running = false;
let started = false;
let lastAttemptAt = 0;

function dailyTarget(daysSinceFirstPost: number): number {
  return daysSinceFirstPost < RAMP_UP_DAYS ? TARGET_EARLY : TARGET_NORMAL;
}

async function checkAndGenerate(): Promise<void> {
  if (running) return;
  const now = Date.now();
  if (now - lastAttemptAt < MIN_RETRY_GAP_MS) return;

  running = true;
  try {
    if (!isDeepSeekConfigured()) return;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayCount, firstPost] = await Promise.all([
      prisma.blogPost.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.blogPost.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
    ]);

    const daysSinceFirstPost = firstPost
      ? (now - firstPost.createdAt.getTime()) / 86_400_000
      : 0;
    const target = dailyTarget(daysSinceFirstPost);

    if (todayCount >= target) return;

    const need = target - todayCount;
    lastAttemptAt = now;
    console.log(`[seo-scheduler] цель ${target}/день, написано ${todayCount} — генерирую ${need}…`);

    // Первая статья дня — гео-статья для зоны с наименьшим числом статей
    let remaining = need;
    try {
      const zone = await prisma.geoZone.findFirst({
        orderBy: { blogPosts: { _count: "asc" } },
        select: { slug: true, name: true },
      });
      if (zone) {
        const geo = await generateGeoArticle(zone.slug);
        remaining -= 1;
        console.log(`[seo-scheduler] гео-статья: ${geo.title} (${zone.name})`);
      }
    } catch (geoError) {
      console.error("[seo-scheduler] гео-статья не удалась, пишу обычные:", geoError);
    }

    if (remaining > 0) {
      const result = await generateDailyArticles(remaining);
      console.log(
        `[seo-scheduler] готово: ${result.generated}, ошибок: ${result.errors.length}`
      );
    }
  } catch (error) {
    console.error("[seo-scheduler] ошибка генерации:", error);
  } finally {
    running = false;
  }
}

/** Запускается один раз при старте сервера (см. src/instrumentation.ts) */
export function startSeoScheduler(): void {
  if (started) return;
  started = true;
  // первая проверка через минуту после старта, далее каждые 30 минут
  setTimeout(() => void checkAndGenerate(), 60_000);
  setInterval(() => void checkAndGenerate(), CHECK_INTERVAL_MS);
  console.log("[seo-scheduler] запущен: автогенерация статей каждый день");
}
