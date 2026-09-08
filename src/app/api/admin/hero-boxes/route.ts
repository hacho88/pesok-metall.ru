import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCatalogCache } from "@/lib/pm-catalog";

// GET /api/admin/hero-boxes — текущие товары в боксах на главной
export async function GET() {
  try {
    const boxes = await prisma.heroBox.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            priceRetailBase: true,
            unit: true,
            type: true,
            imageUrl: true,
            imageLocal: true,
            category: { select: { name: true } },
          },
        },
      },
    });
    return NextResponse.json({
      products: boxes.map((b, i) => ({
        boxId: b.id,
        sortOrder: b.sortOrder,
        ...b.product,
        priceRetailBase: b.product.priceRetailBase != null ? Number(b.product.priceRetailBase) : null,
        categoryName: b.product.category.name,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось загрузить боксы", detail: String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/admin/hero-boxes — заменить весь набор боксов { productIds: string[] }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const productIds: unknown = body.productIds;
    if (!Array.isArray(productIds) || productIds.some((id) => typeof id !== "string")) {
      return NextResponse.json({ error: "productIds должен быть массивом ID товаров" }, { status: 400 });
    }
    if (productIds.length > 16) {
      return NextResponse.json({ error: "Максимум 16 боксов" }, { status: 400 });
    }

    // Проверяем существование товаров
    const uniqueIds = [...new Set(productIds as string[])];
    const found = await prisma.product.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    if (found.length !== uniqueIds.length) {
      return NextResponse.json({ error: "Некоторые товары не найдены" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.heroBox.deleteMany(),
      ...uniqueIds.map((productId, i) =>
        prisma.heroBox.create({ data: { productId, sortOrder: i } })
      ),
    ]);

    invalidateCatalogCache();
    return NextResponse.json({ ok: true, count: uniqueIds.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось сохранить боксы", detail: String(error) },
      { status: 500 }
    );
  }
}
