import { prisma } from "@/lib/prisma";
import type { GeoZoneInfo } from "@/types/page-builder";

export { inZone, toZone } from "@/lib/geo-declensions";

export async function getGeoZone(slug: string): Promise<GeoZoneInfo | null> {
  try {
    const zone = await prisma.geoZone.findUnique({ where: { slug } });
    if (!zone) return null;
    return {
      id: zone.id,
      slug: zone.slug,
      name: zone.name,
      isRegion: zone.isRegion,
      deliveryTariffMultiplier: Number(zone.deliveryTariffMultiplier),
      seoTitle: zone.seoTitle,
      seoDescription: zone.seoDescription,
      aiDescription: zone.aiDescription,
    };
  } catch {
    return null;
  }
}
