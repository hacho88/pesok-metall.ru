import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id") || req.nextUrl.pathname.split("/").pop()!;
  const receipt = await prisma.receipt.findUnique({ where: { id } });
  if (!receipt) return NextResponse.json({ error: "Не найден" }, { status: 404 });
  return NextResponse.json({ receipt });
}

export async function PUT(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id") || req.nextUrl.pathname.split("/").pop()!;
  const body = await req.json();

  const total = (body.items as { total: number }[]).reduce((sum, it) => sum + Number(it.total) || 0, 0);

  const receipt = await prisma.receipt.update({
    where: { id },
    data: {
      customerName: body.customerName,
      customerPhone: body.customerPhone || null,
      customerInn: body.customerInn || null,
      items: body.items,
      total,
      note: body.note || null,
    },
  });

  return NextResponse.json({ receipt });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id") || req.nextUrl.pathname.split("/").pop()!;
  await prisma.receipt.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
