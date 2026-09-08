import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/admin/banners/reorder — порядок баннеров { ids: string[] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: unknown = body.ids;
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
      return NextResponse.json({ error: "ids должен быть массивом ID" }, { status: 400 });
    }

    await prisma.$transaction(
      (ids as string[]).map((id, i) =>
        prisma.banner.update({ where: { id }, data: { sortOrder: i } })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось сохранить порядок", detail: String(error) },
      { status: 500 }
    );
  }
}
