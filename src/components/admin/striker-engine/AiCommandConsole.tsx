"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, Wand2, ArrowRight } from "lucide-react";
import { useStriker } from "./StrikerContext";
import type { ThemeConfigBlueprint } from "@/types/striker-engine";

/** Одна строка diff-превью: что и где изменилось */
interface DiffItem {
  group: string;
  label: string;
  before: string;
  after: string;
}

const MATERIAL_LABELS: Record<string, string> = {
  anthracite: "Тёмный антрацит",
  chrome: "Светлая сталь",
  desert: "Тёплый песок",
  concrete: "Серый бетон",
};

/** Сравнивает текущий и предложенный чертёж, возвращает список изменений */
function computeBlueprintDiff(before: ThemeConfigBlueprint, after: ThemeConfigBlueprint): DiffItem[] {
  const items: DiffItem[] = [];
  const push = (group: string, label: string, b: unknown, a: unknown) => {
    const bs = String(b ?? "");
    const as = String(a ?? "");
    if (bs !== as) items.push({ group, label, before: bs, after: as });
  };

  // Токены
  push("Токены", "Скругление углов", `${before.tokens.radius}px`, `${after.tokens.radius}px`);
  push("Токены", "Толщина линий", `${before.tokens.borderWeight}px`, `${after.tokens.borderWeight}px`);
  push("Токены", "Зерно-шум", before.tokens.noise, after.tokens.noise);
  push("Токены", "Материал", MATERIAL_LABELS[before.tokens.material] ?? before.tokens.material, MATERIAL_LABELS[after.tokens.material] ?? after.tokens.material);
  push("Токены", "Вид каталога", before.tokens.viewMode, after.tokens.viewMode);
  push("Токены", "Главный баннер", before.tokens.heroMode, after.tokens.heroMode);
  push("Токены", "Поиск", before.tokens.searchMode, after.tokens.searchMode);

  // Палитра
  const paletteKeys = Object.keys(before.tokens.palette) as (keyof ThemeConfigBlueprint["tokens"]["palette"])[];
  for (const key of paletteKeys) {
    push("Палитра", key, before.tokens.palette[key], after.tokens.palette[key]);
  }

  // Layout: включение/выключение и режимы блоков
  for (const comp of before.layout) {
    const next = after.layout.find((c) => c.id === comp.id);
    if (!next) continue;
    push("Блоки", `${comp.id} (вкл/выкл)`, comp.enabled ? "вкл" : "выкл", next.enabled ? "вкл" : "выкл");
    push("Блоки", `${comp.id} (режим)`, comp.mode ?? "-", next.mode ?? "-");
  }

  // Контент
  const contentKeys = Object.keys(before.content) as (keyof ThemeConfigBlueprint["content"])[];
  for (const key of contentKeys) {
    const b = before.content[key];
    const a = after.content[key];
    if (Array.isArray(b) || Array.isArray(a)) {
      push("Контент", key, JSON.stringify(b), JSON.stringify(a));
    } else {
      push("Контент", key, b, a);
    }
  }

  // ULTRA-компоненты
  push("Карточки", "Радиус карточки", before.components.productCard.cardBorderRadius, after.components.productCard.cardBorderRadius);
  push("Карточки", "Раскладка", before.components.productCard.cardLayoutVariant, after.components.productCard.cardLayoutVariant);
  push("Карточки", "Рейтинг", before.components.productCard.showRating, after.components.productCard.showRating);
  push("Карточки", "Бейдж наличия", before.components.productCard.stockStatusType, after.components.productCard.stockStatusType);
  push("Карточки", "Бейдж ГОСТ", before.components.productCard.showGostBadge, after.components.productCard.showGostBadge);
  push("Категории", "Стиль", before.components.catalog.categoryStyle, after.components.catalog.categoryStyle);
  push("Категории", "Зерно", before.components.catalog.grainOpacity, after.components.catalog.grainOpacity);
  push("Селектор", "Вариант", before.components.unitSelector.selectVariant, after.components.unitSelector.selectVariant);
  push("Оформление", "Раскладка", before.components.checkout.checkoutLayout, after.components.checkout.checkoutLayout);

  return items;
}

/** Простые и понятные варианты для быстрого выбора */
const PROMPT_TEMPLATES = [
  {
    icon: "🛍️",
    label: "Современный онлайн-магазин",
    prompt:
      "Сделай современный светлый интернет-магазин: чистый белый фон, яркий синий акцент, аккуратные скруглённые углы (12px). Каталог — карточки товаров, сверху большой слайдер акций, поиск с подсказками.",
  },
  {
    icon: "🏭",
    label: "Строгий промышленный стиль (B2B)",
    prompt:
      "Сделай строгий индустриальный сайт для металлобазы: тёмный антрацитовый фон, оранжевый акцент, прямые углы и чёткие разделительные линии. Каталог — подробная таблица ГОСТ, вверху сплит металлопроката и песка.",
  },
  {
    icon: "🏜️",
    label: "Тёплый песочный карьер",
    prompt:
      "Создай тёплый дизайн с акцентом на сыпучие материалы: бежево-песочные тона, терракотовый акцент, мягкие углы. В текстах сделай упор на доставку мытого песка и щебня самосвалами по Москве и МО.",
  },
  {
    icon: "⚡",
    label: "Технологичный хай-тек",
    prompt:
      "Сделай технологичный дизайн: тёмный глубокий фон, неоново-зелёный акцент, тонкие рамки, калькулятор и условия доставки поставь на первое место.",
  },
];

/** Режим работы ИИ-консоли: генерация с нуля или точечное редактирование текущей темы */
type AiMode = "generate" | "edit";

export default function AiCommandConsole() {
  const { blueprint, setBlueprint, setBlueprintMeta } = useStriker();
  const [mode, setMode] = useState<AiMode>("edit");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Diff-превью: предложенный чертёж применяется только после подтверждения
  const [pendingBlueprint, setPendingBlueprint] = useState<ThemeConfigBlueprint | null>(null);
  const [diffItems, setDiffItems] = useState<DiffItem[]>([]);

  const notify = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/striker-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), blueprint, mode }),
      });
      const data = (await res.json()) as { blueprint?: ThemeConfigBlueprint; error?: string };
      if (!res.ok || !data.blueprint) {
        setError(data.error ?? "Не удалось выполнить запрос. Попробуйте ещё раз.");
        return;
      }
      // Diff-превью: не применяем сразу, показываем список изменений
      setPendingBlueprint(data.blueprint);
      setDiffItems(computeBlueprintDiff(blueprint, data.blueprint));
    } catch {
      setError("Ошибка соединения. Пожалуйста, попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  /** Подтвердить и применить предложенный чертёж */
  const applyPending = () => {
    if (!pendingBlueprint) return;
    setBlueprint(pendingBlueprint);
    setBlueprintMeta({ name: blueprint.name });
    setPendingBlueprint(null);
    setDiffItems([]);
    notify(
      mode === "edit"
        ? "🔧 Изменения применены к текущей теме! Остальные параметры сохранены."
        : "✨ Новый дизайн создан и сразу применён в редакторе!"
    );
  };

  /** Отменить предложенный чертёж */
  const cancelPending = () => {
    setPendingBlueprint(null);
    setDiffItems([]);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-card">
      {/* Шапка */}
      <div className="border-b bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-foreground">
              ИИ-Дизайнер сайта
            </div>
            <div className="text-[10px] font-medium text-muted-foreground">
              {mode === "edit"
                ? "Измените текущую тему простыми словами — остальное сохранится"
                : "Создайте дизайн страницы простыми словами"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Режим: генерация с нуля / редактирование текущей темы */}
        <div className="flex rounded-xl border bg-muted/40 p-1">
          <button
            onClick={() => {
              setMode("edit");
              cancelPending();
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition-all ${
              mode === "edit"
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🔧 Изменить текущую тему
          </button>
          <button
            onClick={() => {
              setMode("generate");
              cancelPending();
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition-all ${
              mode === "generate"
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ✨ Создать с нуля
          </button>
        </div>

        {/* Готовые варианты */}
        <div>
          <label className="mb-2 block text-xs font-bold text-foreground">
            1. Выберите готовый стиль или напишите свой:
          </label>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {PROMPT_TEMPLATES.map((t) => (
              <button
                key={t.label}
                onClick={() => setPrompt(t.prompt)}
                className="flex items-start gap-2 rounded-xl border bg-background p-2.5 text-left transition-all hover:border-violet-500 hover:bg-violet-500/5 hover:shadow-xs active:scale-98"
              >
                <span className="text-base">{t.icon}</span>
                <span className="text-xs font-bold leading-tight text-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Текстовое поле */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-bold text-foreground">
              {mode === "edit" ? "2. Что изменить в текущей теме:" : "2. Описание желаемого сайта:"}
            </label>
            <span className="text-[10px] text-muted-foreground">{prompt.length} симв.</span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder={
              mode === "edit"
                ? "Например: Сделай кнопки синими, скругли углы карточек до 12px, добавь блок доставки на первое место..."
                : "Например: Сделай сайт в светлых тонах, кнопки синими, добавь на первое место калькулятор доставки, а в каталог поставь сетку товаров с ценами..."
            }
            className="w-full resize-none rounded-xl border bg-background p-3 text-xs font-medium outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-violet-600/20 transition-all hover:opacity-95 active:scale-98 disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            <span>
              {loading
                ? mode === "edit"
                  ? "Нейросеть применяет изменения..."
                  : "Нейросеть создаёт дизайн..."
                : mode === "edit"
                ? "Применить изменения к теме"
                : "Создать дизайн через нейросеть"}
            </span>
          </button>
        </div>

        {/* Diff-превью: предложенные изменения до применения */}
        <AnimatePresence>
          {pendingBlueprint && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden rounded-xl border border-violet-500/30 bg-violet-500/5"
            >
              <div className="flex items-center justify-between border-b border-violet-500/20 px-3 py-2">
                <span className="text-xs font-black uppercase tracking-wider text-violet-700 dark:text-violet-400">
                  {diffItems.length > 0
                    ? `Предпросмотр изменений (${diffItems.length})`
                    : "Предпросмотр изменений"}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Примените только после проверки
                </span>
              </div>
              {diffItems.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs font-semibold text-muted-foreground">
                  Нейросеть не нашла отличий от текущей темы. Попробуйте уточнить запрос.
                </div>
              ) : (
                <div className="max-h-[220px] space-y-1 overflow-y-auto p-2">
                  {diffItems.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-background/70 p-2 text-[11px]">
                      <span className="mt-0.5 shrink-0 rounded bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                        {d.group}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block font-bold text-foreground">{d.label}</span>
                        <span className="block text-muted-foreground line-through">{d.before}</span>
                        <span className="block font-semibold text-emerald-600 dark:text-emerald-400">
                          → {d.after}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 border-t border-violet-500/20 p-2.5">
                <button
                  onClick={applyPending}
                  className="flex-1 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-violet-600/20 transition-all hover:opacity-95 active:scale-98"
                >
                  ✓ Применить изменения
                </button>
                <button
                  onClick={cancelPending}
                  className="rounded-lg border px-3 py-2 text-xs font-bold text-muted-foreground transition-all hover:bg-muted active:scale-98"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Статусы */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Подсказка для администратора */}
        <div className="rounded-xl border border-dashed bg-muted/20 p-3.5">
          <div className="mb-1 text-xs font-bold text-foreground">💡 Как это работает:</div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {mode === "edit" ? (
              <>
                Нейросеть получит <strong>текущий JSON чертежа</strong> выбранной темы и изменит <strong>только запрошенные параметры</strong>, сохранив остальную матрицу раскладки нетронутой. Затем примените изменения кнопкой <strong>«Сохранить изменения в базу данных»</strong>.
              </>
            ) : (
              <>
                Нейросеть автоматически подберёт гармоничные цвета, настроит блоки и тексты. Вы всегда сможете подправить любые мелочи во вкладке <strong>«Настройки»</strong> или сразу опубликовать результат кнопкой <strong>«Сохранить на сайт»</strong>.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

