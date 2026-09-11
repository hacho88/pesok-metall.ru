import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/hero-config — сохранитьённый JSON-конфиг Hero-блока
export async function GET() {
  try {
    const s = await prisma.shopSettings.findFirst();
    return NextResponse.json({ config: s?.heroConfig ?? null });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось загрузить конфиг", detail: String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/admin/hero-config — сохранить JSON-конфиг Hero-блока
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.background || !Array.isArray(body?.elements)) {
      return NextResponse.json(
        { error: "Некорректный конфиг: нужны background и elements[]" },
        { status: 400 }
      );
    }
    const settings = await prisma.shopSettings.findFirst();
    if (!settings) {
      await prisma.shopSettings.create({ data: { heroConfig: body } });
    } else {
      await prisma.shopSettings.update({
        where: { id: settings.id },
        data: { heroConfig: body },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось сохранить конфиг", detail: String(error) },
      { status: 500 }
    );
  }
}
