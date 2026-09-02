import { NextRequest, NextResponse } from "next/server";
import { improveSectionTexts } from "@/lib/ai/atlas/layout-generator";
import type { Section } from "@/lib/atlas/config-schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { section } = await req.json() as { section: Section };
    if (!section) {
      return NextResponse.json({ error: "Section required" }, { status: 400 });
    }
    const improved = await improveSectionTexts(section);
    return NextResponse.json({ props: improved.props });
  } catch (err: any) {
    console.error("[atlas ai improve] error:", err);
    return NextResponse.json({ error: err.message || "AI improve failed" }, { status: 500 });
  }
}
