import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET — список тарифов
export async function GET() {
  const tariffs = await prisma.deliveryTariff.findMany({
    orderBy: { basePrice: "asc" },
  });
  return NextResponse.json({ tariffs });
}

// POST — создать тариф
export async function POST(request: NextRequest) {
  const body = await request.json();
  const tariff = await prisma.deliveryTariff.create({
    data: {
      name: body.name,
      basePrice: parseFloat(body.basePrice) || 0,
      perKmPrice: parseFloat(body.perKmPrice) || 0,
      maxDistanceKm: body.maxDistanceKm ? parseFloat(body.maxDistanceKm) : null,
      isActive: body.isActive !== false,
    },
  });
  return NextResponse.json({ success: true, tariff });
}

// PUT — обновить тариф
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Нужен id" }, { status: 400 });

  const body = await request.json();
  const tariff = await prisma.deliveryTariff.update({
    where: { id },
    data: {
      name: body.name,
      basePrice: parseFloat(body.basePrice) ?? 0,
      perKmPrice: parseFloat(body.perKmPrice) ?? 0,
      maxDistanceKm: body.maxDistanceKm ? parseFloat(body.maxDistanceKm) : null,
      isActive: body.isActive,
    },
  });
  return NextResponse.json({ success: true, tariff });
}

// DELETE — удалить тариф
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Нужен id" }, { status: 400 });

  await prisma.deliveryTariff.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
