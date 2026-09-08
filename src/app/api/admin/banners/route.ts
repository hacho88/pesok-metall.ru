import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET — список баннеров
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get("position");
  const activeOnly = searchParams.get("active") === "1";

  const where: any = {};
  if (position) where.position = position;
  if (activeOnly) {
    where.isActive = true;
    where.OR = [
      { startAt: null },
      { startAt: { lte: new Date() } },
    ];
  }

  const banners = await prisma.banner.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ banners });
}

// POST — создать баннер
export async function POST(request: NextRequest) {
  const body = await request.json();
  const banner = await prisma.banner.create({
    data: {
      title: body.title || "Новый баннер",
      subtitle: body.subtitle || null,
      imageUrl: body.imageUrl || null,
      linkUrl: body.linkUrl || null,
      linkLabel: body.linkLabel || null,
      position: body.position || "home_top",
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive !== false,
      startAt: body.startAt ? new Date(body.startAt) : null,
      endAt: body.endAt ? new Date(body.endAt) : null,
    },
  });
  return NextResponse.json({ success: true, banner });
}

// PUT — обновить баннер
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Нужен id" }, { status: 400 });

  const body = await request.json();
  const banner = await prisma.banner.update({
    where: { id },
    data: {
      title: body.title,
      subtitle: body.subtitle || null,
      imageUrl: body.imageUrl || null,
      linkUrl: body.linkUrl || null,
      linkLabel: body.linkLabel || null,
      position: body.position,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive,
      startAt: body.startAt ? new Date(body.startAt) : null,
      endAt: body.endAt ? new Date(body.endAt) : null,
    },
  });
  return NextResponse.json({ success: true, banner });
}

// DELETE — удалить баннер
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Нужен id" }, { status: 400 });

  await prisma.banner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
