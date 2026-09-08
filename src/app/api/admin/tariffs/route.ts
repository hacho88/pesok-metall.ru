import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/tariffs — список тарифов
export async function GET() {
  const tariffs = await prisma.deliveryTariff.findMany({
    orderBy: { minDistanceKm: "asc" },
  });
  return NextResponse.json({ tariffs });
}

// POST — создать тариф
export async function POST(request: NextRequest) {
  const body = await request.json();
  const tariff = await prisma.deliveryTariff.create({
    data: {
      name: body.name || "Новый тариф",
      basePrice: Number(body.basePrice) || 0,
      perKmPrice: Number(body.perKmPrice) || 0,
      minDistanceKm: body.minDistanceKm === null || body.minDistanceKm === "" ? null : Number(body.minDistanceKm),
      maxDistanceKm: body.maxDistanceKm === null || body.maxDistanceKm === "" || body.maxDistanceKm === undefined ? null : Number(body.maxDistanceKm) || null,
      freeFromSum: body.freeFromSum ? Number(body.freeFromSum) : null,
      isActive: body.isActive !== false,
    },
  });
  return NextResponse.json({ success: true, tariff });
}

// PUT — обновить тариф (?id=)
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Нужен id" }, { status: 400 });

  const body = await request.json();
  const tariff = await prisma.deliveryTariff.update({
    where: { id },
    data: {
      name: body.name,
      basePrice: Number(body.basePrice) || 0,
      perKmPrice: Number(body.perKmPrice) || 0,
      minDistanceKm: body.minDistanceKm === null || body.minDistanceKm === "" || body.minDistanceKm === undefined ? null : Number(body.minDistanceKm) || null,
      maxDistanceKm: body.maxDistanceKm === null || body.maxDistanceKm === "" || body.maxDistanceKm === undefined ? null : Number(body.maxDistanceKm) || null,
      freeFromSum: body.freeFromSum === null || body.freeFromSum === "" || body.freeFromSum === undefined ? null : Number(body.freeFromSum) || null,
      isActive: body.isActive,
    },
  });
  return NextResponse.json({ success: true, tariff });
}

// DELETE — удалить тариф (?id=)
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Нужен id" }, { status: 400 });

  await prisma.deliveryTariff.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
