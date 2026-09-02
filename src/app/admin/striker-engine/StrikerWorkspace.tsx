"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  SlidersHorizontal,
  Columns3,
  Rocket,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FilePlus2,
  FilePlus,
  ChevronDown,
  Layers,
  Database,
  Check,
  Undo2,
  Redo2,
  Upload,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StrikerProvider, useStriker } from "@/components/admin/striker-engine/StrikerContext";
import StrikerSidebar from "@/components/admin/striker-engine/StrikerSidebar";
import LivePreview from "@/components/admin/striker-engine/LivePreview";
import AiCommandConsole from "@/components/admin/striker-engine/AiCommandConsole";
import {
  publishBlueprintAction,
  updateThemeBlueprintAction,
  listVersionsAction,
  restoreVersionAction,
} from "@/app/admin/striker-engine/actions";
import { createBlueprint, createEmptyBlueprint } from "@/types/striker-engine";
import { STRIKER_PRESETS } from "@/lib/striker-presets";
import type { ThemeConfigBlueprint } from "@/types/striker-engine";

/** Тема из /api/themes/list (Theme Selector Ingestion) */
interface ThemeListEntry {
  id: string;
  slug: string;
  name: string;
  description: string;
  updatedAt: string;
  blueprint: ThemeConfigBlueprint;
}

interface StrikerWorkspaceProps {
  saved: ThemeConfigBlueprint[];
  initial: ThemeConfigBlueprint;
}

type StudioTab = "split" | "preview" | "settings" | "ai";

export default function StrikerWorkspace({ saved, initial }: StrikerWorkspaceProps) {
  const [current, setCurrent] = useState<ThemeConfigBlueprint>(initial);
  // Счётчик сессии: гарантирует remount провайдера даже для пустых чертежей (id/slug = "")
  const [session, setSession] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNew = (mode: "empty" | "template" | ThemeConfigBlueprint) => {
    if (typeof mode === "object") {
      setCurrent({ ...mode, id: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    } else {
      setCurrent(mode === "empty" ? createEmptyBlueprint() : createBlueprint());
    }
    setSession((s) => s + 1);
  };

  if (!mounted) {
    return (
      <div className="flex h-full min-h-[600px] items-center justify-center rounded-xl border bg-card">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Загрузка конструктора тем...
          </span>
        </div>
      </div>
    );
  }

  return (
    <StrikerProvider key={`${current.id || current.slug}-${session}`} initial={current}>
      <WorkspaceInner saved={saved} onLoad={setCurrent} onNew={handleNew} />
    </StrikerProvider>
  );
}

function WorkspaceInner({
  saved,
  onLoad,
  onNew,
}: {
  saved: ThemeConfigBlueprint[];
  onLoad: (bp: ThemeConfigBlueprint) => void;
  onNew: (mode: "empty" | "template" | ThemeConfigBlueprint) => void;
}) {
  const {
    blueprint,
    setBlueprintMeta,
    resetBlueprint,
    loadBlueprint,
    undo,
    redo,
    canUndo,
    canRedo,
    draftRestored,
    clearDraft,
  } = useStriker();
  const [activeTab, setActiveTab] = useState<StudioTab>("split");
  const [splitSubTab, setSplitSubTab] = useState<"manual" | "ai">("manual");
  const [publishing, setPublishing] = useState(false);
  const [savingDb, setSavingDb] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  // История версий темы (откат)
  const [versions, setVersions] = useState<{ id: string; name: string; createdAt: string }[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsMenuOpen, setVersionsMenuOpen] = useState(false);
  const [restoringVersion, setRestoringVersion] = useState<string | null>(null);
  const versionsMenuRef = useRef<HTMLDivElement>(null);
  // Скрытый input для импорта JSON
  const importInputRef = useRef<HTMLInputElement>(null);
  // Реф для горячей клавиши Ctrl+S (без пересоздания обработчика)
  const saveDbRef = useRef<() => void>(() => {});
  saveDbRef.current = () => {
    void handleUpdateDb();
  };

  // Theme Selector Ingestion: список активных тем из БД
  const [themeList, setThemeList] = useState<ThemeListEntry[]>([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string>(blueprint.id || "");
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/themes/list", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { themes?: ThemeListEntry[] }) => {
        if (cancelled) return;
        setThemeList(data.themes ?? []);
        // Если текущий чертёж уже сохранён — подсветить его в селекторе
        if (blueprint.id) setEditingThemeId(blueprint.id);
      })
      .catch(() => {
        if (!cancelled) setThemeList([]);
      })
      .finally(() => {
        if (!cancelled) setThemesLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Закрытие меню «Редактируемая тема» по клику вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) setThemeMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Закрытие меню «Новая тема» по клику вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) setNewMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Закрытие меню «История версий» по клику вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (versionsMenuRef.current && !versionsMenuRef.current.contains(e.target as Node)) setVersionsMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Горячие клавиши: Ctrl+Z / Ctrl+Shift+Z (undo/redo), Ctrl+S (сохранить в БД)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (key === "s") {
        e.preventDefault();
        saveDbRef.current();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // Уведомление о восстановленном черновике
  useEffect(() => {
    if (draftRestored) {
      notify("success", "Черновик восстановлен из автосохранения");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftRestored]);

  const notify = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handlePublish = async () => {
    if (publishing) return;
    setPublishing(true);
    const res = await publishBlueprintAction({
      slug: blueprint.slug,
      name: blueprint.name,
      tokens: blueprint.tokens,
      layout: blueprint.layout,
      content: blueprint.content,
    });
    setPublishing(false);
    if (res.ok) {
      setBlueprintMeta({ slug: res.slug });
      notify("success", "✓ Тема включена на сайте!");
    } else {
      notify("error", res.error ?? "Ошибка сохранения");
    }
  };

  /** Theme Selector Ingestion: мгновенная загрузка выбранной темы в контекст */
  const handleSelectTheme = (entry: ThemeListEntry) => {
    loadBlueprint(structuredClone(entry.blueprint));
    setEditingThemeId(entry.id);
    setThemeMenuOpen(false);
  };

  /** Database Sync: UPDATE конфигурации темы в БД по уникальному id */
  const handleUpdateDb = async () => {
    if (savingDb) return;
    if (!blueprint.id) {
      notify("error", "Сначала выберите существующую тему из списка «Редактируемая тема»");
      return;
    }
    setSavingDb(true);
    const res = await updateThemeBlueprintAction(blueprint.id, {
      slug: blueprint.slug,
      name: blueprint.name,
      tokens: blueprint.tokens,
      layout: blueprint.layout,
      content: blueprint.content,
      components: blueprint.components,
    });
    setSavingDb(false);
    if (res.ok) {
      clearDraft();
      notify("success", "Конфигурация темы успешно обновлена и применена на главном сайте.");
    } else {
      notify("error", res.error ?? "Ошибка обновления темы");
    }
  };

  /** Экспорт чертежа темы в JSON-файл */
  const handleExport = () => {
    const data = JSON.stringify(blueprint, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `theme-${blueprint.slug || "draft"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("success", "Чертёж темы скачан в JSON");
  };

  /** Импорт чертежа темы из JSON-файла */
  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ThemeConfigBlueprint;
        if (!parsed || !parsed.tokens || !parsed.layout) throw new Error("bad shape");
        loadBlueprint(parsed);
        setEditingThemeId(parsed.id || "");
        notify("success", "Чертёж импортирован в редактор");
      } catch {
        notify("error", "Не удалось прочитать файл: невалидный JSON чертежа");
      }
    };
    reader.readAsText(file);
  };

  /** Открыть/обновить список версий темы */
  const handleOpenVersions = async () => {
    if (!blueprint.id) {
      notify("error", "Сначала выберите тему из списка «Редактируемая тема»");
      return;
    }
    setVersionsMenuOpen((v) => !v);
    if (versions.length === 0 && !versionsLoading) {
      setVersionsLoading(true);
      const res = await listVersionsAction(blueprint.id);
      setVersionsLoading(false);
      if (res.ok && res.versions) {
        setVersions(res.versions);
      } else {
        notify("error", res.error ?? "Ошибка загрузки версий");
      }
    }
  };

  /** Откатить тему к выбранной версии */
  const handleRestoreVersion = async (versionId: string) => {
    if (!blueprint.id) return;
    setRestoringVersion(versionId);
    const res = await restoreVersionAction(blueprint.id, versionId);
    setRestoringVersion(null);
    if (res.ok && res.blueprint) {
      loadBlueprint(res.blueprint);
      setVersionsMenuOpen(false);
      notify("success", "Тема откачена к выбранной версии");
    } else {
      notify("error", res.error ?? "Ошибка отката версии");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Главная верхняя панель управления */}
      <header className="flex flex-wrap items-center justify-between gap-2.5 border-b bg-card/95 px-4 py-2.5 backdrop-blur-md">
        {/* Слева: Название темы */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-white shadow-xs">
            🎨
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-bold text-muted-foreground sm:inline">Тема:</span>
            <input
              value={blueprint.name}
              onChange={(e) => setBlueprintMeta({ name: e.target.value })}
              className="w-40 rounded-lg border bg-background px-2.5 py-1 text-xs font-bold text-foreground outline-none transition-all focus:w-52 focus:ring-2 focus:ring-primary sm:w-48"
              placeholder="Название темы"
              title="Нажмите, чтобы изменить название темы"
            />
          </div>

          {/* Theme Selector Ingestion: выбор редактируемой темы из БД */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setThemeMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-98"
              title="Выберите тему из базы данных для редактирования"
            >
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:inline">
                Редактируемая тема:
              </span>
              <span className="max-w-[120px] truncate">
                {themesLoading
                  ? "Загрузка..."
                  : (themeList.find((t) => t.id === editingThemeId)?.name ?? blueprint.name) ||
                    "Не выбрана"}
              </span>
              <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${themeMenuOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {themeMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-50 mt-1.5 w-[320px] overflow-hidden rounded-xl border bg-card shadow-2xl"
                >
                  <div className="border-b bg-muted/40 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Выберите тему для редактирования
                  </div>
                  <div className="max-h-[46vh] overflow-y-auto p-1.5">
                    {themeList.length === 0 && (
                      <div className="px-3 py-6 text-center text-xs font-semibold text-muted-foreground">
                        {themesLoading ? "Загрузка тем из базы..." : "В базе пока нет сохранённых тем"}
                      </div>
                    )}
                    {themeList.map((t) => {
                      const active = t.id === editingThemeId;
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleSelectTheme(t)}
                          className={`flex w-full items-center gap-2.5 rounded-lg border p-2 text-left transition-all hover:bg-muted/50 ${
                            active ? "border-primary bg-primary/5" : "border-transparent"
                          }`}
                        >
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border"
                            style={{
                              background: t.blueprint.tokens.palette.background,
                              borderColor: t.blueprint.tokens.palette.border,
                            }}
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: t.blueprint.tokens.palette.primary }}
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-bold text-foreground">
                              {t.name}
                              {active && <Check className="ml-1 inline h-3 w-3 text-primary" />}
                            </span>
                            <span className="block truncate text-[10px] text-muted-foreground">
                              {t.slug} · {t.description || "без описания"}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Undo/Redo: отмена и возврат изменений */}
          <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Отменить (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Вернуть (Ctrl+Shift+Z)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* По центру: Режим экрана */}
        <div className="flex rounded-lg border bg-muted/40 p-0.5">
          <button
            onClick={() => setActiveTab("split")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "split"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Настройки слева, живой сайт справа"
          >
            <Columns3 className="h-3.5 w-3.5" />
            <span>Настройки + Сайт</span>
          </button>

          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "preview"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Только просмотр сайта во весь экран"
          >
            <span>🖥️ Только сайт</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all sm:flex ${
              activeTab === "settings"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Только панель настроек"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Настройки</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "ai"
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="ИИ-помощник для создания темы"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>ИИ-Дизайнер</span>
          </button>
        </div>

        {/* Справа: Кнопки готовых тем и публикации */}
        <div className="flex items-center gap-2">
          {/* Дропдаун готовых тем */}
          <div className="relative" ref={newMenuRef}>
            <button
              onClick={() => setNewMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-98"
            >
              <FilePlus2 className="h-3.5 w-3.5 text-primary" />
              <span>15 готовых тем</span>
              <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${newMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {newMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1.5 w-[330px] overflow-hidden rounded-xl border bg-card shadow-2xl">
                {/* С нуля */}
                <button
                  onClick={() => {
                    onNew("empty");
                    setNewMenuOpen(false);
                  }}
                  className="flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted"
                >
                  <FilePlus className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <span className="block text-xs font-black">Создать пустую тему (с нуля)</span>
                    <span className="block text-[10px] text-muted-foreground">
                      Чистый лист: включите только те блоки, которые нужны
                    </span>
                  </div>
                </button>

                {/* 15 предтем */}
                <div className="max-h-[46vh] overflow-y-auto p-2">
                  <div className="mb-1.5 px-2 pt-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Выберите подходящий дизайн:
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {STRIKER_PRESETS.map((p) => (
                      <button
                        key={p.slug}
                        onClick={() => {
                          onNew(p);
                          setNewMenuOpen(false);
                        }}
                        className="group flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all hover:border-primary hover:bg-muted/50"
                      >
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border"
                          style={{ background: p.tokens.palette.background, borderColor: p.tokens.palette.border }}
                        >
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.tokens.palette.primary }} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-foreground">{p.name}</span>
                          <span className="block truncate text-[10px] text-muted-foreground">{p.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Инструменты: экспорт / импорт / история версий */}
          <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
            <button
              onClick={handleExport}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
              title="Скачать чертёж темы в JSON"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => importInputRef.current?.click()}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
              title="Загрузить чертёж темы из JSON"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImportFile(f);
                e.target.value = "";
              }}
            />

            {/* История версий темы */}
            <div className="relative" ref={versionsMenuRef}>
              <button
                onClick={handleOpenVersions}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
                title="История версий темы (откат)"
              >
                <History className="h-3.5 w-3.5" />
              </button>
              <AnimatePresence>
                {versionsMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-1.5 w-[300px] overflow-hidden rounded-xl border bg-card shadow-2xl"
                  >
                    <div className="border-b bg-muted/40 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      История версий · {blueprint.name}
                    </div>
                    <div className="max-h-[46vh] overflow-y-auto p-1.5">
                      {versionsLoading && (
                        <div className="flex items-center justify-center gap-2 px-3 py-6 text-xs font-semibold text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Загрузка версий...
                        </div>
                      )}
                      {!versionsLoading && versions.length === 0 && (
                        <div className="px-3 py-6 text-center text-xs font-semibold text-muted-foreground">
                          Версий пока нет. Они появятся после сохранения темы в базу данных.
                        </div>
                      )}
                      {versions.map((v, i) => (
                        <div
                          key={v.id}
                          className="flex items-center gap-2 rounded-lg border border-transparent p-2 transition-all hover:border-primary/30 hover:bg-muted/40"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-black text-muted-foreground">
                            {versions.length - i}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-bold text-foreground">{v.name}</span>
                            <span className="block text-[10px] text-muted-foreground">
                              {new Date(v.createdAt).toLocaleString("ru-RU")}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRestoreVersion(v.id)}
                            disabled={restoringVersion === v.id}
                            className="rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider text-primary transition-all hover:bg-primary/10 active:scale-95 disabled:opacity-40"
                            title="Откатить тему к этой версии"
                          >
                            {restoringVersion === v.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Откат"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {feedback && (
            <span
              className={`hidden items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold sm:inline-flex ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {feedback.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
              {feedback.text}
            </span>
          )}

          {/* Database Sync: обновление конфигурации темы в БД по id */}
          <button
            onClick={handleUpdateDb}
            disabled={savingDb}
            className="flex items-center gap-1.5 rounded-lg border border-blue-600/40 bg-blue-600/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-blue-700 transition-all hover:bg-blue-600/20 active:scale-98 disabled:opacity-50 dark:text-blue-400"
            title="Обновить конфигурацию выбранной темы прямо в базе данных"
          >
            {savingDb ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
            <span>Сохранить изменения в базу данных</span>
          </button>

          {/* Главная кнопка публикации */}
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-98 disabled:opacity-50"
            title="Применить эти настройки прямо на сайте"
          >
            {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
            <span>Сохранить на сайт</span>
          </button>
        </div>
      </header>

      {/* Основное содержимое рабочей области (морфинг при смене темы) */}
      <motion.div
        key={editingThemeId || "unsaved"}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="min-h-0 flex-1 overflow-hidden"
      >
        {activeTab === "split" && (
          /* Сплит-режим: слева удобные настройки (380-420px), справа живой сайт */
          <div className="flex h-full min-h-0 flex-col overflow-hidden lg:flex-row">
            <div className="flex h-[45vh] w-full shrink-0 flex-col border-b overflow-hidden lg:h-full lg:w-[380px] lg:border-b-0 lg:border-r xl:w-[420px]">
              {/* Переключатель внутри левой колонки: Ручные настройки / ИИ */}
              <div className="flex border-b bg-muted/40 p-1.5">
                <button
                  onClick={() => setSplitSubTab("manual")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                    splitSubTab === "manual"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ⚙️ Настройки сайта
                </button>
                <button
                  onClick={() => setSplitSubTab("ai")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                    splitSubTab === "ai"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🤖 ИИ-Помощник
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                {splitSubTab === "manual" ? (
                  <StrikerSidebar saved={saved} onLoad={onLoad} />
                ) : (
                  <AiCommandConsole />
                )}
              </div>
            </div>

            {/* Живой просмотр сайта */}
            <div className="min-h-0 flex-1 overflow-hidden">
              <LivePreview />
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          /* Только сайт во весь экран */
          <div className="h-full overflow-hidden">
            <LivePreview />
          </div>
        )}

        {activeTab === "settings" && (
          /* Только настройки */
          <div className="mx-auto h-full max-w-3xl overflow-hidden border-x">
            <StrikerSidebar saved={saved} onLoad={onLoad} />
          </div>
        )}

        {activeTab === "ai" && (
          /* Только ИИ-Помощник */
          <div className="mx-auto h-full max-w-3xl overflow-hidden border-x">
            <AiCommandConsole />
          </div>
        )}
      </motion.div>
    </div>
  );
}
