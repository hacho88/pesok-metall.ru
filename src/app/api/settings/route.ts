import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/settings — публичные настройки магазина (для шапки/подвала)
export async function GET() {
  let settings = await prisma.shopSettings.findFirst();
  if (!settings) {
    settings = await prisma.shopSettings.create({ data: {} });
  }

  return NextResponse.json({
    siteName: settings.siteName,
    logoUrl: settings.logoUrl,
    phone: settings.phone,
    email: settings.email,
    workHours: settings.workHours,
    footerText: settings.footerText,
    whatsappUrl: settings.whatsappUrl,
    telegramUrl: settings.telegramUrl,
    vkUrl: settings.vkUrl,
  });
}
