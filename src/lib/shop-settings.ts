import { prisma } from "@/lib/prisma";
import { normalizeHeroConfig, type HeroConfig } from "@/components/hero-builder/types";

export type StatItem = { value: string; label: string };

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
  statsItems: StatItem[];
  warehouseAddress: string;
  warehouseLat: number;
  warehouseLng: number;
};

const DEFAULT_STATS: StatItem[] = [
  { value: "25 лет", label: "на рынке стройматериалов" },
  { value: "12 000+", label: "заказов доставлено" },
  { value: "15 машин", label: "в собственном автопарке" },
  { value: "24/7", label: "приём заказов онлайн" },
];

function parseStats(raw: unknown): StatItem[] {
  if (!Array.isArray(raw)) return DEFAULT_STATS;
  const items = raw
    .filter((i): i is { value: unknown; label: unknown } => typeof i === "object" && i !== null)
    .map((i) => ({ value: String(i.value ?? ""), label: String(i.label ?? "") }))
    .filter((i) => i.value && i.label)
    .slice(0, 4);
  return items.length > 0 ? items : DEFAULT_STATS;
}

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
    statsItems: parseStats(s.statsItems),
    warehouseAddress: s.warehouseAddress,
    warehouseLat: s.warehouseLat,
    warehouseLng: s.warehouseLng,
  };
}

export async function getHeroConfig(): Promise<HeroConfig | null> {
  const s = await prisma.shopSettings.findFirst({
    select: { heroConfig: true },
  });
  if (!s?.heroConfig) return null;
  return normalizeHeroConfig(s.heroConfig);
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
