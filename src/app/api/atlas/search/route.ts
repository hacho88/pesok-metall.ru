import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toAtlasProduct } from "@/lib/atlas/catalog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const limit = Math.min(20, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 6)));

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { keywords: { has: q.toLowerCase() } },
      ],
    },
    include: { category: true, attributes: true },
    take: limit,
    orderBy: { viewsCount: "desc" },
  });

  return NextResponse.json({
    products: products.map((p) => {
      const ap = toAtlasProduct(p);
      return {
        id: ap.id,
        name: ap.name,
        slug: ap.slug,
        price: ap.price,
        imageLocal: ap.imageLocal,
        categoryName: ap.categoryName,
      };
    }),
  });
}
