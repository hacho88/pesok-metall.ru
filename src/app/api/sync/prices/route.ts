import { NextRequest, NextResponse } from "next/server";
import { syncPrices } from "@/lib/parser/sync";

// GET /api/sync/prices — синхронизация цен с city-met.ru (защищена CRON_SECRET)
// Пример cron: 0 */6 * * * curl -H "x-cron-secret: <CRON_SECRET>" https://pesok-metall.ru/api/sync/prices
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Неверный CRON_SECRET" }, { status: 401 });
  }

  try {
    const result = await syncPrices({ transport: "http" });
    return NextResponse.json({ ...result, ranAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { error: "Сбой синхронизации цен", detail: String(error) },
      { status: 500 }
    );
  }
}
