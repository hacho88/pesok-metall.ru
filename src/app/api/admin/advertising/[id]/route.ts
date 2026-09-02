import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/advertising/[id] — ставка, лимит, активность
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.cpcBid !== undefined) data.cpcBid = Number(body.cpcBid);
    if (body.maxBidLimit !== undefined) data.maxBidLimit = Number(body.maxBidLimit);
    if (body.yandexDirectId !== undefined) data.yandexDirectId = body.yandexDirectId || null;
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (body.clicks !== undefined) data.clicks = Number(body.clicks ?? 0);
    if (body.conversions !== undefined) data.conversions = Number(body.conversions ?? 0);
    if (body.roi !== undefined) data.roi = body.roi ? Number(body.roi) : null;

    const campaign = await prisma.adCampaign.update({ where: { id }, data });
    return NextResponse.json({ ok: true, campaign });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось обновить кампанию", detail: String(error) },
      { status: 500 }
    );
  }
}
