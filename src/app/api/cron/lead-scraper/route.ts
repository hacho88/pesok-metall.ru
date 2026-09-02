import { NextRequest, NextResponse } from "next/server";
import { scrapeMapLeads, processAllPendingProposals } from "@/lib/ai/lead-scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// GET /api/cron/lead-scraper
// Scrapes map platforms for construction leads and generates cold proposals
// Example cron: 0 6 * * * curl -H "x-cron-secret: <CRON_SECRET>" https://pesok-metall.ru/api/cron/lead-scraper
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Неверный CRON_SECRET" }, { status: 401 });
  }

  try {
    const scrapeResult = await scrapeMapLeads();
    const proposalResult = await processAllPendingProposals();

    return NextResponse.json({
      scrape: scrapeResult,
      proposals: proposalResult,
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
