export type ThemePreset =
  | "industrial-orange"
  | "modern-blue"
  | "vinsovkhoz"
  | "city"
  | "clean-minimal"
  | "warm-sand"
  | "cool-sky"
  | "emerald-light"
  | "rose-blush"
  | "violet-mist"
  | "amber-sunset"
  | "teal-fresh"
  | "paper-mono"
  | "lime-fresh"
  | "peach-cream"
  | "b2b-dark-slate"
  | "midnight-navy"
  | "graphite-dark"
  | "forest-dark"
  | "royal-purple"
  | "crimson-dark"
  | "ocean-deep"
  | "neon-dark"
  | "sunset-dark"
  | "wine-dark"
  | "steel-dark"
  | "copper-dark"
  | "vi"
  | "city-met"
  | "aurora-forge"
  | "ideal"
  | "arena"
  | "atlas"
  | "flat"
  | "open"
  | "vinsovkhoz"
  | "uchunchu";

export interface GeoZoneInfo {
  id: string;
  slug: string;
  name: string;
  isRegion: boolean;
  deliveryTariffMultiplier: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  aiDescription?: string | null;
}

export interface MainHeroBannerBlock {
  type: "MainHeroBanner";
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageUrl?: string;
}

// Два раздела витрины: «Металлопрокат» и «Песок и щебень» (свои товары)
export interface CatalogSectionsBlock {
  type: "CatalogSections";
  title: string;
  subtitle?: string;
}

// Полноценный каталог: категории слева, товары справа
export interface FullCatalogBlock {
  type: "FullCatalog";
  title: string;
  subtitle?: string;
  /** Сколько позиций показывать (по умолчанию 60); полный каталог — на /catalog */
  limit?: number;
}

// Витрина категорий для главной: сетка карточек с иконками
export interface CategoryGridBlock {
  type: "CategoryGrid";
  title: string;
  subtitle?: string;
}

export interface InteractiveCalculatorBlock {
  type: "InteractiveCalculator";
  title: string;
  description?: string;
}

export interface LiveProductGridBlock {
  type: "LiveProductGrid";
  title: string;
  categorySlugs?: string[];
  limit?: number;
}

export interface AiChatWidgetBlock {
  type: "AiChatWidget";
  title: string;
  placeholder?: string;
}

export interface InvoiceGeneratorCardBlock {
  type: "InvoiceGeneratorCard";
  title: string;
  description?: string;
}

export interface AdvantageItem {
  icon: string;
  title: string;
  description: string;
}

export interface AdvantagesBlock {
  type: "Advantages";
  title: string;
  subtitle?: string;
  items: AdvantageItem[];
}

export interface StatItem {
  value: string;
  label: string;
}

export interface StatsBlock {
  type: "Stats";
  items: StatItem[];
}

export interface DeliveryZonesBlock {
  type: "DeliveryZones";
  title: string;
  description?: string;
  zones: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqBlock {
  type: "Faq";
  title: string;
  items: FaqItem[];
}

export interface TestimonialItem {
  name: string;
  role: string;
  text: string;
  rating: number;
}

export interface TestimonialsBlock {
  type: "Testimonials";
  title: string;
  items: TestimonialItem[];
}

export interface ModernSeoBlogBlock {
  type: "ModernSeoBlog";
  title?: string;
  limit?: number;
}

export type PageBlock =
  | CatalogSectionsBlock
  | FullCatalogBlock
  | CategoryGridBlock
  | MainHeroBannerBlock
  | InteractiveCalculatorBlock
  | LiveProductGridBlock
  | AiChatWidgetBlock
  | InvoiceGeneratorCardBlock
  | AdvantagesBlock
  | StatsBlock
  | DeliveryZonesBlock
  | FaqBlock
  | TestimonialsBlock
  | ModernSeoBlogBlock;

export interface PageConfig {
  slug: string;
  theme: ThemePreset;
  blocks: PageBlock[];
}
