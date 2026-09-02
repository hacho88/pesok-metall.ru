// STRIKER.Engine ULTRA — генерация чертежа дизайн-системы из текстового промпта через DeepSeek
import { deepseek, DEEPSEEK_MODELS, requireDeepSeek } from "@/lib/ai/deepseek";
import type {
  ThemeConfigBlueprint,
  ThemeTokens,
  LayoutComponent,
  LayoutComponentId,
  ColorPalette,
  ContentOverrides,
  UltraComponentsConfig,
  CategoryStyle,
  CardBorderRadius,
  CardLayoutVariant,
  StockStatusType,
  SelectVariant,
  CheckoutLayout,
} from "@/types/striker-engine";
import {
  DEFAULT_TOKENS,
  DEFAULT_LAYOUT,
  DEFAULT_CONTENT,
  LAYOUT_COMPONENT_META,
  MATERIAL_PRESETS,
} from "@/types/striker-engine";

const LAYOUT_IDS = Object.keys(LAYOUT_COMPONENT_META) as LayoutComponentId[];
const MATERIAL_IDS = Object.keys(MATERIAL_PRESETS);
const PALETTE_KEYS: (keyof ColorPalette)[] = [
  "background",
  "foreground",
  "card",
  "primary",
  "secondary",
  "muted",
  "mutedForeground",
  "border",
];

const SYSTEM_PROMPT = `Ты — главный дизайн-инженер STRIKER.Engine для pesok-metall.ru (металлопрокат и сыпучие материалы, Москва и МО).

По промпту администратора сгенерируй полный чертёж дизайн-системы витрины. Верни ТОЛЬКО JSON без пояснений и без markdown-обёртки.

Схема JSON:
{
  "tokens": {
    "radius": число 0-16 (0=брутализм, 8=индустриальный, 16=флюидный e-commerce),
    "borderWeight": число 0-4 (толщина линий каркаса в px),
    "noise": число 0-0.15 (прозрачность зерна-шума, имитация песка/стали),
    "material": "${MATERIAL_IDS.join(" | ")}",
    "palette": { "background": "#hex", "foreground": "#hex", "card": "#hex", "primary": "#hex", "secondary": "#hex", "muted": "#hex", "mutedForeground": "#hex", "border": "#hex" },
    "viewMode": "table" | "grid",
    "heroMode": "split" | "promos",
    "searchMode": "compact" | "marketplace",
    "calculatorTabs": { "metal": boolean, "sand": boolean }
  },
  "layout": [
    { "id": "${LAYOUT_IDS.join(" | ")}", "enabled": boolean, "mode": опционально }
  ],
  "content": {
    "phone": "телефон",
    "address": "адрес склада",
    "heroTitleMetal": "заголовок блока металла",
    "heroSubtitleMetal": "подзаголовок металла",
    "heroTitleSand": "заголовок блока сыпучих",
    "heroSubtitleSand": "подзаголовок сыпучих",
    "promoTag": "метка акции",
    "promoTitle": "заголовок акции",
    "promoSubtitle": "подзаголовок акции",
    "catalogTitle": "заголовок каталога",
    "trendingQueries": ["популярный запрос 1", "популярный запрос 2", "..."]
  },
  "components": {
    "catalog": { "categoryStyle": "brutalist-grid | carousel-minimal | masonry-industrial", "grainOpacity": число 0-0.3 },
    "productCard": { "cardBorderRadius": "0px | 4px | 8px | 16px", "cardLayoutVariant": "spreadsheet-row | ecommerce-tile", "showRating": boolean, "stockStatusType": "exact-tonnage | retail-text", "showGostBadge": boolean },
    "unitSelector": { "selectVariant": "heavy-tabs | industrial-dropdown" },
    "checkout": { "checkoutLayout": "split-screen-preview | minimalist-modal-flyout" }
  }
}

Правила:
- layout: массив из 5-11 модулей, порядок = порядок на странице. Обязательно включи hero, catalog и footer.
- Модули: omniSearch (mode: compact|marketplace), hero (mode: split|promos), calculator, catalog (mode: table|grid), advantages, stats, delivery, faq, testimonials, blog, footer.
- Контент — на русском, маркетинговый, с конкретными цифрами и реальными городами МО (Москва, Балашиха, Подольск, Люберцы, Митино).
- Палитра должна быть контрастной и доступной: тёмный фон → светлый текст, светлый фон → тёмный текст.
- Если промпт просит «брутальный/индустриальный» — radius 0-2, borderWeight 2-4, noise 0.05-0.1, components: cardBorderRadius "0px", cardLayoutVariant "spreadsheet-row", categoryStyle "brutalist-grid", selectVariant "heavy-tabs", checkoutLayout "minimalist-modal-flyout".
- Если промпт просит «современный/маркетплейс» — radius 10-16, borderWeight 0-1, noise 0-0.03, components: cardBorderRadius "8px" или "16px", cardLayoutVariant "ecommerce-tile", categoryStyle "carousel-minimal", selectVariant "industrial-dropdown", checkoutLayout "split-screen-preview".
- components управляет ULTRA-компонентами: категории (categoryStyle + зерно-шум grainOpacity), карточка товара (радиус, раскладка, рейтинг, бейдж наличия, бейдж ГОСТ), селектор единиц (вкладки/дропдаун), экран оформления заказа (сплит/флайаут).
- Не выдумывай поля вне схемы.`;

interface RawBlueprint {
  tokens?: Record<string, unknown>;
  layout?: unknown[];
  content?: Record<string, unknown>;
  /** ULTRA-конфигурация компонентов (может приходить как components или blocks) */
  components?: Record<string, unknown>;
  blocks?: Record<string, unknown>;
}

/** Проверка значения на принадлежность перечислению */
function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const v = String(value ?? "");
  return (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asHex(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  return /^#[0-9a-fA-F]{6}$/.test(value.trim()) ? value.trim() : fallback;
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0).slice(0, 8);
  return items.length > 0 ? items : fallback;
}

/** Приводит ответ модели к валидному чертежу: клампы, дефолты, известные модули */
export function normalizeStrikerBlueprint(raw: unknown, current: ThemeConfigBlueprint): ThemeConfigBlueprint {
  const obj = (raw ?? {}) as RawBlueprint;
  const rawTokens = (obj.tokens ?? {}) as Record<string, unknown>;
  const rawPalette = (rawTokens.palette ?? {}) as Record<string, unknown>;
  const rawContent = (obj.content ?? {}) as Record<string, unknown>;

  // ULTRA: компоненты могут прийти как components или blocks (обратная совместимость)
  const rawComponents = (obj.components ?? obj.blocks ?? {}) as Record<string, unknown>;
  const rawCatalog = (rawComponents.catalog ?? {}) as Record<string, unknown>;
  const rawProductCard = (rawComponents.productCard ?? {}) as Record<string, unknown>;
  const rawUnitSelector = (rawComponents.unitSelector ?? {}) as Record<string, unknown>;
  const rawCheckout = (rawComponents.checkout ?? {}) as Record<string, unknown>;

  // blocks.catalog.viewMode ("product-grid") → tokens.viewMode ("grid")
  const blocksViewMode = String(rawCatalog.viewMode ?? "");
  const mappedViewMode = blocksViewMode === "product-grid" ? "grid" : blocksViewMode === "table" ? "table" : "";

  const material = MATERIAL_IDS.includes(String(rawTokens.material)) ? (String(rawTokens.material) as ThemeTokens["material"]) : current.tokens.material;

  const palette: ColorPalette = { ...current.tokens.palette };
  for (const key of PALETTE_KEYS) {
    palette[key] = asHex(rawPalette[key], current.tokens.palette[key]);
  }

  const tokens: ThemeTokens = {
    radius: clampNumber(rawTokens.radius, 0, 16, current.tokens.radius),
    borderWeight: clampNumber(rawTokens.borderWeight, 0, 4, current.tokens.borderWeight),
    noise: clampNumber(rawTokens.noise, 0, 0.15, current.tokens.noise),
    material,
    palette,
    viewMode: rawTokens.viewMode === "grid" ? "grid" : rawTokens.viewMode === "table" ? "table" : mappedViewMode ? (mappedViewMode as ThemeTokens["viewMode"]) : current.tokens.viewMode,
    heroMode: rawTokens.heroMode === "promos" ? "promos" : rawTokens.heroMode === "split" ? "split" : current.tokens.heroMode,
    searchMode: rawTokens.searchMode === "marketplace" ? "marketplace" : rawTokens.searchMode === "compact" ? "compact" : current.tokens.searchMode,
    calculatorTabs: {
      metal: typeof rawTokens.calculatorTabs === "object" && rawTokens.calculatorTabs !== null
        ? Boolean((rawTokens.calculatorTabs as Record<string, unknown>).metal ?? current.tokens.calculatorTabs.metal)
        : current.tokens.calculatorTabs.metal,
      sand: typeof rawTokens.calculatorTabs === "object" && rawTokens.calculatorTabs !== null
        ? Boolean((rawTokens.calculatorTabs as Record<string, unknown>).sand ?? current.tokens.calculatorTabs.sand)
        : current.tokens.calculatorTabs.sand,
    },
  };

  // Layout: сохраняем известные модули, порядок = порядок ответа модели
  const layout: LayoutComponent[] = [];
  if (Array.isArray(obj.layout)) {
    for (const rawItem of obj.layout) {
      const item = (rawItem ?? {}) as Record<string, unknown>;
      const id = String(item.id ?? "");
      if (!LAYOUT_IDS.includes(id as LayoutComponentId)) continue;
      const prev = current.layout.find((c) => c.id === id);
      layout.push({
        id: id as LayoutComponentId,
        enabled: typeof item.enabled === "boolean" ? item.enabled : (prev?.enabled ?? true),
        mode: typeof item.mode === "string" && item.mode ? String(item.mode) : prev?.mode,
      });
    }
  }
  // Модули, которые модель не упомянула, — в конец с текущими настройками
  for (const prev of current.layout) {
    if (!layout.some((c) => c.id === prev.id)) layout.push(prev);
  }
  if (!layout.some((c) => c.id === "hero")) {
    layout.unshift({ id: "hero", enabled: true, mode: tokens.heroMode });
  }
  if (!layout.some((c) => c.id === "catalog")) {
    layout.push({ id: "catalog", enabled: true, mode: tokens.viewMode });
  }
  if (!layout.some((c) => c.id === "footer")) {
    layout.push({ id: "footer", enabled: true });
  }

  const components: UltraComponentsConfig = {
    catalog: {
      categoryStyle: asEnum<CategoryStyle>(
        rawCatalog.categoryStyle,
        ["brutalist-grid", "carousel-minimal", "masonry-industrial"],
        current.components.catalog.categoryStyle
      ),
      grainOpacity: clampNumber(rawCatalog.grainOpacity, 0, 0.3, current.components.catalog.grainOpacity),
    },
    productCard: {
      cardBorderRadius: asEnum<CardBorderRadius>(
        rawProductCard.cardBorderRadius,
        ["0px", "4px", "8px", "16px"],
        current.components.productCard.cardBorderRadius
      ),
      cardLayoutVariant: asEnum<CardLayoutVariant>(
        rawProductCard.cardLayoutVariant,
        ["spreadsheet-row", "ecommerce-tile"],
        current.components.productCard.cardLayoutVariant
      ),
      showRating: typeof rawProductCard.showRating === "boolean" ? rawProductCard.showRating : current.components.productCard.showRating,
      stockStatusType: asEnum<StockStatusType>(
        rawProductCard.stockStatusType,
        ["exact-tonnage", "retail-text"],
        current.components.productCard.stockStatusType
      ),
      showGostBadge: typeof rawProductCard.showGostBadge === "boolean" ? rawProductCard.showGostBadge : current.components.productCard.showGostBadge,
    },
    unitSelector: {
      selectVariant: asEnum<SelectVariant>(
        rawUnitSelector.selectVariant,
        ["heavy-tabs", "industrial-dropdown"],
        current.components.unitSelector.selectVariant
      ),
    },
    checkout: {
      checkoutLayout: asEnum<CheckoutLayout>(
        rawCheckout.checkoutLayout,
        ["split-screen-preview", "minimalist-modal-flyout"],
        current.components.checkout.checkoutLayout
      ),
    },
  };

  const content: ContentOverrides = {
    phone: asString(rawContent.phone, current.content.phone),
    address: asString(rawContent.address, current.content.address),
    heroTitleMetal: asString(rawContent.heroTitleMetal, current.content.heroTitleMetal),
    heroSubtitleMetal: asString(rawContent.heroSubtitleMetal, current.content.heroSubtitleMetal),
    heroTitleSand: asString(rawContent.heroTitleSand, current.content.heroTitleSand),
    heroSubtitleSand: asString(rawContent.heroSubtitleSand, current.content.heroSubtitleSand),
    promoTag: asString(rawContent.promoTag, current.content.promoTag),
    promoTitle: asString(rawContent.promoTitle, current.content.promoTitle),
    promoSubtitle: asString(rawContent.promoSubtitle, current.content.promoSubtitle),
    catalogTitle: asString(rawContent.catalogTitle, current.content.catalogTitle),
    trendingQueries: asStringArray(rawContent.trendingQueries, current.content.trendingQueries),
  };

  return {
    ...current,
    tokens,
    layout,
    content,
    components,
    updatedAt: new Date().toISOString(),
  };
}

/** Генерация чертежа по промпту (макро-стайлинг через ИИ) */
export async function generateStrikerBlueprint(
  prompt: string,
  current: ThemeConfigBlueprint
): Promise<ThemeConfigBlueprint> {
  requireDeepSeek();

  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.chat,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Промпт администратора: ${prompt}\n\nТекущий чертёж (контекст, можешь частично сохранять):\n${JSON.stringify({
          tokens: current.tokens,
          layout: current.layout,
          content: current.content,
          components: current.components,
        })}\n\nВерни JSON чертежа.`,
      },
    ],
    temperature: 0.9,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Модель вернула пустой ответ");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!match) throw new Error("Модель вернула невалидный JSON");
    parsed = JSON.parse(match[1]);
  }

  return normalizeStrikerBlueprint(parsed, current);
}

/* ============================================================
 * EDITING MODE — гибридный промпт-редактор текущей темы.
 * Админ отправляет промпт + ТЕКУЩИЙ JSON чертежа; модель меняет
 * ТОЛЬКО запрошенные параметры, сохраняя остальную матрицу.
 * ============================================================ */

const EDIT_SYSTEM_PROMPT = `Ты — движок модификации интерфейса STRIKER.Engine для pesok-metall.ru (промышленный сайт металлопроката и сыпучих материалов, Москва и МО).
Ты получаешь текстовый промпт администратора и ТЕКУЩУЮ JSON-структуру темы.
Твоя задача — изменить ТОЛЬКО те параметры, которые запросил пользователь, сохранив остальную матрицу раскладки нетронутой.
Верни ТОЛЬКО модифицированный JSON, строго соответствующий базовой схеме. Без пояснений и без markdown-обёртки.

Базовая схема JSON:
{
  "tokens": { "radius": 0-16, "borderWeight": 0-4, "noise": 0-0.15, "material": "${MATERIAL_IDS.join(" | ")}", "palette": { "background": "#hex", "foreground": "#hex", "card": "#hex", "primary": "#hex", "secondary": "#hex", "muted": "#hex", "mutedForeground": "#hex", "border": "#hex" }, "viewMode": "table|grid", "heroMode": "split|promos", "searchMode": "compact|marketplace", "calculatorTabs": { "metal": boolean, "sand": boolean } },
  "layout": [ { "id": "${LAYOUT_IDS.join(" | ")}", "enabled": boolean, "mode": опционально } ],
  "content": { "phone": "телефон", "address": "адрес", "heroTitleMetal": "текст", "heroSubtitleMetal": "текст", "heroTitleSand": "текст", "heroSubtitleSand": "текст", "promoTag": "метка", "promoTitle": "текст", "promoSubtitle": "текст", "catalogTitle": "текст", "trendingQueries": ["запрос"] },
  "components": { "catalog": { "categoryStyle": "brutalist-grid|carousel-minimal|masonry-industrial", "grainOpacity": 0-0.3 }, "productCard": { "cardBorderRadius": "0px|4px|8px|16px", "cardLayoutVariant": "spreadsheet-row|ecommerce-tile", "showRating": boolean, "stockStatusType": "exact-tonnage|retail-text", "showGostBadge": boolean }, "unitSelector": { "selectVariant": "heavy-tabs|industrial-dropdown" }, "checkout": { "checkoutLayout": "split-screen-preview|minimalist-modal-flyout" } }
}

Правила редактирования:
- Меняй ТОЛЬКО запрошенные пользователем поля. Все остальные поля копируй из текущего чертежа БЕЗ изменений.
- Цвет/радиус/линии/шрифты → tokens. Тексты → content. Включение/выключение блоков → layout.enabled. Карточки/категории/селекторы/оформление → components.
- Не выдумывай поля вне схемы. Не пересоздавай тему с нуля.`;

/** Редактирование текущей темы по промпту (точечная модификация через ИИ) */
export async function editStrikerBlueprint(
  prompt: string,
  current: ThemeConfigBlueprint
): Promise<ThemeConfigBlueprint> {
  requireDeepSeek();

  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.chat,
    messages: [
      { role: "system", content: EDIT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Промпт администратора: ${prompt}\n\nТЕКУЩИЙ JSON чертежа (модифицируй только запрошенное, остальное сохрани как есть):\n${JSON.stringify({
          tokens: current.tokens,
          layout: current.layout,
          content: current.content,
          components: current.components,
        })}\n\nВерни JSON чертежа.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Модель вернула пустой ответ");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!match) throw new Error("Модель вернула невалидный JSON");
    parsed = JSON.parse(match[1]);
  }

  return normalizeStrikerBlueprint(parsed, current);
}
