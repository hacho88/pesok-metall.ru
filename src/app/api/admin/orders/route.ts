import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["NEW", "CONFIRMED", "PAID", "SHIPPED", "DONE", "CANCELLED"] as const;

// GET /api/admin/orders?status=NEW&since=<ISO>&limit=50
// since — вернуть только заказы созданные после этой даты (для polling новых)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const since = searchParams.get("since");
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);

  const where: any = {};
  if (status && VALID_STATUSES.includes(status as any)) {
    where.status = status;
  }
  if (since) {
    const d = new Date(since);
    if (!isNaN(d.getTime())) where.createdAt = { gt: d };
  }

  const [orders, total, newCount] = await Promise.all([
    prisma.atlasOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { items: true, geoZone: { select: { name: true } } },
    }),
    prisma.atlasOrder.count({ where: status ? { status: status as any } : {} }),
    prisma.atlasOrder.count({ where: { status: "NEW" } }),
  ]);

  return NextResponse.json({ orders, total, newCount });
}

// PATCH /api/admin/orders — { id, status }
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status } = body;

  if (!id || !status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Нужны id и валидный status" }, { status: 400 });
  }

  const order = await prisma.atlasOrder.update({
    where: { id },
    data: { status },
    include: { items: true },
  });

  return NextResponse.json({ success: true, order });
}
