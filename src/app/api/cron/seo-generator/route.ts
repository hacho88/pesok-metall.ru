import { NextRequest, NextResponse } from "next/server";
import { generateDailyArticles } from "@/lib/ai/seo-generator";

export const dynamic = "force-dynamic";
export const maxDuration = 900; // 5 статей × ~90 сек генерации + запас

// Cron job endpoint: /api/cron/seo-generator
// Daily generation of long-read articles (5000+ chars each). Default 5/day — safe pace for SEO.
// Example cron: 0 2 * * * curl -H "x-cron-secret: <CRON_SECRET>" https://pesok-metall.ru/api/cron/seo-generator
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Неверный CRON_SECRET" }, { status: 401 });
  }

  try {
    const countParam = new URL(request.url).searchParams.get("count");
    // Безопасный темп: 5 статей/день. Больше — риск фильтра Google «scaled content abuse» на молодом сайте.
    const count = countParam ? Math.min(Math.max(Number(countParam), 1), 20) : 5;

    const result = await generateDailyArticles(count);

    return NextResponse.json({
      success: true,
      generated: result.generated,
      errors: result.errors.length,
      totalChars: result.results.reduce((sum, r) => sum + r.chars, 0),
      articles: result.results.map((r) => ({
        id: r.id,
        title: r.title,
        chars: r.chars,
      })),
      errorDetails: result.errors,
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron SEO Generator Error:", error);
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}
