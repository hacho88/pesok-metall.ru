import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/themes — список всех тем (встроенные + кастомные)
export async function GET() {
  try {
    const custom = await prisma.theme.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json({ themes: custom });
  } catch {
    return NextResponse.json({ themes: [] });
  }
}

// POST /api/themes — создать кастомную тему
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, palette } = body as { name?: string; palette?: Record<string, string | number> };

    if (!name?.trim() || !palette) {
      return NextResponse.json({ error: "Укажите название и палитру" }, { status: 400 });
    }

    const base = slugify(name.trim()) || "theme";
    let slug = `custom-${base}`;
    let n = 1;
    // Уникальный slug
    while (await prisma.theme.findUnique({ where: { slug } })) {
      n += 1;
      slug = `custom-${base}-${n}`;
    }

    const theme = await prisma.theme.create({
      data: { name: name.trim(), slug, isCustom: true, palette: palette as object },
    });
    return NextResponse.json({ theme });
  } catch {
    return NextResponse.json({ error: "Не удалось создать тему" }, { status: 500 });
  }
}

// PATCH /api/themes — обновить тему / применить к главной
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, palette, applyToHome } = body as {
      id?: string;
      name?: string;
      palette?: Record<string, string | number>;
      applyToHome?: boolean;
    };

    if (!id) return NextResponse.json({ error: "Нет id" }, { status: 400 });

    const theme = await prisma.theme.findUnique({ where: { id } });
    if (!theme) return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });

    const updated = await prisma.theme.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(palette ? { palette: palette as object } : {}),
      },
    });

    // Применить к главной странице
    if (applyToHome) {
      await prisma.pageConfig.upsert({
        where: { slug: "home" },
        update: { theme: theme.slug },
        create: { slug: "home", theme: theme.slug, blocks: [] },
      });
    }

    return NextResponse.json({ theme: updated });
  } catch {
    return NextResponse.json({ error: "Не удалось обновить тему" }, { status: 500 });
  }
}

// DELETE /api/themes — удалить кастомную тему
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Нет id" }, { status: 400 });

    const theme = await prisma.theme.findUnique({ where: { id } });
    if (!theme) return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    if (!theme.isCustom) {
      return NextResponse.json({ error: "Встроенную тему нельзя удалить" }, { status: 400 });
    }

    await prisma.theme.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не удалось удалить тему" }, { status: 500 });
  }
}
