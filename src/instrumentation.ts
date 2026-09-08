/**
 * Next.js instrumentation hook — выполняется один раз при старте сервера.
 * Запускает встроенный планировщик автогенерации SEO-статей.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startSeoScheduler } = await import("@/lib/ai/seo-scheduler");
    startSeoScheduler();
  }
}
