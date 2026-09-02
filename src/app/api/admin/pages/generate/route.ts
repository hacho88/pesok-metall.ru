import { NextRequest, NextResponse } from "next/server";
import { generatePageConfig } from "@/lib/ai/generate-page-config";
import { DeepSeekNotConfiguredError } from "@/lib/ai/deepseek";
import type { ThemePreset } from "@/types/page-builder";

// POST /api/admin/pages/generate — генерация конфига страницы из текстового промпта
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt: string | undefined = body.prompt;
    const slug: string | undefined = body.slug;
    const theme: ThemePreset | undefined = body.theme;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Параметр prompt обязателен" },
        { status: 400 }
      );
    }
    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { error: "Параметр slug обязателен" },
        { status: 400 }
      );
    }

    const config = await generatePageConfig(prompt.trim(), slug.trim(), theme);
    return NextResponse.json({ config });
  } catch (error) {
    if (error instanceof DeepSeekNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
