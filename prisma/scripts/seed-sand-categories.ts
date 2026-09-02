// Категории раздела «Песок и щебень» (товары добавляются через админку)
import { PrismaClient } from "@prisma/client";

const CATEGORIES = [
  { name: "Песок", slug: "pesok" },
  { name: "Щебень", slug: "scheben" },
  { name: "Грунт и торф", slug: "grunt-i-torf" },
  { name: "Керамзит", slug: "keramzit" },
  { name: "Цемент и смеси", slug: "cement-i-smesi" },
];

async function main() {
  const prisma = new PrismaClient();
  let created = 0;
  for (const c of CATEGORIES) {
    const exists = await prisma.category.findUnique({ where: { slug: c.slug } });
    if (!exists) {
      await prisma.category.create({ data: c });
      created++;
      console.log(`+ ${c.name} (/${c.slug})`);
    } else {
      console.log(`= ${c.name} уже есть`);
    }
  }
  console.log(`Готово: создано ${created}, всего категорий сыпучих: ${CATEGORIES.length}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
