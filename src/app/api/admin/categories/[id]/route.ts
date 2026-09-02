import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/categories/[id] — переименование / перенос / смена slug
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const name: string | undefined = body.name;
    const parentId: string | null | undefined = body.parentId;
    const slug: string | undefined = body.slug;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Поле name обязательно" }, { status: 400 });
    }

    // Проверка на циклическую зависимость (категория не может быть своим родителем)
    if (parentId === id) {
      return NextResponse.json({ error: "Категория не может быть своим родителем" }, { status: 400 });
    }

    const data: Record<string, string | null> = { name: name.trim() };

    if (parentId !== undefined) {
      data.parentId = parentId || null;
    }

    if (slug && slug.trim()) {
      const existing = await prisma.category.findFirst({
        where: { slug: slug.trim(), NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug уже занят" }, { status: 400 });
      }
      data.slug = slug.trim();
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });
    return NextResponse.json({ ok: true, category });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось обновить категорию", detail: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] — удаление (товары переносятся в родительскую или остаются без категории не могут — блокируем при наличии товаров)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `В категории ${count} товаров — сначала перенесите или удалите их` },
        { status: 409 }
      );
    }
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось удалить категорию", detail: String(error) },
      { status: 500 }
    );
  }
}
