/**
 * Atlas: сидировать дефолтный конфиг в StorefrontConfig, если его нет.
 * Запуск: npx tsx prisma/scripts/atlas-seed-config.ts
 */
import { PrismaClient } from "@prisma/client";
import { getDefaultAtlasConfig } from "../../src/lib/atlas/config-defaults";
import { ATLAS_THEME_KEY } from "../../src/lib/atlas/constants";

const prisma = new PrismaClient();

async function main() {
  const def = getDefaultAtlasConfig();
  const existing = await prisma.storefrontConfig.findUnique({
    where: { themeKey: ATLAS_THEME_KEY },
  });
  if (existing) {
    await prisma.storefrontConfig.update({
      where: { themeKey: ATLAS_THEME_KEY },
      data: {
        draft: def as any,
        published: def as any,
        draftUpdatedAt: new Date(),
        publishedAt: new Date(),
      },
    });
    console.log(`Atlas config updated (re-seeded). Theme key: ${ATLAS_THEME_KEY}`);
    return;
  }

  await prisma.storefrontConfig.create({
    data: {
      themeKey: ATLAS_THEME_KEY,
      draft: def as any,
      published: def as any,
      draftUpdatedAt: new Date(),
      publishedAt: new Date(),
    },
  });

  // Создаём первую версию
  await prisma.storefrontConfigVersion.create({
    data: {
      themeKey: ATLAS_THEME_KEY,
      version: 1,
      data: def as any,
      note: "Начальная конфигурация Atlas",
    },
  });

  console.log(`Atlas config seeded. Theme key: ${ATLAS_THEME_KEY}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
