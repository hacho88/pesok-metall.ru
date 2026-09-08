import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateProductDescriptionData } from "@/lib/ai/product-description";
import { isDeepSeekConfigured } from "@/lib/ai/deepseek";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// POST /api/admin/products/generate-all — пакетная ИИ-генерация описаний.
// За один вызов обрабатывает порцию товаров (?batch=4, макс 10) и возвращает прогресс.
// Фронт вызывает в цикле, пока done !== true. ?force=1 — перегенерировать даже готовые.
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batch = Math.min(Math.max(Number(searchParams.get("batch") ?? 4), 1), 10);
    const force = searchParams.get("force") === "1";

    if (!isDeepSeekConfigured()) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY не задан — добавьте ключ в .env и перезапустите сервер" },
        { status: 500 }
      );
    }

    // К генерации: без описания, с ошибкой прошлой генерации или вовсе не генерированные.
    // "generated" и "manual" не трогаем (force=1 перегенерирует всё).
    const where = force
      ? {}
      : {
          OR: [
            { descriptionStatus: { in: ["none", "failed"] } },
            { description: null },
            { description: "" },
          ],
        };

    const totalPending = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      select: { id: true },
      take: batch,
      orderBy: { name: "asc" },
    });

    let processed = 0;
    let failed = 0;
    for (const p of products) {
      try {
        await generateProductDescriptionData(p.id);
        processed += 1;
      } catch {
        failed += 1;
      }
    }

    const remaining = await prisma.product.count({ where });
    return NextResponse.json({
      processed,
      failed,
      remaining,
      totalPending,
      done: remaining === 0,
    });
  } catch (error) {
    console.error("[generate-all] error:", error);
    return NextResponse.json(
      { error: "Не удалось запустить пакетную генерацию" },
      { status: 500 }
    );
  }
}
