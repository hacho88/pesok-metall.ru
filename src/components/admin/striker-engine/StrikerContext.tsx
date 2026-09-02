"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ThemeConfigBlueprint, ThemeTokens, LayoutComponent, MaterialPreset, LayoutComponentId, ContentOverrides, UltraComponentsConfig } from "@/types/striker-engine";
import { createBlueprint, MATERIAL_PRESETS } from "@/types/striker-engine";

/** Ключ localStorage для автосохранения черновика */
const DRAFT_KEY = "striker:blueprint-draft";
/** Максимальная глубина истории undo/redo */
const HISTORY_LIMIT = 30;

interface StrikerContextValue {
  /** Активный редактируемый чертёж (Theme Selector Ingestion) */
  blueprint: ThemeConfigBlueprint;
  /** Алиас: активный редактируемый чертёж выбранной темы */
  activeEditingBlueprint: ThemeConfigBlueprint;
  setBlueprint: (bp: ThemeConfigBlueprint) => void;
  /** Мгновенная загрузка чертежа темы в редактор (без ремаунта) */
  loadBlueprint: (bp: ThemeConfigBlueprint) => void;
  updateTokens: (patch: Partial<ThemeTokens>) => void;
  setMaterial: (m: MaterialPreset) => void;
  setPaletteColor: (key: keyof ThemeTokens["palette"], value: string) => void;
  toggleComponent: (id: LayoutComponentId) => void;
  setComponentMode: (id: LayoutComponentId, mode: string) => void;
  moveComponent: (id: LayoutComponentId, dir: -1 | 1) => void;
  reorderComponents: (next: LayoutComponent[]) => void;
  updateContent: (patch: Partial<ContentOverrides>) => void;
  updateComponents: (patch: Partial<UltraComponentsConfig>) => void;
  setTrendingQueries: (queries: string[]) => void;
  setBlueprintMeta: (patch: { name?: string; slug?: string }) => void;
  resetBlueprint: () => void;
  /** Undo/Redo: отмена и возврат изменений */
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Автосохранение черновика в localStorage */
  draftRestored: boolean;
  clearDraft: () => void;
}

const StrikerContext = createContext<StrikerContextValue | null>(null);

export function StrikerProvider({
  initial,
  children,
}: {
  initial: ThemeConfigBlueprint;
  children: ReactNode;
}) {
  const [blueprint, setBlueprint] = useState<ThemeConfigBlueprint>(initial);
  // История undo/redo: refs не вызывают лишних ре-рендеров, tick — для canUndo/canRedo
  const pastRef = useRef<ThemeConfigBlueprint[]>([]);
  const futureRef = useRef<ThemeConfigBlueprint[]>([]);
  const prevRef = useRef<ThemeConfigBlueprint | null>(null);
  const skipHistoryRef = useRef(false);
  const [, setHistoryTick] = useState(0);

  const [draftRestored, setDraftRestored] = useState(false);

  // Восстановление черновика из localStorage при монтировании
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ThemeConfigBlueprint;
        if (parsed && parsed.tokens && parsed.layout) {
          setBlueprint(parsed);
          setDraftRestored(true);
        }
      }
    } catch {
      // повреждённый черновик — игнорируем
    }
  }, []);

  // История: каждое изменение blueprint (кроме undo/redo) попадает в past
  useEffect(() => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      prevRef.current = blueprint;
      return;
    }
    if (prevRef.current) {
      pastRef.current = [...pastRef.current.slice(-(HISTORY_LIMIT - 1)), prevRef.current];
      futureRef.current = [];
    }
    prevRef.current = blueprint;
    setHistoryTick((t) => t + 1);
  }, [blueprint]);

  // Автосохранение черновика (debounce 400мс)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(blueprint));
      } catch {
        // localStorage недоступен — пропускаем
      }
    }, 400);
    return () => clearTimeout(t);
  }, [blueprint]);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const prev = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [blueprint, ...futureRef.current];
    skipHistoryRef.current = true;
    setBlueprint(prev);
    setHistoryTick((t) => t + 1);
  }, [blueprint]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const [next, ...rest] = futureRef.current;
    futureRef.current = rest;
    pastRef.current = [...pastRef.current, blueprint];
    skipHistoryRef.current = true;
    setBlueprint(next);
    setHistoryTick((t) => t + 1);
  }, [blueprint]);

  const clearDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }, []);

  const updateTokens = useCallback((patch: Partial<ThemeTokens>) => {
    setBlueprint((bp) => ({
      ...bp,
      updatedAt: new Date().toISOString(),
      tokens: { ...bp.tokens, ...patch },
    }));
  }, []);

  const setMaterial = useCallback((m: MaterialPreset) => {
    setBlueprint((bp) => ({
      ...bp,
      updatedAt: new Date().toISOString(),
      tokens: { ...bp.tokens, material: m, palette: MATERIAL_PRESETS[m] },
    }));
  }, []);

  const setPaletteColor = useCallback((key: keyof ThemeTokens["palette"], value: string) => {
    setBlueprint((bp) => ({
      ...bp,
      updatedAt: new Date().toISOString(),
      tokens: { ...bp.tokens, palette: { ...bp.tokens.palette, [key]: value } },
    }));
  }, []);

  const toggleComponent = useCallback((id: LayoutComponentId) => {
    setBlueprint((bp) => ({
      ...bp,
      updatedAt: new Date().toISOString(),
      layout: bp.layout.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)),
    }));
  }, []);

  const setComponentMode = useCallback((id: LayoutComponentId, mode: string) => {
    setBlueprint((bp) => ({
      ...bp,
      updatedAt: new Date().toISOString(),
      layout: bp.layout.map((c) => (c.id === id ? { ...c, mode } : c)),
    }));
  }, []);

  const moveComponent = useCallback((id: LayoutComponentId, dir: -1 | 1) => {
    setBlueprint((bp) => {
      const layout = [...bp.layout];
      const idx = layout.findIndex((c) => c.id === id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= layout.length) return bp;
      [layout[idx], layout[target]] = [layout[target], layout[idx]];
      return { ...bp, updatedAt: new Date().toISOString(), layout };
    });
  }, []);

  /** Drag-and-drop: полная замена порядка массива layout */
  const reorderComponents = useCallback((next: LayoutComponent[]) => {
    setBlueprint((bp) => ({ ...bp, updatedAt: new Date().toISOString(), layout: next }));
  }, []);

  const updateContent = useCallback((patch: Partial<ContentOverrides>) => {
    setBlueprint((bp) => ({
      ...bp,
      updatedAt: new Date().toISOString(),
      content: { ...bp.content, ...patch },
    }));
  }, []);

  const setTrendingQueries = useCallback((queries: string[]) => {
    setBlueprint((bp) => ({
      ...bp,
      updatedAt: new Date().toISOString(),
      content: { ...bp.content, trendingQueries: queries },
    }));
  }, []);

  /** ULTRA: точечное обновление конфигурации компонентов (карточки/категории/селекторы/оформление) */
  const updateComponents = useCallback((patch: Partial<UltraComponentsConfig>) => {
    setBlueprint((bp) => ({
      ...bp,
      updatedAt: new Date().toISOString(),
      components: {
        catalog: { ...bp.components.catalog, ...patch.catalog },
        productCard: { ...bp.components.productCard, ...patch.productCard },
        unitSelector: { ...bp.components.unitSelector, ...patch.unitSelector },
        checkout: { ...bp.components.checkout, ...patch.checkout },
      },
    }));
  }, []);

  const setBlueprintMeta = useCallback((patch: { name?: string; slug?: string }) => {
    setBlueprint((bp) => ({ ...bp, ...patch, updatedAt: new Date().toISOString() }));
  }, []);

  const resetBlueprint = useCallback(() => {
    setBlueprint(createBlueprint());
  }, []);

  /** Theme Selector Ingestion: мгновенно наполняет контекст JSON выбранной темы */
  const loadBlueprint = useCallback((bp: ThemeConfigBlueprint) => {
    setBlueprint(bp);
  }, []);

  const value = useMemo<StrikerContextValue>(
    () => ({
      blueprint,
      activeEditingBlueprint: blueprint,
      setBlueprint,
      loadBlueprint,
      updateTokens,
      setMaterial,
      setPaletteColor,
      toggleComponent,
      setComponentMode,
      moveComponent,
      reorderComponents,
      updateContent,
      updateComponents,
      setTrendingQueries,
      setBlueprintMeta,
      resetBlueprint,
      undo,
      redo,
      canUndo: pastRef.current.length > 0,
      canRedo: futureRef.current.length > 0,
      draftRestored,
      clearDraft,
    }),
    [blueprint, loadBlueprint, updateTokens, setMaterial, setPaletteColor, toggleComponent, setComponentMode, moveComponent, reorderComponents, updateContent, updateComponents, setTrendingQueries, setBlueprintMeta, resetBlueprint, undo, redo, draftRestored, clearDraft]
  );

  return <StrikerContext.Provider value={value}>{children}</StrikerContext.Provider>;
}

export function useStriker(): StrikerContextValue {
  const ctx = useContext(StrikerContext);
  if (!ctx) throw new Error("useStriker must be used within StrikerProvider");
  return ctx;
}
