import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { LeadStatus } from "@prisma/client";

const LEAD_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"];

// GET /api/admin/leads?status=NEW&source=chat — список заявок
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const source = searchParams.get("source");

    const leads = await prisma.lead.findMany({
      where: {
        ...(status && LEAD_STATUSES.includes(status as LeadStatus)
          ? { status: status as LeadStatus }
          : {}),
        ...(source ? { source } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({
      leads: leads.map((l) => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        email: l.email,
        source: l.source,
        message: l.message,
        status: l.status,
        createdAt: l.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось загрузить заявки", detail: String(error) },
      { status: 500 }
    );
  }
}
