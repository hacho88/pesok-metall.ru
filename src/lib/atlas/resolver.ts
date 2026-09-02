import { prisma } from "@/lib/prisma";
import type { Section } from "./config-schema";
import {
  getAtlasCategoryTree,
  getBestsellers,
  getNewestProducts,
  getProductsByCategorySlug,
  getOnOrderProducts,
  getProductsByIds,
  toAtlasProduct,
  type AtlasProduct,
  type AtlasCategoryNode,
} from "./catalog";

export interface ResolverContext {
  zoneSlug?: string | null;
  categoryId?: string | null;
  productId?: string | null;
}

export interface ResolvedSectionData {
  [sectionId: string]: unknown;
}

/**
 * Резолвер: по массиву секций собирает данные одним проходом с Promise.all.
 * Используется витриной (server components) и /api/atlas/resolve (редактор).
 */
export async function resolveSections(sections: Section[], ctx: ResolverContext): Promise<ResolvedSectionData> {
  const tasks = sections.map((s) => resolveOne(s, ctx));
  const results = await Promise.all(tasks);
  const out: ResolvedSectionData = {};
  sections.forEach((s, i) => { out[s.id] = results[i]; });
  return out;
}

async function resolveOne(section: Section, ctx: ResolverContext): Promise<unknown> {
  try {
    switch (section.type) {
      case "CategoryTiles": {
        const tree = await getAtlasCategoryTree();
        const roots = tree.filter((n) => !n.parentId);
        return { categories: roots };
      }
      case "FeaturedProducts": {
        const props = section.props as any;
        const source = props?.source ?? "bestsellers";
        const limit = Math.min(24, Math.max(4, props?.limit ?? 8));
        let products: AtlasProduct[];
        if (source === "bestsellers") products = await getBestsellers(limit);
        else if (source === "newest") products = await getNewestProducts(limit);
        else if (source === "category" && props?.categorySlug) products = await getProductsByCategorySlug(props.categorySlug, limit);
        else if (source === "onOrder") products = await getOnOrderProducts(limit);
        else if (source === "manual" && Array.isArray(props?.productIds)) products = await getProductsByIds(props.productIds);
        else products = await getBestsellers(limit);
        return { products };
      }
      case "PriceBoard": {
        const props = section.props as any;
        const slugs: string[] = props?.slugs ?? [];
        if (slugs.length === 0) return { products: [] };
        const rows = await prisma.product.findMany({
          where: { slug: { in: slugs } },
          include: { category: true, attributes: true },
        });
        // Сохраняем порядок slugs
        const map = new Map(rows.map((r) => [r.slug, r]));
        const products = slugs.map((s) => map.get(s)).filter((r): r is NonNullable<typeof r> => !!r).map(toAtlasProduct);
        return { products };
      }
      case "DeliveryZones": {
        const zones = await prisma.geoZone.findMany({
          orderBy: { name: "asc" },
          select: { id: true, slug: true, name: true, isRegion: true, deliveryTariffMultiplier: true },
        });
        return { zones };
      }
      case "BlogTeasers": {
        const props = section.props as any;
        const limit = Math.min(12, Math.max(1, props?.limit ?? 3));
        const posts = await prisma.blogPost.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
          select: { id: true, title: true, slug: true, seoTitle: true, seoDescription: true, createdAt: true },
        });
        return { posts };
      }
      case "SimilarProducts": {
        if (!ctx.productId) return { products: [] };
        const product = await prisma.product.findUnique({
          where: { id: ctx.productId },
          include: { category: true, attributes: true },
        });
        if (!product) return { products: [] };
        const ap = toAtlasProduct(product);
        const { getSimilarProducts } = await import("./catalog");
        const products = await getSimilarProducts(ap, (section.props as any)?.limit ?? 8);
        return { products };
      }
      case "ProductDescription": {
        if (!ctx.productId) return { product: null };
        const product = await prisma.product.findUnique({
          where: { id: ctx.productId },
          include: { category: true, attributes: true },
        });
        return { product: product ? toAtlasProduct(product) : null };
      }
      case "ProductSpecs": {
        if (!ctx.productId) return { product: null };
        const product = await prisma.product.findUnique({
          where: { id: ctx.productId },
          include: { category: true, attributes: true },
        });
        return { product: product ? toAtlasProduct(product) : null };
      }
      case "Calculator": {
        const fleet = await prisma.fleetVehicle.findMany({
          where: { isActive: true },
          orderBy: { baseFare: "asc" },
        });
        return { fleet };
      }
      case "Contacts": {
        // Данные из конфига, но зоны — из БД
        const zones = await prisma.geoZone.findMany({
          take: 34,
          select: { slug: true, name: true },
          orderBy: { name: "asc" },
        });
        return { zones };
      }
      default:
        return null;
    }
  } catch (err) {
    console.error(`[atlas resolver] section ${section.type} (${section.id}):`, err);
    return null;
  }
}
