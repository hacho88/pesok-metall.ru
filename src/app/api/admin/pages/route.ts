import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PageBlock, ThemePreset } from "@/types/page-builder";

// GET /api/admin/pages — список всех конфигов страниц
export async function GET() {
  try {
    const rows = await prisma.pageConfig.findMany({ orderBy: { slug: "asc" } });
    return NextResponse.json({
      pages: rows.map((r) => ({
        slug: r.slug,
        theme: r.theme,
        blockCount: Array.isArray(r.blocks) ? r.blocks.length : 0,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось загрузить страницы", detail: String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/admin/pages — сохранение конфига страницы
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const slug: string | undefined = body.slug;
    const theme: ThemePreset | undefined = body.theme;
    const blocks: PageBlock[] | undefined = body.blocks;

    if (!slug || !Array.isArray(blocks)) {
      return NextResponse.json(
        { error: "Параметры slug и blocks обязательны" },
        { status: 400 }
      );
    }

    const row = await prisma.pageConfig.upsert({
      where: { slug },
      update: {
        theme: theme ?? "industrial-orange",
        blocks: blocks as unknown as object,
      },
      create: {
        slug,
        theme: theme ?? "industrial-orange",
        blocks: blocks as unknown as object,
      },
    });

    return NextResponse.json({ ok: true, slug: row.slug });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось сохранить страницу", detail: String(error) },
      { status: 500 }
    );
  }
}
