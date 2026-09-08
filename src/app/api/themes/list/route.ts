import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** GET /api/themes/list — список доступных тем */
export async function GET() {
  return NextResponse.json({
    themes: [
      { id: "modern-blue", slug: "modern-blue", name: "Modern Blue", description: "Современная синяя тема", blueprint: null },
      { id: "atlas", slug: "atlas", name: "Atlas", description: "Базовая тема Atlas", blueprint: null },
    ],
  });
}
