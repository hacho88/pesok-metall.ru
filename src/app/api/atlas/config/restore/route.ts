import { NextRequest, NextResponse } from "next/server";
import { restoreVersion } from "@/lib/atlas/config-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { version } = await req.json();
    if (typeof version !== "number") {
      return NextResponse.json({ error: "version number required" }, { status: 400 });
    }
    const config = await restoreVersion(version);
    return NextResponse.json({ ok: true, config });
  } catch (err) {
    console.error("[atlas restore] error:", err);
    return NextResponse.json({ error: "Failed to restore version" }, { status: 500 });
  }
}
