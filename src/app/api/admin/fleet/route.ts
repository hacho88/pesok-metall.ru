import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/fleet — автопарк
export async function GET() {
  try {
    const fleet = await prisma.fleetVehicle.findMany({ orderBy: { baseFare: "asc" } });
    return NextResponse.json({
      fleet: fleet.map((v) => ({
        id: v.id,
        name: v.name,
        maxWeightKg: v.maxWeightKg.toString(),
        maxLengthMeters: v.maxLengthMeters.toString(),
        baseFare: v.baseFare.toString(),
        perKmCharge: v.perKmCharge.toString(),
        isActive: v.isActive,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось загрузить автопарк", detail: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/admin/fleet — новая машина
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name: string | undefined = body.name;
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Поле name обязательно" }, { status: 400 });
    }
    const vehicle = await prisma.fleetVehicle.create({
      data: {
        name: name.trim(),
        maxWeightKg: Number(body.maxWeightKg ?? 1000),
        maxLengthMeters: Number(body.maxLengthMeters ?? 3),
        baseFare: Number(body.baseFare ?? 0),
        perKmCharge: Number(body.perKmCharge ?? 0),
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json({ ok: true, vehicle }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось создать машину", detail: String(error) },
      { status: 500 }
    );
  }
}
