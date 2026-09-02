import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/page-config?slug=home — получить конфиг страницы
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") ?? "home";
    const config = await prisma.pageConfig.findUnique({ where: { slug } });
    return NextResponse.json({ config });
  } catch {
    return NextResponse.json({ config: null });
  }
}

// PATCH /api/page-config — обновить тему или блоки страницы
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, theme, blocks } = body as {
      slug?: string;
      theme?: string;
      blocks?: unknown[];
    };
    if (!slug) return NextResponse.json({ error: "Нет slug" }, { status: 400 });

    const existing = await prisma.pageConfig.findUnique({ where: { slug } });
    const config = existing
      ? await prisma.pageConfig.update({
          where: { slug },
          data: {
            ...(theme ? { theme } : {}),
            ...(blocks ? { blocks: blocks as object } : {}),
          },
        })
      : await prisma.pageConfig.create({
          data: { slug, theme: theme ?? "industrial-orange", blocks: (blocks ?? []) as object },
        });

    return NextResponse.json({ config });
  } catch {
    return NextResponse.json({ error: "Не удалось обновить конфиг" }, { status: 500 });
  }
}
