import { NextRequest, NextResponse } from "next/server";
import { runMetalParse } from "@/lib/parser";

// POST /api/parser/city-met — запуск парсинга каталога-донора
// Body: { url, maxPages?, transport?, downloadImages? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url: string | undefined = body.url;

    if (!url || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Параметр url обязателен (http/https)" },
        { status: 400 }
      );
    }

    const result = await runMetalParse({
      categoryUrl: url,
      maxPages: Number(body.maxPages ?? 20),
      transport: body.transport === "playwright" ? "playwright" : "http",
      downloadImages: body.downloadImages !== false,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
