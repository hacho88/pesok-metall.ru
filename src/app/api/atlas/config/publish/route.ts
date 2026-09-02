import { NextRequest, NextResponse } from "next/server";
import { publishConfig } from "@/lib/atlas/config-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const note = body?.note as string | undefined;
    const result = await publishConfig(note);
    return NextResponse.json({ ok: true, version: result.version });
  } catch (err) {
    console.error("[atlas publish] error:", err);
    return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
  }
}
