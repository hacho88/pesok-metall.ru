import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/geo-zones — все зоны с SEO-полями и счётчиками
export async function GET() {
  try {
    const zones = await prisma.geoZone.findMany({
      orderBy: [{ isRegion: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { products: true, blogPosts: true } },
      },
    });
    return NextResponse.json({
      zones: zones.map((z) => ({
        id: z.id,
        slug: z.slug,
        name: z.name,
        isRegion: z.isRegion,
        deliveryTariffMultiplier: Number(z.deliveryTariffMultiplier),
        seoTitle: z.seoTitle ?? null,
        seoDescription: z.seoDescription ?? null,
        aiDescription: z.aiDescription ?? null,
        productCount: z._count.products,
        postCount: z._count.blogPosts,
      })),
    });
  } catch {
    return NextResponse.json({ zones: [] });
  }
}

// PATCH /api/geo-zones?id=... — сохранить SEO-поля и коэффициент доставки
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Нет id" }, { status: 400 });

    const body = await req.json();
    const { seoTitle, seoDescription, aiDescription, deliveryTariffMultiplier } = body as {
      seoTitle?: string;
      seoDescription?: string;
      aiDescription?: string;
      deliveryTariffMultiplier?: number;
    };

    const zone = await prisma.geoZone.update({
      where: { id },
      data: {
        ...(seoTitle !== undefined ? { seoTitle } : {}),
        ...(seoDescription !== undefined ? { seoDescription } : {}),
        ...(aiDescription !== undefined ? { aiDescription } : {}),
        ...(deliveryTariffMultiplier !== undefined
          ? { deliveryTariffMultiplier }
          : {}),
      },
    });

    return NextResponse.json({ zone });
  } catch {
    return NextResponse.json({ error: "Не удалось сохранить" }, { status: 500 });
  }
}
