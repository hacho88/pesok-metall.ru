import { NextRequest, NextResponse } from "next/server";
import { generateStrikerBlueprint, editStrikerBlueprint } from "@/lib/ai/striker-generator";
import { DeepSeekNotConfiguredError } from "@/lib/ai/deepseek";
import type { ThemeConfigBlueprint } from "@/types/striker-engine";
import { createBlueprint } from "@/types/striker-engine";

export const dynamic = "force-dynamic";

// POST /api/striker-ai — { prompt, blueprint, mode } → { blueprint }
// mode: "generate" (создание с нуля) | "edit" (точечная модификация текущей темы)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ error: "Промпт пуст" }, { status: 400 });
    }

    const current = (body?.blueprint ?? createBlueprint()) as ThemeConfigBlueprint;
    const mode = body?.mode === "edit" ? "edit" : "generate";
    const blueprint =
      mode === "edit"
        ? await editStrikerBlueprint(prompt, current)
        : await generateStrikerBlueprint(prompt, current);
    return NextResponse.json({ blueprint });
  } catch (e) {
    if (e instanceof DeepSeekNotConfiguredError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка генерации чертежа" },
      { status: 500 }
    );
  }
}
