import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/advertising — кампании с товарами
export async function GET() {
  try {
    const campaigns = await prisma.adCampaign.findMany({
      include: { product: { select: { id: true, name: true, slug: true, priceRetailBase: true } } },
      orderBy: { product: { name: "asc" } },
    });
    return NextResponse.json({
      campaigns: campaigns.map((c) => ({
        id: c.id,
        productId: c.productId,
        productName: c.product.name,
        productSlug: c.product.slug,
        priceRetailBase: c.product.priceRetailBase?.toString() ?? null,
        yandexDirectId: c.yandexDirectId,
        cpcBid: c.cpcBid.toString(),
        maxBidLimit: c.maxBidLimit.toString(),
        isActive: c.isActive,
        clicks: c.clicks,
        conversions: c.conversions,
        roi: c.roi?.toString() ?? null,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось загрузить кампании", detail: String(error) },
      { status: 500 }
    );
  }
}
