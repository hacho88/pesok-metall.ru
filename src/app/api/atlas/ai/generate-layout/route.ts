import { NextRequest, NextResponse } from "next/server";
import { generateLayout } from "@/lib/ai/atlas/layout-generator";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }
    const result = await generateLayout(prompt);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[atlas ai generate-layout] error:", err);
    return NextResponse.json({ error: err.message || "AI generation failed" }, { status: 500 });
  }
}
