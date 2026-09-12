import { prisma } from "@/lib/prisma";
import { PanelTop } from "lucide-react";
import { InterfaceManager } from "./InterfaceManager";

export const dynamic = "force-dynamic";

export default async function InterfacePage() {
  let settings = await prisma.shopSettings.findFirst();
  if (!settings) {
    settings = await prisma.shopSettings.create({ data: {} });
  }

  const banners = await prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const homeConfig = await prisma.pageConfig.findUnique({
    where: { slug: "home" },
  });

  const tariffs = await prisma.deliveryTariff.findMany({
    orderBy: { minDistanceKm: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <PanelTop className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-black tracking-tight">Интерфейс</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Логотип, баннеры, контакты и тексты главного экрана
          </p>
        </div>
      </div>

      <InterfaceManager
        settings={{
          siteName: settings.siteName,
          logoUrl: settings.logoUrl,
          phone: settings.phone,
          email: settings.email,
          workHours: settings.workHours,
          warehouseAddress: settings.warehouseAddress,
          footerText: settings.footerText,
          heroBadge: settings.heroBadge,
          heroTitle: settings.heroTitle,
          heroSubtitle: settings.heroSubtitle,
          regionLabel: settings.regionLabel,
          whatsappUrl: settings.whatsappUrl,
          telegramUrl: settings.telegramUrl,
          vkUrl: settings.vkUrl,
          maxBotToken: settings.maxBotToken,
          maxChatId: settings.maxChatId,
          notifyEmail: settings.notifyEmail,
          smtpHost: settings.smtpHost,
          smtpPort: settings.smtpPort?.toString() ?? "",
          smtpUser: settings.smtpUser,
          smtpPass: settings.smtpPass,
          smtpFrom: settings.smtpFrom,
          statsItems: Array.isArray(settings.statsItems) ? (settings.statsItems as { value: string; label: string }[]) : null,
        }}
        initialBanners={banners.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          imageUrl: b.imageUrl,
          linkUrl: b.linkUrl,
          linkLabel: b.linkLabel,
          isActive: b.isActive,
          sortOrder: b.sortOrder,
        }))}
        homeConfig={homeConfig}
        initialTariffs={tariffs.map((t) => ({
          id: t.id,
          name: t.name,
          basePrice: t.basePrice,
          perKmPrice: t.perKmPrice,
          minDistanceKm: t.minDistanceKm,
          maxDistanceKm: t.maxDistanceKm,
          freeFromSum: t.freeFromSum,
          isActive: t.isActive,
        }))}
        notify={{
          maxBotToken: settings.maxBotToken,
          maxChatId: settings.maxChatId,
          notifyEmail: settings.notifyEmail,
          smtpHost: settings.smtpHost,
          smtpPort: settings.smtpPort?.toString() ?? "",
          smtpUser: settings.smtpUser,
          smtpPass: settings.smtpPass,
          smtpFrom: settings.smtpFrom,
        }}
      />
    </div>
  );
}
