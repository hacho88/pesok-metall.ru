import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        attributes: true,
        category: true,
      }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      priceRetailBase,
      stock,
      isOnOrder,
      categoryId,
      unit,
      weightKg,
      description,
      shortDescription,
      seoTitle,
      seoDescription,
      imageLocal,
      imageUrl,
    } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        priceRetailBase: priceRetailBase !== undefined ? Number(priceRetailBase) : undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        isOnOrder,
        categoryId,
        unit,
        weightKg: weightKg !== undefined ? Number(weightKg) : undefined,
        description,
        shortDescription,
        seoTitle,
        seoDescription,
        ...(imageLocal !== undefined ? { imageLocal: imageLocal || null } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
        // Ручная правка описания перекрывает ИИ-статус
        ...(description !== undefined ? { descriptionStatus: "manual" } : {}),
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product Update Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
