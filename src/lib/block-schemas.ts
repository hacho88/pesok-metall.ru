import type { PageBlock, ThemePreset } from "@/types/page-builder";

export interface BlockFieldSchema {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
}

export interface BlockTypeSchema {
  type: PageBlock["type"];
  label: string;
  description: string;
  icon: string;
  defaultProps: Record<string, unknown>;
  fields: BlockFieldSchema[];
}

export const BLOCK_SCHEMAS: BlockTypeSchema[] = [
  {
    type: "CatalogSections",
    label: "Два раздела",
    description: "Входы в «Металлопрокат» и «Песок и щебень»",
    icon: "layout-grid",
    defaultProps: {
      title: "Каталог",
      subtitle: "Выберите раздел: металлопрокат с ценами от производителя или сыпучие материалы",
    },
    fields: [
      { key: "title", label: "Заголовок", type: "text" },
      { key: "subtitle", label: "Подзаголовок", type: "textarea" },
    ],
  },
  {
    type: "MainHeroBanner",
    label: "Главный баннер",
    description: "Заголовок, подзаголовок и кнопки первого экрана",
    icon: "hardhat",
    defaultProps: {
      title: "Заголовок первого экрана",
      subtitle: "Подзаголовок с ключевыми преимуществами",
      ctaLabel: "Рассчитать доставку",
      ctaHref: "#calculator",
      secondaryCtaLabel: "Смотреть каталог",
      secondaryCtaHref: "#catalog",
    },
    fields: [
      { key: "title", label: "Заголовок", type: "textarea" },
      { key: "subtitle", label: "Подзаголовок", type: "textarea" },
      { key: "ctaLabel", label: "Текст главной кнопки", type: "text" },
      { key: "ctaHref", label: "Ссылка главной кнопки", type: "text" },
      { key: "secondaryCtaLabel", label: "Текст второй кнопки", type: "text" },
      { key: "secondaryCtaHref", label: "Ссылка второй кнопки", type: "text" },
    ],
  },
  {
    type: "InteractiveCalculator",
    label: "ИИ-калькулятор",
    description: "Расчёт тары, машины и доставки",
    icon: "calculator",
    defaultProps: {
      title: "ИИ-калькулятор доставки",
      description: "Переведите объём в тару, а ИИ подберёт машину из автопарка.",
    },
    fields: [
      { key: "title", label: "Заголовок", type: "text" },
      { key: "description", label: "Описание", type: "textarea" },
    ],
  },
  {
    type: "LiveProductGrid",
    label: "Каталог товаров",
    description: "Сетка товаров из базы (или демо-данные)",
    icon: "boxes",
    defaultProps: { title: "Хиты продаж", categorySlugs: [], limit: 8 },
    fields: [
      { key: "title", label: "Заголовок", type: "text" },
      {
        key: "limit",
        label: "Количество товаров",
        type: "number",
        help: "От 1 до 12",
      },
    ],
  },
  {
    type: "Advantages",
    label: "Преимущества",
    description: "Сетка карточек с иконками (до 4)",
    icon: "badge",
    defaultProps: {
      title: "Почему заказывают у нас",
      subtitle: "Краткое описание блока",
      items: [
        {
          icon: "truck",
          title: "Преимущество 1",
          description: "Описание преимущества",
        },
        {
          icon: "scale",
          title: "Преимущество 2",
          description: "Описание преимущества",
        },
        {
          icon: "badge",
          title: "Преимущество 3",
          description: "Описание преимущества",
        },
        {
          icon: "calculator",
          title: "Преимущество 4",
          description: "Описание преимущества",
        },
      ],
    },
    fields: [
      { key: "title", label: "Заголовок", type: "text" },
      { key: "subtitle", label: "Подзаголовок", type: "text" },
    ],
  },
  {
    type: "Stats",
    label: "Статистика",
    description: "Полоса цифровых показателей (до 4)",
    icon: "zap",
    defaultProps: {
      items: [
        { value: "5 лет", label: "на рынке" },
        { value: "12 000+", label: "заказов" },
        { value: "4 машины", label: "в автопарке" },
        { value: "24/7", label: "приём заказов" },
      ],
    },
    fields: [],
  },
  {
    type: "DeliveryZones",
    label: "Зоны доставки",
    description: "Список городов и районов доставки",
    icon: "map",
    defaultProps: {
      title: "Зоны доставки",
      description: "Москва и вся Московская область",
      zones: ["Москва", "Балашиха", "Подольск"],
    },
    fields: [
      { key: "title", label: "Заголовок", type: "text" },
      { key: "description", label: "Описание", type: "text" },
    ],
  },
  {
    type: "Faq",
    label: "Вопросы и ответы",
    description: "Раскрывающийся аккордеон FAQ",
    icon: "headphones",
    defaultProps: {
      title: "Частые вопросы",
      items: [
        { question: "Вопрос 1", answer: "Ответ на вопрос 1" },
        { question: "Вопрос 2", answer: "Ответ на вопрос 2" },
      ],
    },
    fields: [{ key: "title", label: "Заголовок", type: "text" }],
  },
  {
    type: "Testimonials",
    label: "Отзывы",
    description: "Карточки отзывов с рейтингом",
    icon: "star",
    defaultProps: {
      title: "Отзывы клиентов",
      items: [
        {
          name: "Имя клиента",
          role: "Роль / город",
          text: "Текст отзыва",
          rating: 5,
        },
      ],
    },
    fields: [{ key: "title", label: "Заголовок", type: "text" }],
  },
  {
    type: "AiChatWidget",
    label: "ИИ-чат",
    description: "Виджет консультанта DeepSeek",
    icon: "bot",
    defaultProps: {
      title: "Консультация с ИИ-менеджером",
      placeholder: "Задайте вопрос о товарах и доставке...",
    },
    fields: [
      { key: "title", label: "Заголовок", type: "text" },
      { key: "placeholder", label: "Плейсхолдер ввода", type: "text" },
    ],
  },
  {
    type: "InvoiceGeneratorCard",
    label: "Счёт на оплату",
    description: "Генератор счёта с печатью",
    icon: "file",
    defaultProps: {
      title: "Счет на оплату онлайн",
      description: "Сформируйте счёт за 30 секунд.",
    },
    fields: [
      { key: "title", label: "Заголовок", type: "text" },
      { key: "description", label: "Описание", type: "textarea" },
    ],
  },
];

export interface ThemeOption {
  value: ThemePreset;
  label: string;
  description: string;
  /** Цвета для превью: фон, акцент, текст */
  swatch: [string, string, string];
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "industrial-orange",
    label: "Industrial Orange",
    description: "Агрессивный розничный стиль с оранжевым акцентом",
    swatch: ["#faf7f2", "#f2650a", "#17130f"],
  },
  {
    value: "modern-blue",
    label: "Modern Blue",
    description: "Современный сине-стальной, деловой и технологичный",
    swatch: ["#f5f8fc", "#3b82f6", "#0f172a"],
  },
  {
    value: "vinsovkhoz",
    label: "ВИНСОВХОЗ",
    description: "Тёмный складской стиль с янтарным акцентом, единый каталог",
    swatch: ["#0f1420", "#f5a623", "#f1f5f9"],
  },
  {
    value: "city",
    label: "Сити!",
    description: "Industrial B2B Metal Depot: острые рамки, глубокий сланец, красный акцент",
    swatch: ["#1b2129", "#ff3b1f", "#f5f7fa"],
  },
  {
    value: "clean-minimal",
    label: "Clean Minimal",
    description: "Минималистичный светлый с глубоким синим",
    swatch: ["#ffffff", "#1f3a5f", "#1c2128"],
  },
  {
    value: "warm-sand",
    label: "Warm Sand",
    description: "Тёплый песочный с янтарным акцентом",
    swatch: ["#faf6ee", "#d98a12", "#262015"],
  },
  {
    value: "cool-sky",
    label: "Cool Sky",
    description: "Свежий небесно-голубой",
    swatch: ["#f2f8fc", "#0ea5d8", "#16222c"],
  },
  {
    value: "emerald-light",
    label: "Emerald Light",
    description: "Изумрудный светлый, спокойный и деловой",
    swatch: ["#f2faf6", "#1f8a5f", "#14281f"],
  },
  {
    value: "rose-blush",
    label: "Rose Blush",
    description: "Нежный розовый с ярким акцентом",
    swatch: ["#fdf2f5", "#e91e63", "#2b1a22"],
  },
  {
    value: "violet-mist",
    label: "Violet Mist",
    description: "Фиолетовая дымка, креативный стиль",
    swatch: ["#f5f2fd", "#7c3aed", "#241d33"],
  },
  {
    value: "amber-sunset",
    label: "Amber Sunset",
    description: "Янтарный закат, тёплый и энергичный",
    swatch: ["#fbf6ec", "#f97316", "#2b2118"],
  },
  {
    value: "teal-fresh",
    label: "Teal Fresh",
    description: "Свежий бирюзовый, лёгкий и чистый",
    swatch: ["#f0faf9", "#0f766e", "#162b29"],
  },
  {
    value: "paper-mono",
    label: "Paper Mono",
    description: "Бумажный монохром, строгий типографский",
    swatch: ["#fafafa", "#1f1f1f", "#1a1a1a"],
  },
  {
    value: "lime-fresh",
    label: "Lime Fresh",
    description: "Лаймовый, молодёжный и сочный",
    swatch: ["#f6faf0", "#65a30d", "#1a2416"],
  },
  {
    value: "peach-cream",
    label: "Peach Cream",
    description: "Персиковый крем, мягкий и уютный",
    swatch: ["#fdf6f1", "#f4572e", "#2e211c"],
  },
  {
    value: "b2b-dark-slate",
    label: "B2B Dark Slate",
    description: "Строгий корпоративный тёмный",
    swatch: ["#121a26", "#0ea5e9", "#e8eef5"],
  },
  {
    value: "midnight-navy",
    label: "Midnight Navy",
    description: "Полночный флот, глубокий синий",
    swatch: ["#0b1024", "#4f8ef7", "#eef1f8"],
  },
  {
    value: "graphite-dark",
    label: "Graphite Dark",
    description: "Графитовый монохромный тёмный",
    swatch: ["#151517", "#d6d6d9", "#f2f2f4"],
  },
  {
    value: "forest-dark",
    label: "Forest Dark",
    description: "Тёмный лес, глубокий зелёный",
    swatch: ["#0c1712", "#2fbf71", "#eef5f1"],
  },
  {
    value: "royal-purple",
    label: "Royal Purple",
    description: "Королевский пурпур, премиальный",
    swatch: ["#14101f", "#8b5cf6", "#f1eef8"],
  },
  {
    value: "crimson-dark",
    label: "Crimson Dark",
    description: "Тёмный багрянец, драматичный",
    swatch: ["#170f12", "#e5484d", "#f5eef0"],
  },
  {
    value: "ocean-deep",
    label: "Ocean Deep",
    description: "Глубокий океан, спокойный синий",
    swatch: ["#0a1424", "#0ea5e9", "#eef4fa"],
  },
  {
    value: "neon-dark",
    label: "Neon Dark",
    description: "Неоновый, технологичный и яркий",
    swatch: ["#0a120c", "#22e06a", "#f0f6f2"],
  },
  {
    value: "sunset-dark",
    label: "Sunset Dark",
    description: "Тёмный закат, тёплый оранжевый",
    swatch: ["#17110c", "#f97316", "#f5f0ec"],
  },
  {
    value: "wine-dark",
    label: "Wine Dark",
    description: "Тёмное вино, благородный бордо",
    swatch: ["#171014", "#d6437a", "#f4eef1"],
  },
  {
    value: "steel-dark",
    label: "Steel Dark",
    description: "Тёмная сталь, индустриальный",
    swatch: ["#131722", "#6f8fc9", "#eef1f5"],
  },
  {
    value: "copper-dark",
    label: "Copper Dark",
    description: "Тёмная медь, тёплый металлик",
    swatch: ["#17120e", "#d97b3d", "#f4f0ec"],
  },
  {
    value: "vi",
    label: "ВИ (ВсеИнструменты)",
    description: "Клон vseinstrumenti.ru: фирменный красный, светлый фон",
    swatch: ["#f7f7f7", "#e4002b", "#1a1a1a"],
  },
  {
    value: "city-met",
    label: "City-Met",
    description: "Клон city-met.ru: белая сетка 1px, плотная таблица-спредшит, красный акцент",
    swatch: ["#ffffff", "#dc2626", "#171717"],
  },
  {
    value: "aurora-forge",
    label: "Aurora Forge Pro",
    description: "Премиальный тёмный bento: графит, северное сияние, янтарный акцент, стекло и свечение",
    swatch: ["#0b1220", "#ff9d2e", "#22d3ee"],
  },
  {
    value: "ideal",
    label: "Идеал",
    description: "Премиальный светлый гибрид: молочный фон, идеальный синий, платиновый, стекло и современный B2B marketplace",
    swatch: ["#f8fafc", "#2563eb", "#1e293b"],
  },
  {
    value: "arena",
    label: "Arena",
    description: "Торговая арена снабжения: тёмный графит, прожекторы, electric-orange CTA, steel-cyan данные, lime-статусы, scoreboard и brutal bento",
    swatch: ["#080b10", "#ff6a00", "#00c2ff"],
  },
];

export function getBlockSchema(type: PageBlock["type"]): BlockTypeSchema | undefined {
  return BLOCK_SCHEMAS.find((s) => s.type === type);
}

export function createBlock(type: PageBlock["type"]): PageBlock {
  const schema = getBlockSchema(type);
  return { type, ...(schema?.defaultProps ?? {}) } as PageBlock;
}
