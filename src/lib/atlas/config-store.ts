import { prisma } from "@/lib/prisma";
import { ATLAS_THEME_KEY } from "./constants";
import { parseAtlasConfig, type AtlasConfig } from "./config-schema";
import { getDefaultAtlasConfig } from "./config-defaults";

import { unstable_cache } from "next/cache";

/** Получить сырую запись StorefrontConfig */
export async function getRawConfig(): Promise<{ draft: unknown; published: unknown; draftUpdatedAt: Date | null; publishedAt: Date | null } | null> {
  try {
    const row = await prisma.storefrontConfig.findUnique({
      where: { themeKey: ATLAS_THEME_KEY },
    });
    if (!row) return null;
    return { draft: row.draft, published: row.published, draftUpdatedAt: row.draftUpdatedAt, publishedAt: row.publishedAt };
  } catch {
    return null;
  }
}

/** Получить опубликованный конфиг (для витрины) */
export async function getPublishedConfig(): Promise<AtlasConfig> {
  const raw = await getRawConfig();
  if (raw?.published) return parseAtlasConfig(raw.published);
  // Если нет опубликованного — используем дефолт
  return getDefaultAtlasConfig();
}

/** Получить черновик конфига (для редактора) */
export async function getDraftConfig(): Promise<AtlasConfig> {
  const raw = await getRawConfig();
  if (raw?.draft) return parseAtlasConfig(raw.draft);
  return getDefaultAtlasConfig();
}

/** Сохранить черновик */
export async function saveDraftConfig(data: AtlasConfig): Promise<void> {
  await prisma.storefrontConfig.upsert({
    where: { themeKey: ATLAS_THEME_KEY },
    create: {
      themeKey: ATLAS_THEME_KEY,
      draft: data as any,
      draftUpdatedAt: new Date(),
    },
    update: {
      draft: data as any,
      draftUpdatedAt: new Date(),
    },
  });
}

/** Опубликовать черновик: published = draft, создать версию */
export async function publishConfig(note?: string): Promise<{ version: number }> {
  const raw = await prisma.storefrontConfig.findUnique({
    where: { themeKey: ATLAS_THEME_KEY },
  });
  if (!raw) {
    // Если записи нет — создаём с дефолтом и публикуем
    const def = getDefaultAtlasConfig();
    await prisma.storefrontConfig.create({
      data: {
        themeKey: ATLAS_THEME_KEY,
        draft: def as any,
        published: def as any,
        draftUpdatedAt: new Date(),
        publishedAt: new Date(),
      },
    });
    await createVersion(ATLAS_THEME_KEY, 1, def, note);
    return { version: 1 };
  }

  const draftConfig = parseAtlasConfig(raw.draft);
  const lastVersion = await prisma.storefrontConfigVersion.findFirst({
    where: { themeKey: ATLAS_THEME_KEY },
    orderBy: { version: "desc" },
  });
  const nextVersion = (lastVersion?.version ?? 0) + 1;

  await prisma.storefrontConfig.update({
    where: { themeKey: ATLAS_THEME_KEY },
    data: {
      published: raw.draft as any,
      publishedAt: new Date(),
    },
  });

  await createVersion(ATLAS_THEME_KEY, nextVersion, draftConfig, note);
  return { version: nextVersion };
}

async function createVersion(themeKey: string, version: number, data: AtlasConfig, note?: string): Promise<void> {
  await prisma.storefrontConfigVersion.create({
    data: {
      themeKey,
      version,
      data: data as any,
      note: note ?? null,
    },
  });
}

/** Получить список версий */
export async function getVersions(): Promise<{ id: string; version: number; note: string | null; createdAt: Date }[]> {
  const rows = await prisma.storefrontConfigVersion.findMany({
    where: { themeKey: ATLAS_THEME_KEY },
    orderBy: { version: "desc" },
    take: 50,
  });
  return rows.map((r) => ({ id: r.id, version: r.version, note: r.note, createdAt: r.createdAt }));
}

/** Восстановить версию в черновик */
export async function restoreVersion(version: number): Promise<AtlasConfig> {
  const row = await prisma.storefrontConfigVersion.findUnique({
    where: { themeKey_version: { themeKey: ATLAS_THEME_KEY, version } },
  });
  if (!row) throw new Error(`Version ${version} not found`);
  const config = parseAtlasConfig(row.data);
  await saveDraftConfig(config);
  return config;
}

/** Сидировать дефолтный конфиг, если его нет */
export async function seedDefaultConfig(): Promise<void> {
  const existing = await prisma.storefrontConfig.findUnique({
    where: { themeKey: ATLAS_THEME_KEY },
  });
  if (existing) return;
  const def = getDefaultAtlasConfig();
  await prisma.storefrontConfig.create({
    data: {
      themeKey: ATLAS_THEME_KEY,
      draft: def as any,
      published: def as any,
      draftUpdatedAt: new Date(),
      publishedAt: new Date(),
    },
  });
  await createVersion(ATLAS_THEME_KEY, 1, def, "Начальная конфигурация Atlas");
}
