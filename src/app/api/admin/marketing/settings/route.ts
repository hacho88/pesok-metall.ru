import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // In a real app, these would be in a Settings table. 
    // For now, we'll use the AdCampaign of the first product or a mock.
    const campaign = await prisma.adCampaign.findFirst();
    return NextResponse.json({
      dailyBudget: 5000, // Mocked
      maxBid: Number(campaign?.maxBidLimit || 150),
      autopilot: campaign?.isActive || true,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { dailyBudget, maxBid, autopilot } = body;

    // Update all campaigns to follow the autopilot setting
    await prisma.adCampaign.updateMany({
      data: {
        maxBidLimit: maxBid,
        isActive: autopilot,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Marketing Settings Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
