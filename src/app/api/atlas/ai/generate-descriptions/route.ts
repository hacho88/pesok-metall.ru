import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateProductDescription } from "@/lib/ai/atlas/product-description";
import { generateCategoryDescription } from "@/lib/ai/atlas/category-description";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope") || "products";
  const limit = Number(req.nextUrl.searchParams.get("limit") || "5");

  try {
    if (scope === "products") {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { description: null },
            { description: "" },
            { shortDescription: null },
            { shortDescription: "" },
          ],
        },
        include: { category: true, attributes: true },
        take: limit,
      });

      const results: { id: string; name: string; ok: boolean; error?: string }[] = [];
      for (const product of products) {
        try {
          const generated = await generateProductDescription(product);
          if (generated) {
            await prisma.product.update({
              where: { id: product.id },
              data: {
                description: generated.descriptionHtml,
                shortDescription: generated.shortDescription,
                seoTitle: generated.seoTitle,
                seoDescription: generated.seoDescription,
                keywords: generated.keywords,
              },
            });
            results.push({ id: product.id, name: product.name, ok: true });
          }
        } catch (e: any) {
          results.push({ id: product.id, name: product.name, ok: false, error: e.message });
        }
      }

      return NextResponse.json({
        scope: "products",
        processed: results.length,
        success: results.filter((r) => r.ok).length,
        failed: results.filter((r) => !r.ok).length,
        results,
      });
    }

    if (scope === "categories") {
      const categories = await prisma.category.findMany({
        where: {
          OR: [
            { description: null },
            { description: "" },
          ],
        },
        include: { _count: { select: { products: true } } },
        take: limit,
      });

      const results: { id: string; name: string; ok: boolean; error?: string }[] = [];
      for (const cat of categories) {
        try {
          // Get sample product names for context
          const samples = await prisma.product.findMany({
            where: { categoryId: cat.id },
            select: { name: true },
            take: 5,
          });
          const generated = await generateCategoryDescription(cat, samples.map((s) => s.name));
          if (generated) {
            await prisma.category.update({
              where: { id: cat.id },
              data: {
                description: generated.descriptionHtml,
                seoTitle: generated.seoTitle,
                seoDescription: generated.seoDescription,
              },
            });
            results.push({ id: cat.id, name: cat.name, ok: true });
          }
        } catch (e: any) {
          results.push({ id: cat.id, name: cat.name, ok: false, error: e.message });
        }
      }

      return NextResponse.json({
        scope: "categories",
        processed: results.length,
        success: results.filter((r) => r.ok).length,
        failed: results.filter((r) => !r.ok).length,
        results,
      });
    }

    return NextResponse.json({ error: "Invalid scope. Use 'products' or 'categories'." }, { status: 400 });
  } catch (err: any) {
    console.error("[atlas ai generate-descriptions] error:", err);
    return NextResponse.json({ error: err.message || "Generation failed" }, { status: 500 });
  }
}
