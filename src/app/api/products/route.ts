import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// POST /api/products — создание товара из админки
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, categoryId, unit, priceRetailBase, weightKg, stock, type } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Название и категория обязательны" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Категория не найдена" }, { status: 400 });
    }

    // Уникальный slug из названия
    const base = slugify(String(name)) || `tovar-${Date.now()}`;
    let slug = base;
    let i = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${base}-${++i}`;
    }

    const hasPrice = priceRetailBase != null && priceRetailBase !== "";
    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        slug,
        categoryId,
        type: type ?? "METALL",
        unit: unit ?? "шт",
        priceRetailBase: hasPrice ? Number(priceRetailBase) : null,
        isOnOrder: !hasPrice,
        weightKg: weightKg != null && weightKg !== "" ? Number(weightKg) : 1,
        stock: stock != null && stock !== "" ? Number(stock) : 0,
      },
      include: { category: true, attributes: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product Create Error:", error);
    return NextResponse.json({ error: "Не удалось создать товар" }, { status: 500 });
  }
}

// GET /api/products?category=armatura&geo=balashiha&limit=8&q=арматура
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");
    const geo = searchParams.get("geo");
    const q = searchParams.get("q")?.trim();
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

    const geoZone = geo
      ? await prisma.geoZone.findUnique({ where: { slug: geo } })
      : null;

    const products = await prisma.product.findMany({
      where: {
        category: category ? { slug: category } : undefined,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { groupName: { contains: q, mode: "insensitive" } },
                { category: { name: { contains: q, mode: "insensitive" } } },
                { attributes: { some: { value: { contains: q, mode: "insensitive" } } } },
              ],
            }
          : {}),
      },
      take: limit,
      orderBy: [{ isOnOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: true,
        attributes: true,
        geoData: geoZone ? { where: { geoZoneId: geoZone.id } } : false,
      },
    });

    const payload = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      type: p.type,
      category: p.category.name,
      price:
        p.priceRetailBase != null
          ? Number(geoZone ? p.geoData[0]?.localPrice ?? p.priceRetailBase : p.priceRetailBase)
          : null,
      unit:
        p.type === "BAG_30KG"
          ? "мешок"
          : p.type === "BIG_BAG_1TON"
            ? "биг-бег"
            : (p.unit ?? "шт"),
      stock: p.stock,
      imageLocal: p.imageLocal,
      imageUrl: p.imageUrl,
      attributes: p.attributes.map((a) => ({ key: a.key, value: a.value })),
    }));
    return NextResponse.json({ products: payload, geoZone: geoZone?.name ?? null });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось загрузить товары", detail: String(error) },
      { status: 500 }
    );
  }
}
