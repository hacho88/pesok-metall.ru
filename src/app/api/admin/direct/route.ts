import { NextRequest, NextResponse } from "next/server";
import { getDirectData } from "@/lib/yandex-direct";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/direct?days=30
 * Кампании Яндекс.Директа + статистика за период.
 */
export async function GET(request: NextRequest) {
  const days = Math.min(90, Math.max(1, Number(request.nextUrl.searchParams.get("days")) || 30));

  try {
    const data = await getDirectData(days);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      {
        configured: true,
        campaigns: [],
        stats: [],
        totals: { impressions: 0, clicks: 0, cost: 0, ctr: 0, conversions: 0 },
        error: e instanceof Error ? e.message : "Ошибка API Директа",
      },
      { status: 200 }
    );
  }
}
