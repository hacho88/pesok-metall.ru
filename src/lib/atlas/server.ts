import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ATLAS_ZONE_COOKIE, ATLAS_PREVIEW_COOKIE } from "./constants";
import { verifyPreviewToken } from "./preview";

/** Получить список геозон (для шапки/футера) */
export async function getAtlasZones(): Promise<{ slug: string; name: string }[]> {
  try {
    const zones = await prisma.geoZone.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    });
    return zones;
  } catch {
    return [];
  }
}

/** Получить текущую геозону из cookie */
export async function getCurrentZone(): Promise<{ slug: string; name: string; id: string } | null> {
  const cookieStore = await cookies();
  const slug = cookieStore.get(ATLAS_ZONE_COOKIE)?.value;
  if (!slug) return null;
  try {
    const zone = await prisma.geoZone.findUnique({ where: { slug }, select: { id: true, slug: true, name: true } });
    return zone;
  } catch {
    return null;
  }
}

/** Проверить, активен ли режим предпросмотра (cookie atlas_preview) */
export async function isPreviewMode(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ATLAS_PREVIEW_COOKIE)?.value;
  return verifyPreviewToken(token);
}
