"use server";

import { revalidatePath } from "next/cache";
import {
  saveBlueprint,
  updateBlueprintById,
  deleteBlueprint,
  applyBlueprint,
  slugifyBlueprintName,
  listBlueprintVersions,
  restoreBlueprintVersion,
  type BlueprintVersionSummary,
} from "@/lib/striker-blueprints";
import type { ThemeTokens, LayoutComponent, ContentOverrides, UltraComponentsConfig, ThemeConfigBlueprint } from "@/types/striker-engine";

/**
 * STRIKER.Engine — Server Actions для сериализации чертежа в БД.
 * Вызываются из клиентского конструктора (StrikerSidebar / LivePreview).
 */

export interface SaveBlueprintResult {
  ok: boolean;
  slug?: string;
  error?: string;
}

interface BlueprintInput {
  slug?: string;
  name: string;
  tokens: ThemeTokens;
  layout: LayoutComponent[];
  content?: ContentOverrides;
  components?: UltraComponentsConfig;
}

/** Сохранить чертёж в БД (upsert по slug) */
export async function saveBlueprintAction(input: BlueprintInput): Promise<SaveBlueprintResult> {
  try {
    const slug = input.slug?.trim() || slugifyBlueprintName(input.name);
    await saveBlueprint({
      slug,
      name: input.name,
      tokens: input.tokens,
      layout: input.layout,
      content: input.content,
      components: input.components,
    });
    revalidatePath("/admin/striker-engine");
    revalidatePath("/");
    return { ok: true, slug };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка сохранения" };
  }
}

/** Применить чертёж к витрине */
export async function applyBlueprintAction(id: string): Promise<SaveBlueprintResult> {
  try {
    await applyBlueprint(id);
    revalidatePath("/admin/striker-engine");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка применения" };
  }
}

/**
 * Theme Override Sync — обновляет конфигурацию конкретной темы в БД
 * строго по её уникальному строковому идентификатору (id: "city-met" и т.д.).
 */
export async function updateThemeBlueprintAction(
  id: string,
  input: BlueprintInput
): Promise<SaveBlueprintResult> {
  try {
    if (!id) return { ok: false, error: "Не указан id редактируемой темы" };
    await updateBlueprintById(id, {
      name: input.name,
      tokens: input.tokens,
      layout: input.layout,
      content: input.content,
      components: input.components,
    });
    revalidatePath("/admin/striker-engine");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка обновления темы" };
  }
}

/** Удалить чертёж */
export async function deleteBlueprintAction(id: string): Promise<SaveBlueprintResult> {
  try {
    await deleteBlueprint(id);
    revalidatePath("/admin/striker-engine");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка удаления" };
  }
}

/** Список версий чертежа (история для отката) */
export async function listVersionsAction(id: string): Promise<{ ok: boolean; versions?: BlueprintVersionSummary[]; error?: string }> {
  try {
    if (!id) return { ok: false, error: "Не указан id темы" };
    const versions = await listBlueprintVersions(id);
    return { ok: true, versions };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка загрузки версий" };
  }
}

/** Откатить чертёж к выбранной версии */
export async function restoreVersionAction(
  id: string,
  versionId: string
): Promise<{ ok: boolean; blueprint?: ThemeConfigBlueprint; error?: string }> {
  try {
    if (!id || !versionId) return { ok: false, error: "Не указан id темы или версии" };
    const blueprint = await restoreBlueprintVersion(id, versionId);
    revalidatePath("/admin/striker-engine");
    revalidatePath("/");
    return { ok: true, blueprint };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка отката версии" };
  }
}

/**
 * Save Changes to Production — сохраняет финальный чертёж в БД и
 * блокирует его как активный для витрины (PageConfig.home.theme = striker:*).
 */
export async function publishBlueprintAction(input: BlueprintInput): Promise<SaveBlueprintResult> {
  try {
    const slug = input.slug?.trim() || slugifyBlueprintName(input.name);
    const bp = await saveBlueprint({
      slug,
      name: input.name,
      tokens: input.tokens,
      layout: input.layout,
      content: input.content,
      components: input.components,
    });
    await applyBlueprint(bp.id);
    revalidatePath("/admin/striker-engine");
    revalidatePath("/");
    return { ok: true, slug };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка публикации" };
  }
}
