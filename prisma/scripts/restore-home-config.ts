import { PrismaClient } from "@prisma/client";
import { DEFAULT_PAGE_CONFIG } from "../../src/lib/page-config";

const prisma = new PrismaClient();

// Восстанавливает полный конфиг home из DEFAULT_PAGE_CONFIG (статьи в самом низу)
async function main() {
  const existing = await prisma.pageConfig.findUnique({ where: { slug: "home" } });
  const oldCount = existing ? (existing.blocks as unknown[]).length : 0;

  await prisma.pageConfig.upsert({
    where: { slug: "home" },
    update: { blocks: DEFAULT_PAGE_CONFIG.blocks as object },
    create: {
      slug: "home",
      theme: existing?.theme ?? "industrial-orange",
      blocks: DEFAULT_PAGE_CONFIG.blocks as object,
    },
  });

  console.log(`home config restored: ${oldCount} -> ${DEFAULT_PAGE_CONFIG.blocks.length} blocks`);
  console.log("Order:", DEFAULT_PAGE_CONFIG.blocks.map((b) => b.type).join(" -> "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
