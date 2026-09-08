import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/categories/tree — дерево категорий сгруппированное по секциям
export async function GET() {
  try {
    const sections = await prisma.catalogSection.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        categories: {
          where: { parentId: null },
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { products: true } },
            children: {
              orderBy: { sortOrder: "asc" },
              include: { _count: { select: { products: true } } },
            },
          },
        },
      },
    });

    const serialize = (nodes: any[]): any[] =>
      nodes.map((n) => ({
        id: n.id,
        name: n.name,
        slug: n.slug,
        parentId: n.parentId ?? null,
        totalProductCount:
          (n._count?.products ?? 0) +
          (n.children ?? []).reduce((sum: number, c: any) => sum + (c._count?.products ?? 0), 0),
        sectionId: n.sectionId ?? null,
        sectionName: null,
        sectionSlug: null,
        sortOrder: n.sortOrder ?? 0,
        children: serialize(n.children ?? []),
      }));

    return NextResponse.json({
      sections: sections.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        sortOrder: s.sortOrder,
        isVisible: s.isVisible,
        categories: serialize(s.categories),
      })),
      // Also flat tree for backward compatibility
      tree: serialize(sections.flatMap((s) => s.categories)),
    });
  } catch (e) {
    return NextResponse.json({ sections: [], tree: [], error: "Failed to load categories" }, { status: 500 });
  }
}

