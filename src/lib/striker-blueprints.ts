import { prisma } from "@/lib/prisma";
import type { ThemeConfigBlueprint, ThemeTokens, LayoutComponent, ContentOverrides, UltraComponentsConfig } from "@/types/striker-engine";
import { DEFAULT_TOKENS, DEFAULT_LAYOUT, DEFAULT_CONTENT, DEFAULT_COMPONENTS } from "@/types/striker-engine";

/** Серверный слой STRIKER.Engine: чтение/запись чертежей в БД */

function toBlueprint(row: {
  id: string;
  slug: string;
  name: string;
  tokens: unknown;
  layout: unknown;
  content?: unknown;
  components?: unknown;
  createdAt: Date;
  updatedAt: Date;
}): ThemeConfigBlueprint {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tokens: { ...DEFAULT_TOKENS, ...(row.tokens as Partial<ThemeTokens>) },
    layout: Array.isArray(row.layout)
      ? (row.layout as LayoutComponent[])
      : structuredClone(DEFAULT_LAYOUT),
    content: { ...DEFAULT_CONTENT, ...((row.content ?? {}) as Partial<ContentOverrides>) },
    components: {
      ...structuredClone(DEFAULT_COMPONENTS),
      ...((row.components ?? {}) as Partial<UltraComponentsConfig>),
    },
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Список всех чертежей */
export async function listBlueprints(): Promise<ThemeConfigBlueprint[]> {
  const rows = await prisma.strikerBlueprint.findMany({ orderBy: { updatedAt: "desc" } });
  return rows.map(toBlueprint);
}

/** Активный чертёж (применённый к витрине) */
export async function getActiveBlueprint(): Promise<ThemeConfigBlueprint | null> {
  const row = await prisma.strikerBlueprint.findFirst({ where: { isActive: true } });
  return row ? toBlueprint(row) : null;
}

/** Чертёж по slug */
export async function getBlueprintBySlug(slug: string): Promise<ThemeConfigBlueprint | null> {
  const row = await prisma.strikerBlueprint.findUnique({ where: { slug } });
  return row ? toBlueprint(row) : null;
}

/** Снапшот текущего состояния чертежа в историю версий (перед изменением) */
async function snapshotBlueprint(row: {
  id: string;
  name: string;
  tokens: unknown;
  layout: unknown;
  content?: unknown;
  components?: unknown;
}): Promise<void> {
  await prisma.strikerBlueprintVersion.create({
    data: {
      blueprintId: row.id,
      name: row.name,
      tokens: row.tokens as object,
      layout: row.layout as object,
      content: (row.content ?? DEFAULT_CONTENT) as object,
      components: (row.components ?? DEFAULT_COMPONENTS) as object,
    },
  });
}

/** Сохранить/обновить чертёж (upsert по slug) */
export async function saveBlueprint(input: {
  slug: string;
  name: string;
  tokens: ThemeTokens;
  layout: LayoutComponent[];
  content?: ContentOverrides;
  components?: UltraComponentsConfig;
}): Promise<ThemeConfigBlueprint> {
  // Версионирование: перед обновлением существующего чертежа сохраняем снапшот
  const existing = await prisma.strikerBlueprint.findUnique({ where: { slug: input.slug } });
  if (existing) {
    await snapshotBlueprint(existing);
  }

  const row = await prisma.strikerBlueprint.upsert({
    where: { slug: input.slug },
    update: {
      name: input.name,
      tokens: input.tokens as object,
      layout: input.layout as object,
      ...(input.content ? { content: input.content as object } : {}),
      ...(input.components ? { components: input.components as object } : {}),
    },
    create: {
      slug: input.slug,
      name: input.name,
      tokens: input.tokens as object,
      layout: input.layout as object,
      content: (input.content ?? DEFAULT_CONTENT) as object,
      components: (input.components ?? DEFAULT_COMPONENTS) as object,
    },
  });
  return toBlueprint(row);
}

/** Обновить существующий чертёж строго по уникальному id (Theme Override Sync) */
export async function updateBlueprintById(
  id: string,
  input: {
    name?: string;
    tokens?: ThemeTokens;
    layout?: LayoutComponent[];
    content?: ContentOverrides;
    components?: UltraComponentsConfig;
  }
): Promise<ThemeConfigBlueprint> {
  // Версионирование: снапшот текущего состояния перед изменением
  const current = await prisma.strikerBlueprint.findUnique({ where: { id } });
  if (current) {
    await snapshotBlueprint(current);
  }

  const row = await prisma.strikerBlueprint.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.tokens ? { tokens: input.tokens as object } : {}),
      ...(input.layout ? { layout: input.layout as object } : {}),
      ...(input.content ? { content: input.content as object } : {}),
      ...(input.components ? { components: input.components as object } : {}),
    },
  });
  return toBlueprint(row);
}

/** Сводка версий чертежа (для UI истории) */
export interface BlueprintVersionSummary {
  id: string;
  name: string;
  createdAt: string;
}

/** Список версий чертежа по id, новые сверху */
export async function listBlueprintVersions(id: string): Promise<BlueprintVersionSummary[]> {
  const rows = await prisma.strikerBlueprintVersion.findMany({
    where: { blueprintId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((v) => ({ id: v.id, name: v.name, createdAt: v.createdAt.toISOString() }));
}

/** Откатить чертёж к версии (текущее состояние тоже сохраняется в историю) */
export async function restoreBlueprintVersion(id: string, versionId: string): Promise<ThemeConfigBlueprint> {
  const version = await prisma.strikerBlueprintVersion.findFirst({
    where: { id: versionId, blueprintId: id },
  });
  if (!version) throw new Error("Версия не найдена");

  const current = await prisma.strikerBlueprint.findUnique({ where: { id } });
  if (current) {
    await snapshotBlueprint(current);
  }

  const row = await prisma.strikerBlueprint.update({
    where: { id },
    data: {
      name: version.name,
      tokens: version.tokens as object,
      layout: version.layout as object,
      content: version.content as object,
      components: version.components as object,
    },
  });
  return toBlueprint(row);
}

/** Удалить чертёж */
export async function deleteBlueprint(id: string): Promise<void> {
  await prisma.strikerBlueprint.delete({ where: { id } });
}

/** Применить чертёж к витрине (снимает активность с остальных) */
export async function applyBlueprint(id: string): Promise<void> {
  await prisma.$transaction([
    prisma.strikerBlueprint.updateMany({ where: { isActive: true }, data: { isActive: false } }),
    prisma.strikerBlueprint.update({ where: { id }, data: { isActive: true } }),
  ]);
  // Синхронизация с PageConfig.home.theme — витрина подхватит striker-чертёж
  const bp = await prisma.strikerBlueprint.findUnique({ where: { id } });
  if (bp) {
    const existing = await prisma.pageConfig.findUnique({ where: { slug: "home" } });
    if (existing) {
      await prisma.pageConfig.update({
        where: { slug: "home" },
        data: { theme: bp.slug },
      });
    } else {
      await prisma.pageConfig.create({
        data: { slug: "home", theme: bp.slug, blocks: [] },
      });
    }
  }
}

/** Сгенерировать уникальный slug из названия */
export function slugifyBlueprintName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9а-яё\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  return `striker:${base || "blueprint"}`;
}
