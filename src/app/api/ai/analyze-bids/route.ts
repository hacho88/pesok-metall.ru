import { NextRequest, NextResponse } from "next/server";
import { runBidAnalysisCycle } from "@/lib/ai/bid-analyzer";

// POST /api/ai/analyze-bids — ИИ-биддер: пересчёт цен и ставок Директа
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productId: string | undefined = body.productId;

    const result = await runBidAnalysisCycle(productId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
