import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const home = await prisma.pageConfig.findUnique({ where: { slug: "home" } });
  if (!home) {
    console.log("home config not found");
    return;
  }
  await prisma.pageConfig.upsert({
    where: { slug: "home-v3" },
    update: {
      theme: "vinsovkhoz",
      blocks: home.blocks as object,
    },
    create: {
      slug: "home-v3",
      theme: "vinsovkhoz",
      blocks: home.blocks as object,
    },
  });
  console.log("home-v3 config created with theme vinsovkhoz");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
