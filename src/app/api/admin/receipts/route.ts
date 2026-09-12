import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const receipts = await prisma.receipt.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ receipts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.items?.length) {
    return NextResponse.json({ error: "Добавьте хотя бы одну позицию" }, { status: 400 });
  }

  const count = await prisma.receipt.count();
  const year = new Date().getFullYear();
  const number = `ЧК-${year}-${String(count + 1).padStart(4, "0")}`;

  const total = (body.items as { total: number }[]).reduce((sum, it) => sum + Number(it.total) || 0, 0);

  const receipt = await prisma.receipt.create({
    data: {
      number,
      customerName: body.customerName || null,
      customerPhone: body.customerPhone || null,
      customerInn: body.customerInn || null,
      items: body.items,
      total,
      note: body.note || null,
    },
  });

  return NextResponse.json({ receipt });
}
