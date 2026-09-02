import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products?category=armatura&geo=balashiha&limit=8
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");
    const geo = searchParams.get("geo");
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

    const geoZone = geo
      ? await prisma.geoZone.findUnique({ where: { slug: geo } })
      : null;

    const products = await prisma.product.findMany({
      where: category ? { category: { slug: category } } : undefined,
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
        p.type === "METALL"
          ? "за метр"
          : p.type === "BAG_30KG"
            ? "за мешок"
            : "за биг-бег",
      stock: p.stock,
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
