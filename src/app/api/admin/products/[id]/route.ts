import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCatalogCache } from "@/lib/pm-catalog";
import { ProductType } from "@prisma/client";

const PRODUCT_TYPES = Object.values(ProductType);

// GET /api/admin/products/[id] — товар с атрибутами
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, attributes: true, competitorPrices: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось загрузить товар", detail: String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] — обновление товара
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (typeof body.categoryId === "string" && body.categoryId) data.categoryId = body.categoryId;
    if (PRODUCT_TYPES.includes(body.type as ProductType)) data.type = body.type;
    if (body.priceCost !== undefined) data.priceCost = body.priceCost ? Number(body.priceCost) : null;
    if (body.priceRetailBase !== undefined)
      data.priceRetailBase = body.priceRetailBase ? Number(body.priceRetailBase) : null;
    if (typeof body.isOnOrder === "boolean") data.isOnOrder = body.isOnOrder;
    if (body.weightKg !== undefined) data.weightKg = Number(body.weightKg ?? 1);
    if (body.density !== undefined) data.density = body.density ? Number(body.density) : null;
    if (body.stock !== undefined) data.stock = Number(body.stock ?? 0);
    if (body.unit !== undefined) data.unit = body.unit || null;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl || null;
    if (body.imageLocal !== undefined) data.imageLocal = body.imageLocal || null;

    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({ where: { id }, data });
      if (Array.isArray(body.attributes)) {
        await tx.productAttribute.deleteMany({ where: { productId: id } });
        const attrs = body.attributes
          .filter((a: { key?: string; value?: string }) => a?.key?.trim() && a?.value?.trim())
          .map((a: { key: string; value: string }) => ({
            productId: id,
            key: a.key.trim(),
            value: a.value.trim(),
          }));
        if (attrs.length > 0) await tx.productAttribute.createMany({ data: attrs });
      }
      return updated;
    });

    invalidateCatalogCache();
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось обновить товар", detail: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    invalidateCatalogCache();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось удалить товар", detail: String(error) },
      { status: 500 }
    );
  }
}
