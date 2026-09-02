"use client";

import { create } from "zustand";
import type { AtlasConfig, Section } from "@/lib/atlas/config-schema";

interface EditorState {
  config: AtlasConfig | null;
  originalConfig: AtlasConfig | null;
  selectedSectionId: string | null;
  activePage: "home" | "category" | "product" | "search" | "cart";
  activePanel: "sections" | "inspector" | "tokens" | "header" | "sidebar" | "footer" | "pages" | "ai" | "versions";
  dirty: boolean;
  saving: boolean;
  previewUrl: string | null;

  // Undo/redo
  history: AtlasConfig[];
  historyIndex: number;

  // Actions
  setConfig: (config: AtlasConfig) => void;
  selectSection: (id: string | null) => void;
  setActivePage: (page: EditorState["activePage"]) => void;
  setActivePanel: (panel: EditorState["activePanel"]) => void;

  updateSections: (sections: Section[]) => void;
  addSection: (section: Section, index?: number) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  moveSection: (id: string, direction: "up" | "down") => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;

  updateTokens: (tokens: Partial<AtlasConfig["tokens"]>) => void;
  updateHeader: (header: Partial<AtlasConfig["header"]>) => void;
  updateSidebar: (sidebar: Partial<AtlasConfig["sidebar"]>) => void;
  updateFooter: (footer: Partial<AtlasConfig["footer"]>) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  save: () => Promise<void>;
  publish: (note?: string) => Promise<void>;
  setSaving: (saving: boolean) => void;
  setPreviewUrl: (url: string | null) => void;
  reset: () => void;
}

function getCurrentSections(config: AtlasConfig | null, page: string): Section[] {
  if (!config) return [];
  switch (page) {
    case "home": return config.pages.home.sections;
    case "category": return [...config.pages.category.sectionsBefore, ...config.pages.category.sectionsAfter];
    case "product": return config.pages.product.sections;
    case "search": return config.pages.search.sectionsAfter;
    case "cart": return config.pages.cart.sectionsAfter;
    default: return [];
  }
}

function updateCurrentSections(config: AtlasConfig, page: string, sections: Section[]): AtlasConfig {
  const newConfig = { ...config, pages: { ...config.pages } };
  switch (page) {
    case "home":
      newConfig.pages.home = { ...newConfig.pages.home, sections };
      break;
    case "product":
      newConfig.pages.product = { ...newConfig.pages.product, sections };
      break;
    case "search":
      newConfig.pages.search = { ...newConfig.pages.search, sectionsAfter: sections };
      break;
    case "cart":
      newConfig.pages.cart = { ...newConfig.pages.cart, sectionsAfter: sections };
      break;
    // category is complex (before/after) — skip for now
  }
  return newConfig;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  config: null,
  originalConfig: null,
  selectedSectionId: null,
  activePage: "home",
  activePanel: "sections",
  dirty: false,
  saving: false,
  previewUrl: null,
  history: [],
  historyIndex: -1,

  setConfig: (config) => {
    set({
      config,
      originalConfig: config,
      dirty: false,
      history: [config],
      historyIndex: 0,
      selectedSectionId: null,
    });
  },

  selectSection: (id) => set({ selectedSectionId: id }),
  setActivePage: (page) => set({ activePage: page, selectedSectionId: null }),
  setActivePanel: (panel) => set({ activePanel: panel }),

  updateSections: (sections) => {
    const state = get();
    if (!state.config) return;
    const newConfig = updateCurrentSections(state.config, state.activePage, sections);
    pushHistory(set, state, newConfig);
  },

  addSection: (section, index) => {
    const state = get();
    if (!state.config) return;
    const sections = [...getCurrentSections(state.config, state.activePage)];
    if (index != null) sections.splice(index, 0, section);
    else sections.push(section);
    const newConfig = updateCurrentSections(state.config, state.activePage, sections);
    pushHistory(set, state, newConfig);
    set({ selectedSectionId: section.id });
  },

  updateSection: (id, updates) => {
    const state = get();
    if (!state.config) return;
    const sections = getCurrentSections(state.config, state.activePage).map((s) =>
      s.id === id ? { ...s, ...updates, props: updates.props ?? s.props, settings: updates.settings ?? s.settings } : s
    );
    const newConfig = updateCurrentSections(state.config, state.activePage, sections);
    pushHistory(set, state, newConfig);
  },

  removeSection: (id) => {
    const state = get();
    if (!state.config) return;
    const sections = getCurrentSections(state.config, state.activePage).filter((s) => s.id !== id);
    const newConfig = updateCurrentSections(state.config, state.activePage, sections);
    pushHistory(set, state, newConfig);
    set({ selectedSectionId: null });
  },

  duplicateSection: (id) => {
    const state = get();
    if (!state.config) return;
    const sections = getCurrentSections(state.config, state.activePage);
    const idx = sections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const orig = sections[idx];
    const copy: Section = {
      ...orig,
      id: `${orig.type}-${Date.now()}`,
      props: JSON.parse(JSON.stringify(orig.props)),
      settings: JSON.parse(JSON.stringify(orig.settings)),
    };
    sections.splice(idx + 1, 0, copy);
    const newConfig = updateCurrentSections(state.config, state.activePage, [...sections]);
    pushHistory(set, state, newConfig);
    set({ selectedSectionId: copy.id });
  },

  moveSection: (id, direction) => {
    const state = get();
    if (!state.config) return;
    const sections = [...getCurrentSections(state.config, state.activePage)];
    const idx = sections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    [sections[idx], sections[targetIdx]] = [sections[targetIdx], sections[idx]];
    const newConfig = updateCurrentSections(state.config, state.activePage, sections);
    pushHistory(set, state, newConfig);
  },

  reorderSections: (fromIndex, toIndex) => {
    const state = get();
    if (!state.config) return;
    const sections = [...getCurrentSections(state.config, state.activePage)];
    const [moved] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, moved);
    const newConfig = updateCurrentSections(state.config, state.activePage, sections);
    pushHistory(set, state, newConfig);
  },

  updateTokens: (tokens) => {
    const state = get();
    if (!state.config) return;
    const newConfig = { ...state.config, tokens: { ...state.config.tokens, ...tokens } };
    pushHistory(set, state, newConfig);
  },

  updateHeader: (header) => {
    const state = get();
    if (!state.config) return;
    const newConfig = { ...state.config, header: { ...state.config.header, ...header } };
    pushHistory(set, state, newConfig);
  },

  updateSidebar: (sidebar) => {
    const state = get();
    if (!state.config) return;
    const newConfig = { ...state.config, sidebar: { ...state.config.sidebar, ...sidebar } };
    pushHistory(set, state, newConfig);
  },

  updateFooter: (footer) => {
    const state = get();
    if (!state.config) return;
    const newConfig = { ...state.config, footer: { ...state.config.footer, ...footer } };
    pushHistory(set, state, newConfig);
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    const newIndex = state.historyIndex - 1;
    set({
      config: state.history[newIndex],
      historyIndex: newIndex,
      dirty: true,
      selectedSectionId: null,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const newIndex = state.historyIndex + 1;
    set({
      config: state.history[newIndex],
      historyIndex: newIndex,
      dirty: true,
      selectedSectionId: null,
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  save: async () => {
    const state = get();
    if (!state.config) return;
    set({ saving: true });
    try {
      await fetch("/api/atlas/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: state.config }),
      });
      set({ dirty: false, originalConfig: state.config });
    } finally {
      set({ saving: false });
    }
  },

  publish: async (note) => {
    const state = get();
    if (!state.config) return;
    set({ saving: true });
    try {
      // Save first
      await fetch("/api/atlas/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: state.config }),
      });
      // Then publish
      await fetch("/api/atlas/config/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note ?? "Published from editor" }),
      });
      set({ dirty: false, originalConfig: state.config });
    } finally {
      set({ saving: false });
    }
  },

  setSaving: (saving) => set({ saving }),
  setPreviewUrl: (url) => set({ previewUrl: url }),

  reset: () => {
    const state = get();
    if (state.originalConfig) {
      set({
        config: state.originalConfig,
        dirty: false,
        history: [state.originalConfig],
        historyIndex: 0,
        selectedSectionId: null,
      });
    }
  },
}));

function pushHistory(
  set: (partial: Partial<EditorState>) => void,
  state: EditorState,
  newConfig: AtlasConfig
) {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(newConfig);
  // Cap history at 50
  if (newHistory.length > 50) newHistory.shift();
  set({
    config: newConfig,
    history: newHistory,
    historyIndex: newHistory.length - 1,
    dirty: true,
  });
}
