import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/tenders — список тендеров с пагинацией
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (status) where.aiStatus = status;

  const [tenders, total] = await Promise.all([
    prisma.tenderAnalysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tenderAnalysis.count({ where }),
  ]);

  return NextResponse.json({ tenders, total, page, limit });
}

// PATCH /api/admin/tenders — обновить статус/отчёт тендера вручную
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, aiStatus, aiReport } = body as {
      id: string;
      aiStatus?: "RECOMMENDED" | "REJECTED" | "HOLD";
      aiReport?: string;
    };

    if (!id) {
      return NextResponse.json({ error: "id обязателен" }, { status: 400 });
    }

    const tender = await prisma.tenderAnalysis.update({
      where: { id },
      data: {
        ...(aiStatus ? { aiStatus } : {}),
        ...(aiReport !== undefined ? { aiReport } : {}),
      },
    });

    return NextResponse.json(tender);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
