import { NextRequest, NextResponse } from "next/server";
import { getDraftConfig, getPublishedConfig, saveDraftConfig, getRawConfig } from "@/lib/atlas/config-store";
import { parseAtlasConfig } from "@/lib/atlas/config-schema";
import { getDefaultAtlasConfig } from "@/lib/atlas/config-defaults";

export const dynamic = "force-dynamic";

// GET /api/atlas/config — returns draft and published configs
export async function GET() {
  const raw = await getRawConfig();
  if (!raw) {
    return NextResponse.json({ draft: getDefaultAtlasConfig(), published: getDefaultAtlasConfig() });
  }
  const draft = parseAtlasConfig(raw.draft);
  const published = parseAtlasConfig(raw.published);
  return NextResponse.json({
    draft,
    published,
    draftUpdatedAt: raw.draftUpdatedAt,
    publishedAt: raw.publishedAt,
  });
}

// PUT /api/atlas/config — update draft config
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const config = parseAtlasConfig(body.config);
    await saveDraftConfig(config);
    return NextResponse.json({ ok: true, config });
  } catch (err) {
    console.error("[atlas config] PUT error:", err);
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
