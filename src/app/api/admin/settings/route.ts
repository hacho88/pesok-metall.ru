import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/settings — получить настройки
export async function GET() {
  let settings = await prisma.shopSettings.findFirst();
  if (!settings) {
    settings = await prisma.shopSettings.create({ data: {} });
  }

  const tariffs = await prisma.deliveryTariff.findMany({
    orderBy: { basePrice: "asc" },
  });

  return NextResponse.json({ settings, tariffs });
}

// PUT /api/admin/settings — обновить настройки
export async function PUT(request: NextRequest) {
  const body = await request.json();

  let settings = await prisma.shopSettings.findFirst();
  if (!settings) {
    settings = await prisma.shopSettings.create({ data: {} });
  }

  const updated = await prisma.shopSettings.update({
    where: { id: settings.id },
    data: {
      warehouseAddress: body.warehouseAddress ?? settings.warehouseAddress,
      warehouseLat: body.warehouseLat ?? settings.warehouseLat,
      warehouseLng: body.warehouseLng ?? settings.warehouseLng,
      phone: body.phone ?? settings.phone,
      email: body.email ?? settings.email,
      workHours: body.workHours ?? settings.workHours,
      logoUrl: body.logoUrl !== undefined ? body.logoUrl || null : settings.logoUrl,
      siteName: body.siteName ?? settings.siteName,
      footerText: body.footerText ?? settings.footerText,
      heroBadge: body.heroBadge ?? settings.heroBadge,
      heroTitle: body.heroTitle ?? settings.heroTitle,
      heroSubtitle: body.heroSubtitle ?? settings.heroSubtitle,
      regionLabel: body.regionLabel ?? settings.regionLabel,
      whatsappUrl: body.whatsappUrl ?? settings.whatsappUrl,
      telegramUrl: body.telegramUrl ?? settings.telegramUrl,
      vkUrl: body.vkUrl ?? settings.vkUrl,
      messengerType: body.messengerType ?? settings.messengerType,
      messengerChatId: body.messengerChatId ?? settings.messengerChatId,
      messengerToken: body.messengerToken ?? settings.messengerToken,
      maxBotToken: body.maxBotToken ?? settings.maxBotToken,
      maxChatId: body.maxChatId ?? settings.maxChatId,
      notifyEmail: body.notifyEmail ?? settings.notifyEmail,
      smtpHost: body.smtpHost ?? settings.smtpHost,
      smtpPort: body.smtpPort !== undefined ? (body.smtpPort === null || body.smtpPort === "" ? null : Number(body.smtpPort) || null) : settings.smtpPort,
      smtpUser: body.smtpUser ?? settings.smtpUser,
      smtpPass: body.smtpPass ?? settings.smtpPass,
      smtpFrom: body.smtpFrom ?? settings.smtpFrom,
      invoiceEmail: body.invoiceEmail ?? settings.invoiceEmail,
    },
  });

  return NextResponse.json({ success: true, settings: updated });
}
