import { NextRequest, NextResponse } from "next/server";
import { runGeoContentPipelineForAll } from "@/lib/ai/geo-content-pipeline";
import { runBidAnalysisCycle } from "@/lib/ai/bid-analyzer";

// GET /api/cron/autopilot — запуск автопилота (защищён CRON_SECRET)
// Пример cron: 0 */2 * * * curl -H "x-cron-secret: <CRON_SECRET>" https://pesok-metall.ru/api/cron/autopilot
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Неверный CRON_SECRET" }, { status: 401 });
  }

  try {
    const [geoGenerated, bidCycle] = await Promise.allSettled([
      runGeoContentPipelineForAll(),
      runBidAnalysisCycle(),
    ]);

    return NextResponse.json({
      geoPipeline:
        geoGenerated.status === "fulfilled"
          ? { generatedZones: geoGenerated.value }
          : { error: String(geoGenerated.reason) },
      bidCycle:
        bidCycle.status === "fulfilled"
          ? bidCycle.value
          : { error: String(bidCycle.reason) },
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Сбой автопилота", detail: String(error) },
      { status: 500 }
    );
  }
}
