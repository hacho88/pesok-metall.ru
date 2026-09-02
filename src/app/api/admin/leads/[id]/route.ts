import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { LeadStatus } from "@prisma/client";

const LEAD_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"];

// PATCH /api/admin/leads/[id] — смена статуса заявки
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status: LeadStatus | undefined = body.status;

    if (!status || !LEAD_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Некорректный статус" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось обновить заявку", detail: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/leads/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось удалить заявку", detail: String(error) },
      { status: 500 }
    );
  }
}
