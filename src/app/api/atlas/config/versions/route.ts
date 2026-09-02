import { NextResponse } from "next/server";
import { getVersions } from "@/lib/atlas/config-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const versions = await getVersions();
  return NextResponse.json({ versions });
}
