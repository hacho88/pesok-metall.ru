import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCatalogCache } from "@/lib/pm-catalog";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/g, "")
    .replace(/[ё]/g, "e")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 80);
}

// GET /api/admin/categories — дерево категорий с количеством товаров и секциями
export async function GET() {
  try {
    const [categories, sections] = await Promise.all([
      prisma.category.findMany({
        include: {
          _count: { select: { products: true } },
          section: { select: { id: true, name: true, slug: true } },
        },
        orderBy: [{ section: { sortOrder: "asc" } }, { sortOrder: "asc" }, { name: "asc" }],
      }),
      prisma.catalogSection.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);
    return NextResponse.json({
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parentId,
        productCount: c._count.products,
        sectionId: c.sectionId,
        sectionName: c.section?.name ?? null,
        sortOrder: c.sortOrder,
      })),
      sections: sections.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        sortOrder: s.sortOrder,
        isVisible: s.isVisible,
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
    const sectionId: string | undefined = body.sectionId;
    const sortOrder: number | undefined = body.sortOrder;
    const imageUrl: string | undefined = body.imageUrl;

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
      data: {
        name: name.trim(),
        slug,
        parentId: parentId || null,
        sectionId: sectionId || null,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        imageUrl: imageUrl || null,
      },
    });
    invalidateCatalogCache();
    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось создать категорию", detail: String(error) },
      { status: 500 }
    );
  }
}
