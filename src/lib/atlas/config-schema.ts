import { z } from "zod";

// ─── Токены дизайна ──────────────────────────────────────────────────────────

export const atlasTokenPresetSchema = z.enum([
  "steel-orange", "deep-blue", "emerald-b2b", "graphite-dark",
]);
export type AtlasTokenPreset = z.infer<typeof atlasTokenPresetSchema>;

export const atlasTokensSchema = z.object({
  preset: atlasTokenPresetSchema.default("steel-orange"),
  primary: z.string().default("#FF6A00"),
  secondary: z.string().default("#0F172A"),
  accent: z.string().default("#0369A1"),
  bg: z.string().default("#F5F7FA"),
  surface: z.string().default("#FFFFFF"),
  surface2: z.string().default("#EEF2F6"),
  text: z.string().default("#0B1220"),
  textMuted: z.string().default("#5B6B7F"),
  border: z.string().default("#DDE3EA"),
  radius: z.enum(["sm", "md", "lg", "xl"]).default("lg"),
  fontHeading: z.string().default("Manrope"),
  fontBody: z.string().default("Inter"),
  density: z.enum(["comfortable", "compact"]).default("comfortable"),
  buttonStyle: z.enum(["solid", "gradient", "outline"]).default("solid"),
  cardStyle: z.enum(["flat", "elevated", "outlined"]).default("elevated"),
});
export type AtlasTokens = z.infer<typeof atlasTokensSchema>;

// ─── Шапка ───────────────────────────────────────────────────────────────────

export const menuItemSchema = z.object({
  label: z.string(),
  href: z.string(),
  children: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
});
export type MenuItem = z.infer<typeof menuItemSchema>;

export const atlasHeaderSchema = z.object({
  style: z.enum(["two-row", "compact"]).default("two-row"),
  topStrip: z.object({
    enabled: z.boolean().default(true),
    text: z.string().default("Москва и Московская область"),
    links: z.array(menuItemSchema).default([]),
  }).optional().default({}),
  logoUrl: z.string().default(""),
  logoText: z.string().default("pesok-metall.ru"),
  phones: z.array(z.string()).default(["+7 (495) 000-00-00"]),
  workHours: z.string().default("Пн–Сб 8:00–20:00"),
  email: z.string().default("info@pesok-metall.ru"),
  menu: z.array(menuItemSchema).default([]),
  quickTags: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
  searchPlaceholder: z.string().default("Поиск по каталогу: арматура, труба 40х40, песок..."),
  showCitySelector: z.boolean().default(true),
  showCart: z.boolean().default(true),
  cta: z.object({ label: z.string(), href: z.string() }).optional().default({ label: "Прайс-лист", href: "/catalog" }),
});
export type AtlasHeader = z.infer<typeof atlasHeaderSchema>;

// ─── Сайдбар ─────────────────────────────────────────────────────────────────

export const atlasSidebarSchema = z.object({
  enabled: z.boolean().default(true),
  roots: z.array(z.object({
    categoryId: z.string(),
    order: z.number().default(0),
    icon: z.string().default(""),
    expandedByDefault: z.boolean().default(false),
  })).default([]),
  showCounts: z.boolean().default(true),
  showSearch: z.boolean().default(true),
  groups: z.boolean().default(true),
  promoCard: z.object({
    enabled: z.boolean().default(true),
    title: z.string().default("Скачать прайс-лист"),
    text: z.string().default("Актуальные цены на металлопрокат и сыпучие материалы"),
    href: z.string().default("/catalog"),
    icon: z.string().default("Download"),
  }).optional().default({}),
});
export type AtlasSidebar = z.infer<typeof atlasSidebarSchema>;

// ─── Футер ───────────────────────────────────────────────────────────────────

export const footerColumnSchema = z.object({
  title: z.string(),
  links: z.array(menuItemSchema).default([]),
});

export const atlasFooterSchema = z.object({
  columns: z.array(footerColumnSchema).default([]),
  requisites: z.string().default("ИНН 7723456789 · ОГРН 1237700123456"),
  socials: z.array(z.object({ label: z.string(), href: z.string(), icon: z.string() })).default([]),
  payments: z.array(z.string()).default(["card", "cash", "invoice"]),
  copyright: z.string().default("© 2026 pesok-metall.ru"),
  showZones: z.boolean().default(true),
  showSubscribe: z.boolean().default(true),
});
export type AtlasFooter = z.infer<typeof atlasFooterSchema>;

// ─── Секции ──────────────────────────────────────────────────────────────────

export const sectionSettingsSchema = z.object({
  paddingTop: z.enum(["none", "sm", "md", "lg"]).default("md"),
  paddingBottom: z.enum(["none", "sm", "md", "lg"]).default("md"),
  background: z.enum(["none", "surface", "muted", "brand", "dark", "image"]).default("none"),
  backgroundImage: z.string().optional(),
  container: z.enum(["default", "wide", "full"]).default("default"),
  anchor: z.string().optional(),
  visibility: z.object({
    desktop: z.boolean().default(true),
    tablet: z.boolean().default(true),
    mobile: z.boolean().default(true),
  }).optional().default({}),
});
export type SectionSettings = z.infer<typeof sectionSettingsSchema>;

export const sectionTypeSchema = z.enum([
  // Общие
  "HeroSlider", "HeroSplit", "CategoryTiles", "FeaturedProducts", "PriceBoard",
  "PromoStrip", "Advantages", "Stats", "StatsSection", "Calculator", "DeliveryZones",
  "BannerGrid", "BlogTeasers", "Faq", "Testimonials", "CtaBanner", "Steps",
  "Certificates", "Contacts", "RichText", "CustomHtml", "Spacer", "Divider",
  // Товарные
  "ProductSpecs", "ProductDescription", "ProductCalculator", "ProductDelivery",
  "SimilarProducts", "RecentlyViewed", "ProductFaq",
]);
export type SectionType = z.infer<typeof sectionTypeSchema>;

export const sectionSchema = z.object({
  id: z.string(),
  type: sectionTypeSchema,
  variant: z.string().optional(),
  props: z.record(z.unknown()).default({}),
  settings: sectionSettingsSchema.default({}),
});
export type Section = z.infer<typeof sectionSchema>;

// ─── Страницы ────────────────────────────────────────────────────────────────

export const atlasPageHomeSchema = z.object({
  sidebar: z.boolean().default(true),
  sections: z.array(sectionSchema).default([]),
});
export type AtlasPageHome = z.infer<typeof atlasPageHomeSchema>;

export const atlasPageCategorySchema = z.object({
  sidebar: z.boolean().default(true),
  defaultSort: z.enum(["popular", "price_asc", "price_desc", "name_asc"]).default("popular"),
  defaultView: z.enum(["grid", "table"]).default("grid"),
  perPage: z.number().default(24),
  showSubcategoryTiles: z.boolean().default(true),
  filters: z.object({
    availability: z.boolean().default(true),
    price: z.boolean().default(true),
    attributes: z.boolean().default(true),
    maxAttributeFacets: z.number().default(6),
  }).optional().default({}),
  descriptionPosition: z.enum(["top", "bottom"]).default("bottom"),
  sectionsBefore: z.array(sectionSchema).default([]),
  sectionsAfter: z.array(sectionSchema).default([]),
});
export type AtlasPageCategory = z.infer<typeof atlasPageCategorySchema>;

export const atlasPageProductSchema = z.object({
  sidebar: z.boolean().default(false),
  buyBox: z.object({
    showPerTon: z.boolean().default(true),
    showOneClick: z.boolean().default(true),
    showRequestQuote: z.boolean().default(true),
    showZonePrice: z.boolean().default(true),
    showDelivery: z.boolean().default(true),
  }).optional().default({}),
  sections: z.array(sectionSchema).default([]),
});
export type AtlasPageProduct = z.infer<typeof atlasPageProductSchema>;

export const atlasPageSearchSchema = z.object({
  sidebar: z.boolean().default(true),
  sectionsAfter: z.array(sectionSchema).default([]),
});
export type AtlasPageSearch = z.infer<typeof atlasPageSearchSchema>;

export const atlasPageCartSchema = z.object({
  sectionsAfter: z.array(sectionSchema).default([]),
});
export type AtlasPageCart = z.infer<typeof atlasPageCartSchema>;

// ─── Полный конфиг ───────────────────────────────────────────────────────────

export const atlasConfigSchema = z.object({
  version: z.literal(1).default(1),
  tokens: atlasTokensSchema.default({}),
  header: atlasHeaderSchema.default({}),
  sidebar: atlasSidebarSchema.default({}),
  footer: atlasFooterSchema.default({}),
  pages: z.object({
    home: atlasPageHomeSchema.optional().default({}),
    category: atlasPageCategorySchema.optional().default({}),
    product: atlasPageProductSchema.optional().default({}),
    search: atlasPageSearchSchema.optional().default({}),
    cart: atlasPageCartSchema.optional().default({}),
  }).optional().default({}),
});
export type AtlasConfig = z.infer<typeof atlasConfigSchema>;

/** Безопасный парсинг конфига: невалидные части заменяются дефолтами */
export function parseAtlasConfig(raw: unknown): AtlasConfig {
  const result = atlasConfigSchema.safeParse(raw);
  if (result.success) return result.data;
  // Частичный парсинг: берём что получилось
  const loose = atlasConfigSchema.safeParse(
    typeof raw === "object" && raw ? { ...raw } : {}
  );
  if (loose.success) return loose.data;
  return atlasConfigSchema.parse({});
}
