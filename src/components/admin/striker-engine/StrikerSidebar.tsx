"use client";

import { useState, type ReactNode } from "react";
import {
  Save,
  Trash2,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Layers,
  ChevronDown,
  Loader2,
  Palette,
  LayoutList,
  Type,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Sliders,
  LayoutGrid,
  Star,
  BadgeCheck,
  ShoppingCart,
  Gauge,
} from "lucide-react";
import { useStriker } from "./StrikerContext";
import {
  MATERIAL_PRESETS,
  LAYOUT_COMPONENT_META,
  type MaterialPreset,
  type LayoutComponent,
  type LayoutComponentId,
} from "@/types/striker-engine";
import { saveBlueprintAction, applyBlueprintAction, deleteBlueprintAction } from "@/app/admin/striker-engine/actions";
import type { ThemeConfigBlueprint } from "@/types/striker-engine";

interface StrikerSidebarProps {
  saved: ThemeConfigBlueprint[];
  onLoad: (bp: ThemeConfigBlueprint) => void;
}

const MATERIAL_LABELS: Record<MaterialPreset, { name: string; desc: string }> = {
  anthracite: { name: "Тёмный антрацит", desc: "Строгий промышленный B2B стиль" },
  chrome: { name: "Светлая сталь", desc: "Чистый современный маркетплейс" },
  desert: { name: "Тёплый песок", desc: "Песочно-терракотовая палитра" },
  concrete: { name: "Серый бетон", desc: "Архитектурный минимализм" },
};

export default function StrikerSidebar({ saved, onLoad }: StrikerSidebarProps) {
  const {
    blueprint,
    updateTokens,
    setMaterial,
    setPaletteColor,
    toggleComponent,
    moveComponent,
    updateContent,
    updateComponents,
    setTrendingQueries,
    setBlueprintMeta,
  } = useStriker();

  const [open, setOpen] = useState<string[]>(["tokens", "layout", "content"]);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { tokens } = blueprint;

  const toggle = (id: string) =>
    setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveBlueprintAction({
      slug: blueprint.slug,
      name: blueprint.name,
      tokens: blueprint.tokens,
      layout: blueprint.layout,
      content: blueprint.content,
    });
    setSaving(false);
    if (res.ok) {
      setBlueprintMeta({ slug: res.slug });
      notify("Тема сохранена в базу");
    } else {
      notify(`Ошибка: ${res.error}`);
    }
  };

  const handleApply = async (id: string) => {
    setApplying(id);
    const res = await applyBlueprintAction(id);
    setApplying(null);
    notify(res.ok ? "Тема успешно включена на сайте" : `Ошибка: ${res.error}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить эту сохранённую тему?")) return;
    setDeleting(id);
    const res = await deleteBlueprintAction(id);
    setDeleting(null);
    notify(res.ok ? "Тема удалена" : `Ошибка: ${res.error}`);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-card">
      {/* Шапка боковой панели */}
      <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-black text-white shadow-xs">
            <Sliders className="h-4 w-4" />
          </span>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-foreground">
              Панель настроек
            </div>
            <div className="text-[10px] font-medium text-muted-foreground">
              Цвета, структура и тексты сайта
            </div>
          </div>
        </div>

        {feedback && (
          <span className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary">
            {feedback}
          </span>
        )}
      </div>

      {/* Список разделов */}
      <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
        {/* РАЗДЕЛ 1: Цвета и внешний вид */}
        <AccordionSection
          id="tokens"
          open={open}
          onToggle={toggle}
          icon={Palette}
          title="Внешний вид и цвета"
          badge={MATERIAL_LABELS[tokens.material]?.name ?? "Стиль"}
        >
          {/* Готовые цветовые темы */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-foreground">
              1. Цветовая тема сайта
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(MATERIAL_PRESETS) as MaterialPreset[]).map((m) => {
                const p = MATERIAL_PRESETS[m];
                const active = tokens.material === m;
                const info = MATERIAL_LABELS[m];
                return (
                  <button
                    key={m}
                    onClick={() => setMaterial(m)}
                    className={`flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "hover:border-foreground/30 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-md border"
                        style={{ background: p.background, borderColor: p.border }}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ background: p.primary }} />
                      </span>
                      {active && <span className="text-[10px] font-black text-primary">✓ Выбрано</span>}
                    </div>
                    <span className="text-xs font-bold leading-tight text-foreground">{info.name}</span>
                    <span className="text-[9px] text-muted-foreground line-clamp-1">{info.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Вид каталога товаров */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-foreground">
              2. Отображение каталога товаров
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateTokens({ viewMode: "table" })}
                className={`flex flex-col gap-1 rounded-xl border p-2.5 text-left transition-all ${
                  tokens.viewMode === "table"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30 font-bold"
                    : "hover:bg-muted/40"
                }`}
              >
                <span className="text-xs font-bold">📋 Таблица ГОСТ</span>
                <span className="text-[10px] text-muted-foreground">Плотный список с ценами и весом</span>
              </button>
              <button
                onClick={() => updateTokens({ viewMode: "grid" })}
                className={`flex flex-col gap-1 rounded-xl border p-2.5 text-left transition-all ${
                  tokens.viewMode === "grid"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30 font-bold"
                    : "hover:bg-muted/40"
                }`}
              >
                <span className="text-xs font-bold">🛍️ Сетка карточек</span>
                <span className="text-[10px] text-muted-foreground">Крупные карточки товаров</span>
              </button>
            </div>
          </div>

          {/* Главный баннер */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-foreground">
              3. Главный баннер (вверху сайта)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateTokens({ heroMode: "split" })}
                className={`rounded-xl border p-2 text-left text-xs transition-all ${
                  tokens.heroMode === "split"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30 font-bold"
                    : "hover:bg-muted/40"
                }`}
              >
                <span className="font-bold">⚡ Разделённый</span>
                <span className="block text-[10px] text-muted-foreground">Металл и Песок рядом</span>
              </button>
              <button
                onClick={() => updateTokens({ heroMode: "promos" })}
                className={`rounded-xl border p-2 text-left text-xs transition-all ${
                  tokens.heroMode === "promos"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30 font-bold"
                    : "hover:bg-muted/40"
                }`}
              >
                <span className="font-bold">🎯 Слайдер акций</span>
                <span className="block text-[10px] text-muted-foreground">Большие промо-баннеры</span>
              </button>
            </div>
          </div>

          {/* Скругление углов */}
          <div className="mb-3 rounded-xl border bg-muted/20 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Скругление углов кнопок и карточек</span>
              <span className="text-xs font-black text-primary">
                {tokens.radius === 0 ? "Прямые (0px)" : tokens.radius <= 6 ? "Мягкие (4-6px)" : "Круглые (12-16px)"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={16}
              step={2}
              value={tokens.radius}
              onChange={(e) => updateTokens({ radius: Number(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[9px] font-semibold text-muted-foreground">
              <span>Прямые (0px)</span>
              <span>Средние (8px)</span>
              <span>Круглые (16px)</span>
            </div>
          </div>

          {/* Толщина рамок */}
          <div className="mb-3 rounded-xl border bg-muted/20 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Толщина разделительных линий</span>
              <span className="text-xs font-black text-primary">{tokens.borderWeight}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={tokens.borderWeight}
              onChange={(e) => updateTokens({ borderWeight: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          {/* Индивидуальные цвета */}
          <div className="rounded-xl border bg-muted/20 p-3">
            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-foreground">
              Настройка отдельных цветов
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["background", "Фон сайта"],
                  ["foreground", "Цвет текста"],
                  ["card", "Цвет карточек"],
                  ["primary", "Главный акцент"],
                  ["border", "Цвет линий"],
                  ["muted", "Серый фон"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 rounded-lg border bg-background p-1.5">
                  <input
                    type="color"
                    value={tokens.palette[key]}
                    onChange={(e) => setPaletteColor(key, e.target.value)}
                    className="h-6 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-bold">{label}</span>
                    <span className="block font-mono text-[9px] text-muted-foreground uppercase">{tokens.palette[key]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionSection>

        {/* РАЗДЕЛ 2: Блоки на главной странице */}
        <AccordionSection
          id="layout"
          open={open}
          onToggle={toggle}
          icon={LayoutList}
          title="Блоки на главной странице"
          badge={`${blueprint.layout.filter((c) => c.enabled).length} из ${blueprint.layout.length} вкл.`}
        >
          <p className="mb-3 text-[11px] text-muted-foreground">
            Включайте нужные блоки и меняйте их порядок стрелочками:
          </p>
          <div className="space-y-1.5">
            {blueprint.layout.map((c, i) => {
              const meta = LAYOUT_COMPONENT_META[c.id];
              return (
                <div
                  key={c.id}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 transition-colors ${
                    c.enabled ? "bg-background border-border" : "bg-muted/40 border-dashed opacity-60"
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-black text-muted-foreground">
                    {i + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">{meta?.label ?? c.id}</span>
                      {!c.enabled && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                          Скрыт
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{meta?.description}</div>
                  </div>

                  {/* Кнопки перемещения вверх/вниз */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => moveComponent(c.id, -1)}
                      disabled={i === 0}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20"
                      title="Поднять выше"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveComponent(c.id, 1)}
                      disabled={i === blueprint.layout.length - 1}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20"
                      title="Опустить ниже"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Кнопка вкл/выкл */}
                  <button
                    onClick={() => toggleComponent(c.id)}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
                      c.enabled
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    title={c.enabled ? "Скрыть блок" : "Показать блок"}
                  >
                    {c.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    <span className="text-[10px]">{c.enabled ? "Вкл" : "Выкл"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </AccordionSection>

        {/* РАЗДЕЛ 2.5: ULTRA — карточки, категории, селекторы, оформление */}
        <AccordionSection
          id="ultra"
          open={open}
          onToggle={toggle}
          icon={Gauge}
          title="ULTRA: компоненты"
          badge="Карточки · Категории"
        >
          <div className="space-y-4">
            {/* --- Категории --- */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-foreground">
                <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                Витрина категорий
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {(
                  [
                    ["brutalist-grid", "Брутальная сетка", "Рамки 1px, тяжёлый капс"],
                    ["carousel-minimal", "Мини-карусель", "Свайп-лента с иконками"],
                    ["masonry-industrial", "Кирпич", "Разноуровневые плиты"],
                  ] as const
                ).map(([key, name, desc]) => (
                  <button
                    key={key}
                    onClick={() => updateComponents({ catalog: { ...blueprint.components.catalog, categoryStyle: key } })}
                    className={`flex items-center justify-between rounded-xl border p-2 text-left transition-all ${
                      blueprint.components.catalog.categoryStyle === key
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <span>
                      <span className="block text-xs font-bold text-foreground">{name}</span>
                      <span className="block text-[9px] text-muted-foreground">{desc}</span>
                    </span>
                    {blueprint.components.catalog.categoryStyle === key && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Зерно-шум категорий */}
              <div className="mt-2 rounded-xl border bg-muted/20 p-2.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground">Зерно-шум на категориях</span>
                  <span className="text-[10px] font-black text-primary">
                    {Math.round(blueprint.components.catalog.grainOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.3}
                  step={0.01}
                  value={blueprint.components.catalog.grainOpacity}
                  onChange={(e) =>
                    updateComponents({ catalog: { ...blueprint.components.catalog, grainOpacity: Number(e.target.value) } })
                  }
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* --- Карточка товара --- */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-foreground">
                <Star className="h-3.5 w-3.5 text-primary" />
                Карточка товара
              </label>

              {/* Радиус карточки */}
              <div className="mb-2 grid grid-cols-4 gap-1.5">
                {(["0px", "4px", "8px", "16px"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => updateComponents({ productCard: { ...blueprint.components.productCard, cardBorderRadius: r } })}
                    className={`rounded-xl border p-1.5 text-center text-[10px] font-black transition-all ${
                      blueprint.components.productCard.cardBorderRadius === r
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30 text-primary"
                        : "text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Вариант раскладки */}
              <div className="mb-2 grid grid-cols-2 gap-1.5">
                {(
                  [
                    ["spreadsheet-row", "Строка-таблица", "Компактный ряд с ценой"],
                    ["ecommerce-tile", "Премиум-плитка", "Крупная карточка"],
                  ] as const
                ).map(([key, name, desc]) => (
                  <button
                    key={key}
                    onClick={() => updateComponents({ productCard: { ...blueprint.components.productCard, cardLayoutVariant: key } })}
                    className={`flex flex-col items-start rounded-xl border p-2 text-left transition-all ${
                      blueprint.components.productCard.cardLayoutVariant === key
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-xs font-bold text-foreground">{name}</span>
                    <span className="text-[9px] text-muted-foreground">{desc}</span>
                  </button>
                ))}
              </div>

              {/* Бейдж наличия */}
              <div className="mb-2 grid grid-cols-2 gap-1.5">
                {(
                  [
                    ["exact-tonnage", "Точный тоннаж", "«14.2 тонн на складе»"],
                    ["retail-text", "Розничный текст", "«В наличии»"],
                  ] as const
                ).map(([key, name, desc]) => (
                  <button
                    key={key}
                    onClick={() => updateComponents({ productCard: { ...blueprint.components.productCard, stockStatusType: key } })}
                    className={`flex flex-col items-start rounded-xl border p-2 text-left transition-all ${
                      blueprint.components.productCard.stockStatusType === key
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-xs font-bold text-foreground">{name}</span>
                    <span className="text-[9px] text-muted-foreground">{desc}</span>
                  </button>
                ))}
              </div>

              {/* Переключатели: рейтинг и ГОСТ */}
              <div className="grid grid-cols-2 gap-1.5">
                <ToggleRow
                  label="Рейтинг звёзд"
                  checked={blueprint.components.productCard.showRating}
                  onChange={(v) => updateComponents({ productCard: { ...blueprint.components.productCard, showRating: v } })}
                />
                <ToggleRow
                  label="Бейдж ГОСТ"
                  checked={blueprint.components.productCard.showGostBadge}
                  onChange={(v) => updateComponents({ productCard: { ...blueprint.components.productCard, showGostBadge: v } })}
                />
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* --- Селектор единиц --- */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-foreground">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                Селектор единиц (Matrix Selects)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    ["heavy-tabs", "Тяжёлые вкладки", "Метры / Тонны / Штуки"],
                    ["industrial-dropdown", "Выпадающий", "Минималистичный список"],
                  ] as const
                ).map(([key, name, desc]) => (
                  <button
                    key={key}
                    onClick={() => updateComponents({ unitSelector: { selectVariant: key } })}
                    className={`flex flex-col items-start rounded-xl border p-2 text-left transition-all ${
                      blueprint.components.unitSelector.selectVariant === key
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-xs font-bold text-foreground">{name}</span>
                    <span className="text-[9px] text-muted-foreground">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* --- Оформление заказа --- */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-foreground">
                <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                Быстрое оформление заказа
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    ["split-screen-preview", "Сплит-превью", "Корзина слева, форма справа"],
                    ["minimalist-modal-flyout", "Мини-флайаут", "Компактная форма в модалке"],
                  ] as const
                ).map(([key, name, desc]) => (
                  <button
                    key={key}
                    onClick={() => updateComponents({ checkout: { checkoutLayout: key } })}
                    className={`flex flex-col items-start rounded-xl border p-2 text-left transition-all ${
                      blueprint.components.checkout.checkoutLayout === key
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-xs font-bold text-foreground">{name}</span>
                    <span className="text-[9px] text-muted-foreground">{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AccordionSection>


        {/* РАЗДЕЛ 3: Тексты и контакты */}
        <AccordionSection
          id="content"
          open={open}
          onToggle={toggle}
          icon={Type}
          title="Контакты и тексты на сайте"
          badge="Телефон, адрес, акции"
        >
          <div className="space-y-3">
            <TextField
              label="📞 Номер телефона"
              hint="Отображается в шапке и подвале сайта"
              value={blueprint.content.phone}
              onChange={(v) => updateContent({ phone: v })}
            />
            <TextField
              label="📍 Адрес склада / офиса"
              hint="Отображается в контактах"
              value={blueprint.content.address}
              onChange={(v) => updateContent({ address: v })}
            />

            <div className="h-px bg-border" />

            <TextField
              label="Текст плашки акции (Тег)"
              hint="Например: Акция, Хит, Спецпредложение"
              value={blueprint.content.promoTag}
              onChange={(v) => updateContent({ promoTag: v })}
            />
            <TextField
              label="Заголовок акции"
              hint="Например: Арматура А500С со скидкой 8%"
              value={blueprint.content.promoTitle}
              onChange={(v) => updateContent({ promoTitle: v })}
            />
            <TextField
              label="Условия акции"
              hint="Например: При заказе от 5 тонн с доставкой"
              value={blueprint.content.promoSubtitle}
              onChange={(v) => updateContent({ promoSubtitle: v })}
            />

            <div className="h-px bg-border" />

            <TextField
              label="Заголовок блока каталога"
              hint="Например: Прайс-лист металлопроката и сыпучих"
              value={blueprint.content.catalogTitle}
              onChange={(v) => updateContent({ catalogTitle: v })}
            />

            {/* Популярные подсказки в поиске */}
            <div>
              <label className="mb-1 block text-xs font-bold text-foreground">
                Популярные подсказки в поиске:
              </label>
              <div className="space-y-1.5">
                {blueprint.content.trendingQueries.map((q, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input
                      value={q}
                      onChange={(e) => {
                        const next = [...blueprint.content.trendingQueries];
                        next[i] = e.target.value;
                        setTrendingQueries(next);
                      }}
                      className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={() => setTrendingQueries(blueprint.content.trendingQueries.filter((_, x) => x !== i))}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Удалить"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setTrendingQueries([...blueprint.content.trendingQueries, "Новый товар"])}
                  className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-xs font-bold text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" /> Добавить подсказку
                </button>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* РАЗДЕЛ 4: Сохранённые темы */}
        <AccordionSection
          id="saved"
          open={open}
          onToggle={toggle}
          icon={Layers}
          title="Сохранённые темы"
          badge={`${saved.length}`}
        >
          {saved.length === 0 ? (
            <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
              Пока нет сохранённых тем. Нажмите «Сохранить в базу тем», чтобы сохранить текущий вид.
            </div>
          ) : (
            <div className="space-y-2">
              {saved.map((bp) => (
                <div
                  key={bp.id}
                  className={`rounded-xl border p-3 transition-all ${
                    bp.slug === blueprint.slug ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-black text-foreground">{bp.name}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(bp.updatedAt).toLocaleDateString("ru-RU")}</div>
                    </div>
                    {bp.slug === blueprint.slug && (
                      <span className="flex shrink-0 items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        <Check className="h-3 w-3" /> В редакторе
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <button
                      onClick={() => onLoad(bp)}
                      className="flex-1 rounded-lg bg-muted px-2 py-1.5 text-xs font-bold hover:bg-muted-foreground/20"
                    >
                      Открыть
                    </button>
                    <button
                      onClick={() => handleApply(bp.id)}
                      disabled={applying === bp.id}
                      className="flex-1 rounded-lg bg-emerald-600 px-2 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {applying === bp.id ? <Loader2 className="mx-auto h-3 w-3 animate-spin" /> : "Включить"}
                    </button>
                    <button
                      onClick={() => handleDelete(bp.id)}
                      disabled={deleting === bp.id}
                      className="rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20 disabled:opacity-50"
                      title="Удалить"
                    >
                      {deleting === bp.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border bg-background px-3 py-2 text-xs font-bold transition-all hover:bg-muted active:scale-98 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 text-primary" />}
              <span>Сохранить текущую тему в базу</span>
            </button>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}

/* Вспомогательные компоненты */

function AccordionSection({
  id,
  open,
  onToggle,
  icon: Icon,
  title,
  badge,
  children,
}: {
  id: string;
  open: string[];
  onToggle: (id: string) => void;
  icon: any;
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  const isOpen = open.includes(id);
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-2xs">
      <button
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-2 p-3 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate text-xs font-black uppercase tracking-wider text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {badge && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {badge}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>
      {isOpen && <div className="border-t bg-card p-3">{children}</div>}
    </div>
  );
}

function TextField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-0.5 block text-xs font-bold text-foreground">{label}</label>
      {hint && <span className="mb-1 block text-[10px] text-muted-foreground">{hint}</span>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border bg-background px-3 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

/** ULTRA: переключатель вкл/выкл для булевых опций компонентов */
function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-2 rounded-xl border p-2 text-left transition-all ${
        checked ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "hover:bg-muted/40"
      }`}
    >
      <span className="text-xs font-bold text-foreground">{label}</span>
      <span
        className={`relative h-4.5 w-8 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-all ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
