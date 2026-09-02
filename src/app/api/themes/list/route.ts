import { NextResponse } from "next/server";
import { listBlueprints } from "@/lib/striker-blueprints";

export const dynamic = "force-dynamic";

/**
 * GET /api/themes/list — все активные темы-чертежи из БД (STRIKER.Engine).
 * Каждая тема отдаётся вместе с полным JSON-чертежом (layout, палитра,
 * типографика, конфигурация блоков) для мгновенной загрузки в редактор.
 */
export async function GET() {
  try {
    const blueprints = await listBlueprints();
    return NextResponse.json({
      themes: blueprints.map((bp) => ({
        id: bp.id,
        slug: bp.slug,
        name: bp.name,
        description: bp.description ?? "",
        updatedAt: bp.updatedAt,
        blueprint: bp,
      })),
    });
  } catch {
    return NextResponse.json({ themes: [] });
  }
}
