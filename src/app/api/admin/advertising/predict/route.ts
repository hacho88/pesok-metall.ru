import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runBudgetPrediction, runBidAnalysisCycle } from "@/lib/ai/bid-analyzer";

// GET /api/admin/advertising/predict — run AI budget prediction
export async function GET() {
  try {
    const prediction = await runBudgetPrediction();
    return NextResponse.json(prediction);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/admin/advertising/predict — run bid analysis cycle for all campaigns
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const productId = body?.productId as string | undefined;
    const result = await runBidAnalysisCycle(productId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
