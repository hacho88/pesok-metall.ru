import { NextRequest, NextResponse } from "next/server";
import { signPreviewToken } from "@/lib/atlas/preview";
import { ATLAS_PREVIEW_COOKIE } from "@/lib/atlas/constants";

export const dynamic = "force-dynamic";

// GET /api/atlas/preview — set preview cookie and redirect to home
export async function GET(req: NextRequest) {
  const exit = req.nextUrl.searchParams.get("exit");
  const target = req.nextUrl.searchParams.get("target") || "/";

  if (exit) {
    const res = NextResponse.redirect(new URL(target, req.url));
    res.cookies.delete(ATLAS_PREVIEW_COOKIE);
    return res;
  }

  const token = signPreviewToken();
  const res = NextResponse.redirect(new URL(target, req.url));
  res.cookies.set(ATLAS_PREVIEW_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 2, // 2 hours
    path: "/",
  });
  return res;
}
