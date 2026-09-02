import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { title, subtitle, ctaLabel, imageUrl } = body;

    const homeConfig = await prisma.pageConfig.findUnique({
      where: { slug: "home" }
    });

    if (!homeConfig) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }

    const blocks = homeConfig.blocks as any[];
    const updatedBlocks = blocks.map(block => {
      if (block.type === "MainHeroBanner") {
        return {
          ...block,
          title,
          subtitle,
          ctaLabel,
          imageUrl
        };
      }
      return block;
    });

    const updated = await prisma.pageConfig.update({
      where: { slug: "home" },
      data: {
        blocks: updatedBlocks
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Marketing Update Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
