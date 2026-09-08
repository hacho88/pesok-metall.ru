import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/fleet — активный автопарк для калькулятора доставки
export async function GET() {
  try {
    const fleet = await prisma.fleetVehicle.findMany({
      where: { isActive: true },
      orderBy: { maxWeightKg: "asc" },
    });
    return NextResponse.json({
      fleet: fleet.map((v) => ({
        id: v.id,
        name: v.name,
        maxWeightKg: Number(v.maxWeightKg),
        baseFare: Number(v.baseFare),
        perKmCharge: Number(v.perKmCharge),
        imageUrl: v.imageUrl,
        plateNumber: v.plateNumber,
      })),
    });
  } catch {
    return NextResponse.json({ fleet: [] });
  }
}
