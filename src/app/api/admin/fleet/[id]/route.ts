import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/fleet/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (body.maxWeightKg !== undefined) data.maxWeightKg = Number(body.maxWeightKg);
    if (body.maxLengthMeters !== undefined) data.maxLengthMeters = Number(body.maxLengthMeters);
    if (body.baseFare !== undefined) data.baseFare = Number(body.baseFare);
    if (body.perKmCharge !== undefined) data.perKmCharge = Number(body.perKmCharge);
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
    if (body.plateNumber !== undefined) data.plateNumber = body.plateNumber;
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;

    const vehicle = await prisma.fleetVehicle.update({ where: { id }, data });
    return NextResponse.json({ ok: true, vehicle });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось обновить машину", detail: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/fleet/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.fleetVehicle.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось удалить машину", detail: String(error) },
      { status: 500 }
    );
  }
}
