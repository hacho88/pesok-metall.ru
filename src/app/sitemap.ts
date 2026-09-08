import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pesok-metall.ru";

export const revalidate = 3600; // кэш на час — 900+ URL не пересчитываем на каждый запрос

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, posts, geoZones] = await Promise.all([
    prisma.category.findMany({
      select: { slug: true, descriptionGeneratedAt: true },
    }),
    prisma.blogPost.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.geoZone.findMany({ select: { slug: true, aiDescription: true } }),
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/metall`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/pesok-scheben`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/kalkulyator-metalla`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/kalkulyator-dostavki`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/blog`, lastModified: posts[0]?.updatedAt ?? now, changeFrequency: "daily", priority: 0.7 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/shop/${encodeURIComponent(c.slug)}`,
    lastModified: c.descriptionGeneratedAt ?? now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const geoPages: MetadataRoute.Sitemap = geoZones.map((z) => ({
    url: `${SITE_URL}/geo/${encodeURIComponent(z.slug)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${encodeURIComponent(p.slug)}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...geoPages, ...categoryPages, ...blogPages];
}
