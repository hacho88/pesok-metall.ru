import { NextRequest, NextResponse } from "next/server";
import { resolveSections } from "@/lib/atlas/resolver";
import type { Section } from "@/lib/atlas/config-schema";

export const dynamic = "force-dynamic";

// POST /api/atlas/resolve — resolve sections data for editor preview
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sections, zoneSlug, categoryId, productId } = body as {
      sections: Section[];
      zoneSlug?: string | null;
      categoryId?: string | null;
      productId?: string | null;
    };
    const resolved = await resolveSections(sections, {
      zoneSlug: zoneSlug ?? null,
      categoryId: categoryId ?? null,
      productId: productId ?? null,
    });
    return NextResponse.json({ resolved });
  } catch (err) {
    console.error("[atlas resolve] error:", err);
    return NextResponse.json({ error: "Failed to resolve sections" }, { status: 500 });
  }
}
