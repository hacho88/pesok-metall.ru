import { NextRequest, NextResponse } from "next/server";
import { saveTenderAnalysis } from "@/lib/ai/tender-analyzer";

// POST /api/tenders — подать тендер на ИИ-анализ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenderNumber, title, customer, initialPrice, items } = body;

    if (!tenderNumber || !title || !customer || !initialPrice) {
      return NextResponse.json(
        { error: "tenderNumber, title, customer, initialPrice обязательны" },
        { status: 400 }
      );
    }

    const result = await saveTenderAnalysis({
      tenderNumber: String(tenderNumber),
      title: String(title),
      customer: String(customer),
      initialPrice: Number(initialPrice),
      items: Array.isArray(items) ? items : undefined,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
