import { NextRequest, NextResponse } from "next/server";
import { getActiveBlueprint, getBlueprintBySlug } from "@/lib/striker-blueprints";

export const dynamic = "force-dynamic";

// GET /api/striker-blueprints — активный чертёж (витрина)
// GET /api/striker-blueprints?slug=striker:city-brutal — конкретный чертёж
export async function GET(req: NextRequest) {
  try {
    const slug = new URL(req.url).searchParams.get("slug");
    const blueprint = slug ? await getBlueprintBySlug(slug) : await getActiveBlueprint();
    return NextResponse.json({ blueprint });
  } catch {
    return NextResponse.json({ blueprint: null });
  }
}
