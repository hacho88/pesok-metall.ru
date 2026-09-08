import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/themes/override?slug=modern-blue — получить override встроенной темы
export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Нет slug" }, { status: 400 });
  try {
    const theme = await prisma.theme.findUnique({ where: { slug } });
    return NextResponse.json({ theme });
  } catch {
    return NextResponse.json({ theme: null });
  }
}

// PUT /api/themes/override — сохранить override встроенной темы
// Body: { slug, palette }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, palette } = body as { slug?: string; palette?: Record<string, string | number> };
    if (!slug || !palette) return NextResponse.json({ error: "Нет slug или palette" }, { status: 400 });

    const theme = await prisma.theme.upsert({
      where: { slug },
      update: { palette: palette as object },
      create: { slug, name: slug, isCustom: false, palette: palette as object },
    });
    return NextResponse.json({ theme });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Не удалось сохранить" }, { status: 500 });
  }
}

// DELETE /api/themes/override?slug=modern-blue — сбросить override (вернуть дефолт)
export async function DELETE(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Нет slug" }, { status: 400 });
  try {
    const theme = await prisma.theme.findUnique({ where: { slug } });
    if (!theme) return NextResponse.json({ ok: true });
    if (theme.isCustom) {
      return NextResponse.json({ error: "Это кастомная тема, нельзя сбросить" }, { status: 400 });
    }
    await prisma.theme.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Не удалось сбросить" }, { status: 500 });
  }
}
