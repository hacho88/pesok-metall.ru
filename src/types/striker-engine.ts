/**
 * STRIKER.Engine — Steel & Rock Industrial Customizer
 * Типы дизайн-системы и архитектуры страницы витрины.
 */
import type { CSSProperties } from "react";

/** Палитра дизайн-токенов (CSS-переменные темы) */
export interface ColorPalette {
  background: string;
  foreground: string;
  card: string;
  primary: string;
  secondary: string;
  muted: string;
  mutedForeground: string;
  border: string;
}

/** Базовые материалы-пресеты палитры */
export type MaterialPreset = "anthracite" | "chrome" | "desert" | "concrete";

/** Идентификаторы модулей структурного каркаса страницы */
export type LayoutComponentId =
  | "omniSearch"
  | "hero"
  | "calculator"
  | "catalog"
  | "advantages"
  | "stats"
  | "delivery"
  | "faq"
  | "testimonials"
  | "blog"
  | "footer";

/** Модуль структурного каркаса (порядок = приоритет на странице) */
export interface LayoutComponent {
  id: LayoutComponentId;
  enabled: boolean;
  /** Режим модуля, зависит от типа: searchMode / heroMode / viewMode / calculatorTabs */
  mode?: string;
}

/** Дизайн-токены витрины */
export interface ThemeTokens {
  /** Радиус скругления: 0 = абсолютный брутализм, 16 = флюидный e-commerce */
  radius: number;
  /** Толщина линий каркаса (0–4px) */
  borderWeight: number;
  /** Прозрачность зерна-шума (0–0.15) — имитация физического песка */
  noise: number;
  /** Базовый материал палитры */
  material: MaterialPreset;
  /** Полная палитра (переопределяет материал) */
  palette: ColorPalette;
  /** Режим каталога: плотная таблица или e-commerce сетка */
  viewMode: "table" | "grid";
  /** Режим hero: сплит-скрин или слайдер промо */
  heroMode: "split" | "promos";
  /** Режим омни-поиска: компактный технический или маркетплейс-дропдаун */
  searchMode: "compact" | "marketplace";
  /** Вкладки промышленного калькулятора */
  calculatorTabs: { metal: boolean; sand: boolean };
}

/** Контентные переопределения (Content Overrides) — тексты витрины */
export interface ContentOverrides {
  phone: string;
  address: string;
  heroTitleMetal: string;
  heroSubtitleMetal: string;
  heroTitleSand: string;
  heroSubtitleSand: string;
  promoTag: string;
  promoTitle: string;
  promoSubtitle: string;
  catalogTitle: string;
  trendingQueries: string[];
}

/* ============================================================
 * STRIKER.Engine ULTRA — модульные конфигурации компонентов.
 * Админ управляет точной геометрией карточек, категорий,
 * селекторов единиц измерения и экрана быстрого оформления.
 * ============================================================ */

/** Стиль структурной раскладки категорий на главной */
export type CategoryStyle = "brutalist-grid" | "carousel-minimal" | "masonry-industrial";

/** Радиус скругления карточек товаров */
export type CardBorderRadius = "0px" | "4px" | "8px" | "16px";

/** Архитектурный вариант карточки товара */
export type CardLayoutVariant = "spreadsheet-row" | "ecommerce-tile";

/** Формат бейджа наличия на складе */
export type StockStatusType = "exact-tonnage" | "retail-text";

/** Дизайн селектора единиц измерения (Matrix Selects) */
export type SelectVariant = "heavy-tabs" | "industrial-dropdown";

/** Раскладка экрана быстрого оформления заказа */
export type CheckoutLayout = "split-screen-preview" | "minimalist-modal-flyout";

/** Конфигурация витрины категорий (CategoryLayout) */
export interface CatalogComponentsConfig {
  categoryStyle: CategoryStyle;
  /** Прозрачность зерна-шума поверх изображений категорий (0–1) */
  grainOpacity: number;
}

/** Конфигурация карточки товара (ProductCard) */
export interface ProductCardComponentsConfig {
  cardBorderRadius: CardBorderRadius;
  cardLayoutVariant: CardLayoutVariant;
  /** Блок рейтинга звёзд */
  showRating: boolean;
  stockStatusType: StockStatusType;
  /** Бейдж ГОСТ */
  showGostBadge: boolean;
}

/** Конфигурация умного селектора единиц (UnitSelector) */
export interface UnitSelectorComponentsConfig {
  selectVariant: SelectVariant;
}

/** Конфигурация быстрого оформления (FastCheckout) */
export interface CheckoutComponentsConfig {
  checkoutLayout: CheckoutLayout;
}

/** Полная ULTRA-конфигурация компонентов витрины */
export interface UltraComponentsConfig {
  catalog: CatalogComponentsConfig;
  productCard: ProductCardComponentsConfig;
  unitSelector: UnitSelectorComponentsConfig;
  checkout: CheckoutComponentsConfig;
}

/** Дефолтная ULTRA-конфигурация: индустриальный брутализм */
export const DEFAULT_COMPONENTS: UltraComponentsConfig = {
  catalog: {
    categoryStyle: "brutalist-grid",
    grainOpacity: 0.08,
  },
  productCard: {
    cardBorderRadius: "0px",
    cardLayoutVariant: "spreadsheet-row",
    showRating: true,
    stockStatusType: "retail-text",
    showGostBadge: true,
  },
  unitSelector: {
    selectVariant: "heavy-tabs",
  },
  checkout: {
    checkoutLayout: "minimalist-modal-flyout",
  },
};

/** Сериализуемый чертёж темы (JSON-схема для БД и экспорта) */
export interface ThemeConfigBlueprint {
  id: string;
  slug: string;
  name: string;
  /** Короткое описание предтемы (для селектора) */
  description?: string;
  tokens: ThemeTokens;
  layout: LayoutComponent[];
  content: ContentOverrides;
  /** ULTRA-конфигурация компонентов: карточки, категории, селекторы, оформление */
  components: UltraComponentsConfig;
  createdAt: string;
  updatedAt: string;
}

/** Пресеты материалов */
export const MATERIAL_PRESETS: Record<MaterialPreset, ColorPalette> = {
  anthracite: {
    background: "#1B2129",
    foreground: "#F5F7FA",
    card: "#242C37",
    primary: "#F5A623",
    secondary: "#2A3442",
    muted: "#2A3442",
    mutedForeground: "#94A3B8",
    border: "#3A4454",
  },
  chrome: {
    background: "#E8EAED",
    foreground: "#16181D",
    card: "#FFFFFF",
    primary: "#3B82F6",
    secondary: "#D4D8DD",
    muted: "#D4D8DD",
    mutedForeground: "#5B6470",
    border: "#C2C8CF",
  },
  desert: {
    background: "#E6D5BC",
    foreground: "#2B2118",
    card: "#F2E6D3",
    primary: "#C2410C",
    secondary: "#DCC8A8",
    muted: "#DCC8A8",
    mutedForeground: "#7A6A55",
    border: "#C9B393",
  },
  concrete: {
    background: "#D6D3D1",
    foreground: "#1C1917",
    card: "#E7E5E4",
    primary: "#57534E",
    secondary: "#C4C0BD",
    muted: "#C4C0BD",
    mutedForeground: "#6B6663",
    border: "#A8A29E",
  },
};

/** Метаданные модулей для конструктора */
export const LAYOUT_COMPONENT_META: Record<
  LayoutComponentId,
  { label: string; description: string }
> = {
  omniSearch: {
    label: "Шапка с поиском",
    description: "Поиск по товарам и подсказки в шапке сайта",
  },
  hero: {
    label: "Главный баннер",
    description: "Разделённый экран металл/песок или слайдер акций",
  },
  calculator: {
    label: "Калькулятор",
    description: "Расчёт тонны↔метры и объём↔вес сыпучих",
  },
  catalog: {
    label: "Каталог товаров",
    description: "Таблица ГОСТ или сетка карточек с ценами",
  },
  advantages: {
    label: "Преимущества",
    description: "Блок преимуществ компании",
  },
  stats: {
    label: "Цифры и показатели",
    description: "Статистика склада: позиции, техника, клиенты",
  },
  delivery: {
    label: "Зоны доставки",
    description: "Зоны и тарифы доставки",
  },
  faq: {
    label: "Вопросы и ответы",
    description: "Частые вопросы покупателей",
  },
  testimonials: {
    label: "Отзывы клиентов",
    description: "Отзывы покупателей",
  },
  blog: {
    label: "Статьи и аналитика",
    description: "Блог компании",
  },
  footer: {
    label: "Подвал сайта",
    description: "Контакты и карта сайта внизу страницы",
  },
};

/** Порядок модулей по умолчанию */
export const DEFAULT_LAYOUT: LayoutComponent[] = [
  { id: "omniSearch", enabled: true, mode: "compact" },
  { id: "hero", enabled: true, mode: "split" },
  { id: "calculator", enabled: true, mode: "metal" },
  { id: "catalog", enabled: true, mode: "table" },
  { id: "advantages", enabled: true },
  { id: "stats", enabled: true },
  { id: "delivery", enabled: true },
  { id: "faq", enabled: true },
  { id: "testimonials", enabled: true },
  { id: "blog", enabled: true },
  { id: "footer", enabled: true },
];

/** Дефолтные токены: брутальный «Сити!» */
export const DEFAULT_TOKENS: ThemeTokens = {
  radius: 0,
  borderWeight: 2,
  noise: 0.05,
  material: "anthracite",
  palette: MATERIAL_PRESETS.anthracite,
  viewMode: "table",
  heroMode: "split",
  searchMode: "compact",
  calculatorTabs: { metal: true, sand: true },
};

/** Дефолтный контент витрины */
export const DEFAULT_CONTENT: ContentOverrides = {
  phone: "+7 495 123-45-67",
  address: "Москва, Каширское ш., 61",
  heroTitleMetal: "Сталь по ГОСТ",
  heroSubtitleMetal: "Арматура, швеллер, труба, лист — от 1 метра, резка в размер, доставка манипулятором.",
  heroTitleSand: "Песок и щебень",
  heroSubtitleSand: "Мытый, намывной, карьерный. Щебень 5-20, 20-40. Самосвалы 5–20 м³, отгрузка 24/7.",
  promoTag: "Акция",
  promoTitle: "Арматура А500С от 42 000 ₽/т",
  promoSubtitle: "Скидка 8% при заказе от 5 тонн",
  catalogTitle: "Прайс-лист · ГОСТ",
  trendingQueries: ["Арматура А500С", "Песок мытый", "Швеллер", "Щебень 5-20", "Труба профильная"],
};

/** Создать пустой чертёж */
export function createBlueprint(name = "Новый чертёж"): ThemeConfigBlueprint {
  const now = new Date().toISOString();
  return {
    id: "",
    slug: "",
    name,
    description: "",
    tokens: structuredClone(DEFAULT_TOKENS),
    layout: structuredClone(DEFAULT_LAYOUT),
    content: structuredClone(DEFAULT_CONTENT),
    components: structuredClone(DEFAULT_COMPONENTS),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Чертёж «с нуля»: все модули выключены, нейтральная палитра, пустой контент.
 * Админ включает модули по одному и строит тему полностью самостоятельно.
 */
export function createEmptyBlueprint(name = "Тема без названия"): ThemeConfigBlueprint {
  const now = new Date().toISOString();
  const tokens: ThemeTokens = {
    radius: 0,
    borderWeight: 1,
    noise: 0,
    material: "concrete",
    palette: MATERIAL_PRESETS.concrete,
    viewMode: "table",
    heroMode: "split",
    searchMode: "compact",
    calculatorTabs: { metal: true, sand: true },
  };
  return {
    id: "",
    slug: "",
    name,
    description: "",
    tokens,
    layout: DEFAULT_LAYOUT.map((c) => ({ ...c, enabled: false })),
    content: {
      phone: "",
      address: "",
      heroTitleMetal: "",
      heroSubtitleMetal: "",
      heroTitleSand: "",
      heroSubtitleSand: "",
      promoTag: "",
      promoTitle: "",
      promoSubtitle: "",
      catalogTitle: "",
      trendingQueries: [],
    },
    components: structuredClone(DEFAULT_COMPONENTS),
    createdAt: now,
    updatedAt: now,
  };
}

/** CSS-переменные из токенов (для inline-стилей и iframe) */
export function tokensToCssVars(tokens: ThemeTokens): CSSProperties {
  const p = tokens.palette;
  return {
    "--theme-radius": `${tokens.radius}px`,
    "--theme-border-weight": `${tokens.borderWeight}px`,
    "--theme-noise": `${tokens.noise}`,
    "--theme-background": p.background,
    "--theme-foreground": p.foreground,
    "--theme-card": p.card,
    "--theme-primary": p.primary,
    "--theme-secondary": p.secondary,
    "--theme-muted": p.muted,
    "--theme-muted-foreground": p.mutedForeground,
    "--theme-border": p.border,
  } as React.CSSProperties;
}

/** Сериализация чертежа в JSON-строку (экспорт) */
export function serializeBlueprint(bp: ThemeConfigBlueprint): string {
  return JSON.stringify(
    {
      id: bp.slug,
      name: bp.name,
      tokens: {
        radius: `${bp.tokens.radius}px`,
        primary: bp.tokens.palette.primary,
        viewMode: bp.tokens.viewMode,
        noise: bp.tokens.noise,
      },
      layout: bp.layout.filter((c) => c.enabled).map((c) => c.id),
      content: bp.content,
    },
    null,
    2
  );
}
