import { prisma } from "../../src/lib/prisma";

(async () => {
  await prisma.pageConfig.upsert({
    where: { slug: "home" },
    update: { theme: "flat" },
    create: { slug: "home", theme: "flat", blocks: [] },
  });
  console.log("Theme set to flat");
  await prisma.$disconnect();
})();
