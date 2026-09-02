import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Переносит блок ModernSeoBlog в самый конец конфига home
async function main() {
  const home = await prisma.pageConfig.findUnique({ where: { slug: "home" } });
  if (!home) {
    console.log("home config not found");
    return;
  }

  const blocks = (home.blocks as unknown as Array<Record<string, unknown>>) ?? [];
  const blogBlocks = blocks.filter((b) => b.type === "ModernSeoBlog");
  const otherBlocks = blocks.filter((b) => b.type !== "ModernSeoBlog");

  const reordered = [...otherBlocks, ...blogBlocks];
  const changed = JSON.stringify(reordered) !== JSON.stringify(blocks);

  if (changed) {
    await prisma.pageConfig.update({
      where: { slug: "home" },
      data: { blocks: reordered as object },
    });
    console.log(`home reordered: ${blocks.length} -> ${reordered.length} blocks, blog moved to end`);
  } else {
    console.log("home already has blog at the end");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
