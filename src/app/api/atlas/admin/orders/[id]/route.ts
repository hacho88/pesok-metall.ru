import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status) {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }

  const validStatuses = ["NEW", "CONFIRMED", "PAID", "SHIPPED", "DONE", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.atlasOrder.update({
    where: { id },
    data: { status: status as any },
  });

  return NextResponse.json({ ok: true, order: { id: order.id, status: order.status } });
}
