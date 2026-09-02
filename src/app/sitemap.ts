import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://pesok-metall.ru";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/metall`, changeFrequency: "daily", priority: 0.9 },
  ];

  // Категории каталога
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { products: { some: {} } },
        { children: { some: { products: { some: {} } } } },
      ],
    },
    select: { slug: true },
  });
  for (const c of categories) {
    entries.push({
      url: `${BASE_URL}/metall/${encodeURIComponent(c.slug)}`,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  // Гео-страницы районов
  const zones = await prisma.geoZone.findMany({ select: { slug: true } });
  for (const z of zones) {
    entries.push({
      url: `${BASE_URL}/geo/${z.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return entries;
}
