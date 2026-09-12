import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import { invalidateCatalogCache } from "@/lib/pm-catalog";

const PRODUCT_TYPES = Object.values(ProductType);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/g, "")
    .replace(/[ё]/g, "e")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 80);
}

// GET /api/admin/products?search=&categoryId=&type=&limit=&offset= — список товаров
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const categoryId = searchParams.get("categoryId");
    const type = searchParams.get("type");
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);
    const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);

    const where = {
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(type && PRODUCT_TYPES.includes(type as ProductType)
        ? { type: type as ProductType }
        : {}),
    };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { category: true, attributes: true },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: offset,
      }),
    ]);

    return NextResponse.json({
      total,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        categoryId: p.categoryId,
        categoryName: p.category.name,
        priceRetailBase: p.priceRetailBase?.toString() ?? null,
        priceCost: p.priceCost?.toString() ?? null,
        isOnOrder: p.isOnOrder,
        weightKg: p.weightKg.toString(),
        unit: p.unit,
        stock: p.stock,
        imageUrl: p.imageUrl,
        imageLocal: p.imageLocal,
        attributes: p.attributes.map((a) => ({ key: a.key, value: a.value })),
        updatedAt: p.updatedAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось загрузить товары", detail: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/admin/products — создание товара
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name: string | undefined = body.name;
    const categoryId: string | undefined = body.categoryId;
    const type: ProductType | undefined = body.type;

    if (!name || !name.trim() || !categoryId || !PRODUCT_TYPES.includes(type as ProductType)) {
      return NextResponse.json(
        { error: "Поля name, categoryId и type обязательны" },
        { status: 400 }
      );
    }

    const baseSlug = slugify(name) || `product-${Date.now()}`;
    let slug = baseSlug;
    let n = 2;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${n++}`;
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        categoryId,
        type: type as ProductType,
        priceCost: body.priceCost ? Number(body.priceCost) : null,
        priceRetailBase: body.priceRetailBase ? Number(body.priceRetailBase) : null,
        isOnOrder: Boolean(body.isOnOrder),
        weightKg: Number(body.weightKg ?? 1),
        density: body.density ? Number(body.density) : null,
        stock: Number(body.stock ?? 0),
        unit: body.unit || null,
        imageUrl: body.imageUrl || null,
        imageLocal: body.imageLocal || null,
        attributes: {
          create: Array.isArray(body.attributes)
            ? body.attributes
                .filter((a: { key?: string; value?: string }) => a?.key?.trim() && a?.value?.trim())
                .map((a: { key: string; value: string }) => ({ key: a.key.trim(), value: a.value.trim() }))
            : [],
        },
      },
      include: { attributes: true },
    });

    invalidateCatalogCache();
    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось создать товар", detail: String(error) },
      { status: 500 }
    );
  }
}
