import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/banners?position=home_top — публичный API для сайта
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get("position");

  const where: any = {
    isActive: true,
    OR: [
      { startAt: null },
      { startAt: { lte: new Date() } },
    ],
  };
  if (position) where.position = position;

  const banners = await prisma.banner.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ banners });
}
