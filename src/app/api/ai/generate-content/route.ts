import { NextRequest, NextResponse } from "next/server";
import { runGeoContentPipeline } from "@/lib/ai/geo-content-pipeline";

// POST /api/ai/generate-content — запуск конвейера гео-уникализации для товара
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productId: string | undefined = body.productId;

    if (!productId) {
      return NextResponse.json(
        { error: "Параметр productId обязателен" },
        { status: 400 }
      );
    }

    const generated = await runGeoContentPipeline(productId);
    return NextResponse.json({ productId, generatedZones: generated });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
