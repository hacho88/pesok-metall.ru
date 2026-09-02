import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateColdProposal } from "@/lib/ai/lead-scraper";

// GET /api/admin/map-leads — list map leads with filtering
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (status) where.proposalStatus = status;
  if (category) where.category = category;

  const [leads, total] = await Promise.all([
    prisma.mapLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.mapLead.count({ where }),
  ]);

  return NextResponse.json({ leads, total, page, limit });
}

// POST /api/admin/map-leads — generate proposal for a specific lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId } = body as { leadId: string };

    if (!leadId) {
      return NextResponse.json({ error: "leadId required" }, { status: 400 });
    }

    const result = await generateColdProposal(leadId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
