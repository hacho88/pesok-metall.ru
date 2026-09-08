import { prisma } from "@/lib/prisma";

export type PublicSettings = {
  siteName: string;
  logoUrl: string | null;
  phone: string;
  email: string;
  workHours: string;
  footerText: string;
  whatsappUrl: string | null;
  telegramUrl: string | null;
  vkUrl: string | null;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  regionLabel: string;
};

export async function getPublicSettings(): Promise<PublicSettings> {
  let s = await prisma.shopSettings.findFirst();
  if (!s) {
    s = await prisma.shopSettings.create({ data: {} });
  }
  return {
    siteName: s.siteName,
    logoUrl: s.logoUrl,
    phone: s.phone,
    email: s.email,
    workHours: s.workHours,
    footerText: s.footerText,
    whatsappUrl: s.whatsappUrl,
    telegramUrl: s.telegramUrl,
    vkUrl: s.vkUrl,
    heroBadge: s.heroBadge,
    heroTitle: s.heroTitle,
    heroSubtitle: s.heroSubtitle,
    regionLabel: s.regionLabel,
  };
}

export type BannerData = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  position: string;
  sortOrder: number;
};

export async function getActiveBanners(position?: string): Promise<BannerData[]> {
  const where: any = {
    isActive: true,
    OR: [{ startAt: null }, { startAt: { lte: new Date() } }],
  };
  if (position) where.position = position;

  return prisma.banner.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      subtitle: true,
      imageUrl: true,
      linkUrl: true,
      linkLabel: true,
      position: true,
      sortOrder: true,
    },
  });
}
