import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
          }
        },
        children: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      where: {
        parentId: null
      }
    });

    // Transform data to TreeItem format
    const treeData = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      type: "category" as const,
      children: [
        ...cat.children.map(sub => ({
          id: sub.id,
          name: sub.name,
          type: "category" as const,
          children: sub.products.map(p => ({
            id: p.id,
            name: p.name,
            type: "product" as const
          }))
        })),
        ...cat.products.map(p => ({
          id: p.id,
          name: p.name,
          type: "product" as const
        }))
      ]
    }));

    return NextResponse.json(treeData);
  } catch (error) {
    console.error("Catalog Tree Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
