import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/pages/[slug] — полный конфиг страницы для редактора
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const row = await prisma.pageConfig.findUnique({ where: { slug } });
    if (!row) {
      return NextResponse.json({ error: "Страница не найдена" }, { status: 404 });
    }
    return NextResponse.json({
      config: {
        slug: row.slug,
        theme: row.theme,
        blocks: Array.isArray(row.blocks) ? row.blocks : [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось загрузить страницу", detail: String(error) },
      { status: 500 }
    );
  }
}
