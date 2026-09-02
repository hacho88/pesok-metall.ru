import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/g, "")
    .replace(/[ё]/g, "e")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 80);
}

// GET /api/admin/categories — дерево категорий с количеством товаров
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parentId,
        productCount: c._count.products,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось загрузить категории", detail: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories — создание категории
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name: string | undefined = body.name;
    const parentId: string | undefined = body.parentId;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Поле name обязательно" }, { status: 400 });
    }

    const baseSlug = slugify(name) || `category-${Date.now()}`;
    let slug = baseSlug;
    let n = 2;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${n++}`;
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug, parentId: parentId || null },
    });
    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось создать категорию", detail: String(error) },
      { status: 500 }
    );
  }
}
