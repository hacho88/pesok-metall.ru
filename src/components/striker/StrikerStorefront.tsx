"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Phone,
  MapPin,
  Truck,
  Calculator,
  ArrowRight,
  Menu,
  X,
  Star,
  ChevronDown,
  Boxes,
  MessageSquare,
  ShieldCheck,
  Clock,
  Wallet,
  Factory,
  Scale,
  Package,
  Users,
  Building2,
} from "lucide-react";
import type { ThemeConfigBlueprint, LayoutComponentId, ContentOverrides, UltraComponentsConfig } from "@/types/striker-engine";
import { tokensToCssVars } from "@/types/striker-engine";
import type { StorefrontProduct } from "@/lib/theme-storefront";
import FastCheckout from "@/components/checkout/FastCheckout";
import type { CheckoutCartItem } from "@/types/checkout";
import CategoryLayout, { type CategoryItem } from "@/components/catalog/CategoryLayout";
import ProductCard from "@/components/catalog/ProductCard";
import { getConversionContext, convertUnit, type UnitKey } from "@/components/ui/UnitSelector";

/**
 * STRIKER.Engine — универсальный рендерер витрины.
 * Один и тот же компонент используется:
 *  1) на реальной витрине (app/page.tsx, серверная выборка товаров),
 *  2) в LivePreview админки (мок-товары, live-обновление токенов).
 */

interface StrikerStorefrontProps {
  blueprint: ThemeConfigBlueprint;
  products: StorefrontProduct[];
}

/** Преобразование товара витрины в позицию корзины FastCheckout (с учётом единицы измерения) */
function productToCartItem(product: StorefrontProduct, quantity = 1, unit?: UnitKey): CheckoutCartItem {
  const ctx = getConversionContext(product);
  const kg = unit ? convertUnit(quantity, unit, "t", ctx) * 1000 : product.weightKg * quantity;
  const weightTons = kg / 1000;
  const unitLabel: Record<UnitKey, string> = { m: "м", t: "т", pcs: "шт", m3: "м³", bags: "меш" };
  return {
    productId: product.id,
    sku: product.slug,
    name: product.name,
    gost: product.gost,
    unit: unit ? unitLabel[unit] : product.unit,
    quantity,
    weightKg: product.weightKg,
    weightTons,
    pricePerUnit: product.price,
    lineTotal: product.price != null ? product.price * quantity : null,
  };
}

export default function StrikerStorefront({ blueprint, products }: StrikerStorefrontProps) {
  const { tokens, layout } = blueprint;
  const cssVars = useMemo(() => tokensToCssVars(tokens), [tokens]);
  const enabled = layout.filter((c) => c.enabled);

  const [cart, setCart] = useState<CheckoutCartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const section = (id: LayoutComponentId) => enabled.find((c) => c.id === id);

  const addToCart = (product: StorefrontProduct, quantity = 1, unit?: UnitKey) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.sku === product.slug);
      if (existing) {
        return prev.map((item) =>
          item.sku === product.slug ? productToCartItem(product, item.quantity + quantity, unit) : item
        );
      }
      return [...prev, productToCartItem(product, quantity, unit)];
    });
    setCheckoutOpen(true);
  };

  const removeFromCart = (sku: string) => {
    setCart((prev) => prev.filter((item) => item.sku !== sku));
  };

  const cartTotalTons = cart.reduce((sum, item) => sum + item.weightTons, 0);

  return (
    <div
      className="relative min-h-full overflow-hidden font-sans"
      style={{
        ...cssVars,
        background: "var(--theme-background)",
        color: "var(--theme-foreground)",
        borderRadius: "var(--theme-radius)",
      }}
    >
      {/* Зерно-шум: имитация физического песка/стали */}
      <div
        className="pointer-events-none absolute inset-0 z-50 mix-blend-overlay"
        style={{ opacity: tokens.noise }}
        aria-hidden
      >
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="striker-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#striker-noise)" />
        </svg>
      </div>

      <div className="relative z-10">
        {enabled.map((c) => {
          const sectionKey = c.id;
          const sectionContent = (
            <div key={sectionKey}>
              {(() => {
                switch (c.id) {
                  case "omniSearch":
                    return <StrikerHeader mode={c.mode ?? "compact"} content={blueprint.content} />;
                  case "hero":
                    return <StrikerHero mode={c.mode ?? "split"} content={blueprint.content} />;
                  case "calculator":
                    return <StrikerCalculator tabs={tokens.calculatorTabs} />;
                  case "catalog":
                    return (
                      <StrikerCatalog
                        mode={tokens.viewMode}
                        components={blueprint.components}
                        products={products}
                        title={blueprint.content.catalogTitle}
                        onOrder={addToCart}
                      />
                    );
                  case "advantages":
                    return <StrikerAdvantages />;
                  case "stats":
                    return <StrikerStats />;
                  case "delivery":
                    return <StrikerDelivery />;
                  case "faq":
                    return <StrikerFaq />;
                  case "testimonials":
                    return <StrikerTestimonials />;
                  case "blog":
                    return <StrikerBlog />;
                  case "footer":
                    return <StrikerFooter content={blueprint.content} />;
                  default:
                    return null;
                }
              })()}
            </div>
          );
          // Обычная обёртка: layout-анимации framer-motion ломают SSR-гидратацию (data-projection-id)
          return <div key={sectionKey}>{sectionContent}</div>;
        })}
      </div>

      {/* Плавающая кнопка корзины */}
      {cart.length > 0 && (
        <div className="fixed bottom-5 right-5 z-[60]">
          <button
            onClick={() => setCheckoutOpen(true)}
            className="flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-2xl transition-transform hover:scale-105 active:scale-95"
            style={{ background: "var(--theme-primary)", borderRadius: "var(--theme-radius)" }}
          >
            <Package className="h-4 w-4" />
            <span>Корзина · {cart.length} поз.</span>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-black" style={{ background: "rgba(0,0,0,0.25)" }}>
              {cartTotalTons.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} т
            </span>
          </button>
        </div>
      )}

      {/* Модальное окно FastCheckout */}
      <AnimatePresence>
        {checkoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) setCheckoutOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="w-full max-w-lg"
            >
              <FastCheckout
                variant={tokens.radius === 0 ? "city" : "vi"}
                checkoutLayout={blueprint.components.checkout.checkoutLayout}
                cartItems={cart}
                onRemoveItem={removeFromCart}
                onClose={() => setCheckoutOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ OmniSearch / Header ============ */

function StrikerHeader({ mode, content }: { mode: string; content: ContentOverrides }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const tags = content.trendingQueries;

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ borderColor: "var(--theme-border)", background: "var(--theme-card)", borderWidth: "0 0 var(--theme-border-weight)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center font-black"
            style={{ background: "var(--theme-primary)", color: "var(--theme-background)" }}
          >
            П
          </span>
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-black uppercase tracking-widest">Песок-Металл</div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--theme-muted-foreground)" }}>
              Москва и МО · отгрузка 24/7
            </div>
          </div>
        </div>

        <div className="relative flex-1">
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{ border: `${mode === "compact" ? "var(--theme-border-weight)" : "1px"} solid var(--theme-border)`, background: "var(--theme-background)" }}
          >
            <Search className="h-4 w-4 shrink-0" style={{ color: "var(--theme-muted-foreground)" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder={mode === "compact" ? "Артикул / ГОСТ / наименование…" : "Найти стройматериалы…"}
              className="w-full bg-transparent text-sm outline-none placeholder:opacity-50"
            />
            <kbd className="hidden rounded px-1.5 py-0.5 text-[10px] font-bold md:block" style={{ background: "var(--theme-muted)", color: "var(--theme-muted-foreground)" }}>
              /
            </kbd>
          </div>
          <AnimatePresence>
            {open && mode === "marketplace" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 right-0 top-full z-50 mt-1 p-3 shadow-2xl"
                style={{ background: "var(--theme-card)", border: "1px solid var(--theme-border)" }}
              >
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--theme-muted-foreground)" }}>
                  Популярные запросы
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setQuery(t)}
                      className="px-2 py-1 text-xs font-semibold transition-opacity hover:opacity-70"
                      style={{ background: "var(--theme-muted)", color: "var(--theme-foreground)" }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <MapPin className="h-4 w-4" style={{ color: "var(--theme-primary)" }} />
            {content.address}
          </div>
          <a href={`tel:${content.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-1.5 text-sm font-black">
            <Phone className="h-4 w-4" style={{ color: "var(--theme-primary)" }} />
            {content.phone}
          </a>
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center lg:hidden"
          style={{ border: "var(--theme-border-weight) solid var(--theme-border)" }}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}

/* ============ Hero ============ */

function StrikerHero({ mode, content }: { mode: string; content: ContentOverrides }) {
  const [slide, setSlide] = useState(0);
  const promos = [
    { tag: content.promoTag, title: content.promoTitle, sub: content.promoSubtitle, cta: "Рассчитать" },
    { tag: "Хит", title: "Песок мытый — 1 150 ₽/м³", sub: "Доставка самосвалом в день заказа", cta: "Заказать" },
    { tag: "Опт", title: "Щебень гранитный 5-20", sub: "Отгрузка вагонами и самосвалами", cta: "Получить КП" },
  ];

  if (mode === "promos") {
    return (
      <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--theme-border)", borderWidth: "0 0 var(--theme-border-weight)" }}>
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="relative p-8 lg:p-14"
              style={{ background: "var(--theme-card)", border: "var(--theme-border-weight) solid var(--theme-border)" }}
            >
              <span className="inline-block px-2 py-1 text-[10px] font-black uppercase tracking-widest" style={{ background: "var(--theme-primary)", color: "var(--theme-background)" }}>
                {promos[slide].tag}
              </span>
              <h1 className="mt-4 max-w-2xl text-3xl font-black uppercase leading-tight lg:text-5xl">{promos[slide].title}</h1>
              <p className="mt-3 max-w-xl text-sm font-medium opacity-70">{promos[slide].sub}</p>
              <button
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-wider transition-opacity hover:opacity-80"
                style={{ background: "var(--theme-primary)", color: "var(--theme-background)" }}
              >
                {promos[slide].cta} <ArrowRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-4 right-4 flex gap-1.5">
                {promos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className="h-1.5 transition-all"
                    style={{
                      width: i === slide ? 24 : 8,
                      background: i === slide ? "var(--theme-primary)" : "var(--theme-border)",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    );
  }

  // split
  return (
    <section className="border-b" style={{ borderColor: "var(--theme-border)", borderWidth: "0 0 var(--theme-border-weight)" }}>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 lg:grid-cols-2 lg:px-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden p-8 lg:p-12"
          style={{ background: "var(--theme-card)", border: "var(--theme-border-weight) solid var(--theme-border)" }}
        >
          <div className="absolute right-4 top-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--theme-primary)" }}>
            Металлопрокат
          </div>
          <Factory className="mb-6 h-10 w-10" style={{ color: "var(--theme-primary)" }} />
          <h1 className="text-4xl font-black uppercase leading-none lg:text-6xl">
            {content.heroTitleMetal.split(" ")[0]}
            <br />
            <span style={{ color: "var(--theme-primary)" }}>{content.heroTitleMetal.split(" ").slice(1).join(" ") || "по ГОСТ"}</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm font-medium opacity-70">{content.heroSubtitleMetal}</p>
          <button className="mt-6 inline-flex items-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-wider" style={{ background: "var(--theme-primary)", color: "var(--theme-background)" }}>
            В каталог <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="relative overflow-hidden p-8 lg:p-12"
          style={{ background: "var(--theme-card)", border: "var(--theme-border-weight) solid var(--theme-border)" }}
        >
          <div className="absolute right-4 top-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--theme-primary)" }}>
            Сыпучие материалы
          </div>
          <Boxes className="mb-6 h-10 w-10" style={{ color: "var(--theme-primary)" }} />
          <h1 className="text-4xl font-black uppercase leading-none lg:text-6xl">
            {content.heroTitleSand.split(" ")[0]}
            <br />
            <span style={{ color: "var(--theme-primary)" }}>{content.heroTitleSand.split(" ").slice(1).join(" ") || "и щебень"}</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm font-medium opacity-70">{content.heroSubtitleSand}</p>
          <button className="mt-6 inline-flex items-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-wider" style={{ background: "var(--theme-primary)", color: "var(--theme-background)" }}>
            В каталог <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ============ Industrial Calculator ============ */

function StrikerCalculator({ tabs }: { tabs: { metal: boolean; sand: boolean } }) {
  const [tab, setTab] = useState<"metal" | "sand">(tabs.metal ? "metal" : "sand");
  const [value, setValue] = useState("1");
  const [unit, setUnit] = useState<"т" | "м">("т");
  const num = parseFloat(value) || 0;

  const metalResult = unit === "т" ? (num * 1000) / 0.888 : (num * 0.888) / 1000;
  const sandResult = unit === "т" ? (num * 1000) / 1600 : (num * 1600) / 1000;

  return (
    <section className="border-b" style={{ borderColor: "var(--theme-border)", borderWidth: "0 0 var(--theme-border-weight)" }}>
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Calculator className="h-6 w-6" style={{ color: "var(--theme-primary)" }} />
          <h2 className="text-2xl font-black uppercase tracking-tight">Промышленный калькулятор</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="p-6" style={{ background: "var(--theme-card)", border: "var(--theme-border-weight) solid var(--theme-border)" }}>
            <div className="mb-4 flex gap-1.5">
              {tabs.metal && (
                <button
                  onClick={() => setTab("metal")}
                  className="px-3 py-1.5 text-xs font-black uppercase tracking-wider"
                  style={tab === "metal" ? { background: "var(--theme-primary)", color: "var(--theme-background)" } : { background: "var(--theme-muted)", color: "var(--theme-muted-foreground)" }}
                >
                  Металл
                </button>
              )}
              {tabs.sand && (
                <button
                  onClick={() => setTab("sand")}
                  className="px-3 py-1.5 text-xs font-black uppercase tracking-wider"
                  style={tab === "sand" ? { background: "var(--theme-primary)", color: "var(--theme-background)" } : { background: "var(--theme-muted)", color: "var(--theme-muted-foreground)" }}
                >
                  Сыпучие
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-2xl font-black outline-none"
                style={{ border: "1px solid var(--theme-border)", background: "var(--theme-background)" }}
              />
              <div className="flex gap-1">
                {(["т", "м"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className="px-3 text-sm font-black"
                    style={unit === u ? { background: "var(--theme-primary)", color: "var(--theme-background)" } : { background: "var(--theme-muted)", color: "var(--theme-muted-foreground)" }}
                  >
                    {u === "т" ? "тонн" : "метров"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--theme-border)" }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--theme-muted-foreground)" }}>
                {tab === "metal" ? "Арматура Ø12 А500С" : "Песок мытый (ρ=1600 кг/м³)"}
              </span>
              <span className="text-xl font-black" style={{ color: "var(--theme-primary)" }}>
                {tab === "metal" ? metalResult.toFixed(2) : sandResult.toFixed(2)}
                <span className="ml-1 text-xs">{tab === "metal" ? (unit === "т" ? "м" : "т") : unit === "т" ? "м³" : "т"}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 p-6" style={{ background: "var(--theme-card)", border: "var(--theme-border-weight) solid var(--theme-border)" }}>
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 shrink-0" style={{ color: "var(--theme-primary)" }} />
              <div>
                <div className="text-sm font-black uppercase">Доставка по Москве и МО</div>
                <div className="text-xs opacity-60">Манипулятор, самосвал, Газель — от 2 500 ₽</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 shrink-0" style={{ color: "var(--theme-primary)" }} />
              <div>
                <div className="text-sm font-black uppercase">Точный вес и объём</div>
                <div className="text-xs opacity-60">Расчёт по ГОСТ и насыпной плотности</div>
              </div>
            </div>
            <button className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-wider" style={{ background: "var(--theme-primary)", color: "var(--theme-background)" }}>
              Получить расчёт <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ Catalog Renderer ============ */

function StrikerCatalog({
  mode,
  components,
  products,
  title,
  onOrder,
}: {
  mode: string;
  components: UltraComponentsConfig;
  products: StorefrontProduct[];
  title: string;
  onOrder: (product: StorefrontProduct, quantity: number, unit: UnitKey) => void;
}) {
  const [filter, setFilter] = useState("all");
  const list = products.slice(0, mode === "table" ? 12 : 8);
  const types = ["all", "METALL", "BAG_30KG", "BIG_BAG_1TON"];

  const filtered = filter === "all" ? list : list.filter((p) => p.type === filter);

  // Категории для CategoryLayout (группировка по categoryName)
  const categories: CategoryItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of list) {
      map.set(p.categoryName, (map.get(p.categoryName) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [list]);

  const isTile = components.productCard.cardLayoutVariant === "ecommerce-tile";

  return (
    <section className="border-b" style={{ borderColor: "var(--theme-border)", borderWidth: "0 0 var(--theme-border-weight)" }}>
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
          <div className="flex gap-1.5">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
                style={filter === t ? { background: "var(--theme-primary)", color: "var(--theme-background)" } : { background: "var(--theme-muted)", color: "var(--theme-muted-foreground)" }}
              >
                {t === "all" ? "Все" : t === "METALL" ? "Металл" : "Мешки"}
              </button>
            ))}
          </div>
        </div>

        {/* ULTRA: конструктор категорий (brutalist-grid / carousel-minimal / masonry-industrial) */}
        {categories.length > 0 && (
          <div className="mb-8">
            <CategoryLayout categories={categories} config={components.catalog} />
          </div>
        )}

        {/* ULTRA: карточки товаров (spreadsheet-row / ecommerce-tile) */}
        {isTile ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                config={components.productCard}
                unitConfig={components.unitSelector}
                onOrder={onOrder}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                config={components.productCard}
                unitConfig={components.unitSelector}
                onOrder={onOrder}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ============ Advantages ============ */

const ADVANTAGES = [
  { icon: Factory, title: "Собственный склад", text: "12 000 м² крытых площадей в Москве и МО" },
  { icon: Truck, title: "Доставка 24/7", text: "Манипуляторы, самосвалы, Газели — от 2 500 ₽" },
  { icon: ShieldCheck, title: "ГОСТ и сертификаты", text: "Каждая партия с паспортом качества" },
  { icon: Wallet, title: "Опт и тендеры", text: "Отсрочка платежа, работаем с НДС" },
];

function StrikerAdvantages() {
  return (
    <section className="border-b" style={{ borderColor: "var(--theme-border)", borderWidth: "0 0 var(--theme-border-weight)" }}>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {ADVANTAGES.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5"
            style={{ background: "var(--theme-card)", border: "var(--theme-border-weight) solid var(--theme-border)" }}
          >
            <a.icon className="mb-3 h-7 w-7" style={{ color: "var(--theme-primary)" }} />
            <div className="mb-1 text-sm font-black uppercase">{a.title}</div>
            <div className="text-xs font-medium opacity-60">{a.text}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ============ Stats ============ */

const STATS = [
  { icon: Package, value: "2 400+", label: "позиций на складе" },
  { icon: Truck, value: "38", label: "единиц техники" },
  { icon: Clock, value: "24/7", label: "отгрузка без выходных" },
  { icon: Users, value: "1 900+", label: "оптовых клиентов" },
];

function StrikerStats() {
  return (
    <section className="border-b" style={{ borderColor: "var(--theme-border)", borderWidth: "0 0 var(--theme-border-weight)" }}>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-10 lg:grid-cols-4 lg:px-8">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 p-5"
            style={{ background: "var(--theme-card)", border: "var(--theme-border-weight) solid var(--theme-border)" }}
          >
            <s.icon className="h-8 w-8 shrink-0" style={{ color: "var(--theme-primary)" }} />
            <div>
              <div className="text-2xl font-black" style={{ color: "var(--theme-primary)" }}>{s.value}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-60">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ============ Delivery ============ */

const ZONES = [
  { name: "Москва (внутри МКАД)", price: "от 2 500 ₽", time: "сегодня" },
  { name: "МО до 10 км от МКАД", price: "от 3 200 ₽", time: "сегодня" },
  { name: "МО 10–30 км", price: "от 4 500 ₽", time: "сегодня–завтра" },
  { name: "МО 30–60 км", price: "от 6 000 ₽", time: "завтра" },
];

function StrikerDelivery() {
  return (
    <section className="border-b" style={{ borderColor: "var(--theme-border)", borderWidth: "0 0 var(--theme-border-weight)" }}>
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Truck className="h-6 w-6" style={{ color: "var(--theme-primary)" }} />
          <h2 className="text-2xl font-black uppercase tracking-tight">Зоны доставки</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ZONES.map((z) => (
            <div key={z.name} className="p-5" style={{ background: "var(--theme-card)", border: "var(--theme-border-weight) solid var(--theme-border)" }}>
              <div className="mb-1 flex items-center gap-2 text-sm font-black uppercase">
                <MapPin className="h-4 w-4" style={{ color: "var(--theme-primary)" }} />
                {z.name}
              </div>
              <div className="text-lg font-black" style={{ color: "var(--theme-primary)" }}>{z.price}</div>
              <div className="text-xs font-semibold opacity-60">Доставка: {z.time}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ FAQ ============ */

const FAQS = [
  { q: "Как рассчитывается доставка?", a: "Стоимость зависит от зоны, типа машины и веса груза. Калькулятор на сайте считает точно, менеджер подтверждает при звонке." },
  { q: "Работаете ли вы с НДС?", a: "Да, работаем с юридическими лицами по договору, предоставляем полный пакет закрывающих документов." },
  { q: "Можно ли заказать резку металла?", a: "Да, гильотина и ленточная пила — резка в размер от 1 метра, стоимость от 50 ₽ за рез." },
  { q: "Какие документы на песок и щебень?", a: "Паспорт качества на каждую партию, сертификаты соответствия по запросу." },
];

function StrikerFaq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="border-b" style={{ borderColor: "var(--theme-border)", borderWidth: "0 0 var(--theme-border-weight)" }}>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <h2 className="mb-6 text-2xl font-black uppercase tracking-tight">Частые вопросы</h2>
        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <div key={i} style={{ background: "var(--theme-card)", border: "var(--theme-border-weight) solid var(--theme-border)" }}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-black uppercase">
                {f.q}
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} style={{ color: "var(--theme-primary)" }} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm font-medium opacity-70">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ Testimonials ============ */

const REVIEWS = [
  { name: "ООО «СтройМонтаж»", role: "Подрядчик, Москва", text: "Берём арматуру и швеллер регулярно. Резка в размер, доставка манипулятором всегда вовремя.", rating: 5 },
  { name: "ИП Кузнецов", role: "Частный застройщик", text: "Песок привезли на следующий день после заказа. Цена как на сайте, без сюрпризов.", rating: 5 },
  { name: "АО «ДорСтрой»", role: "Дорожное строительство", text: "Щебень гранитный вагонами — отличная логистика и документы. Рекомендуем.", rating: 4 },
];

function StrikerTestimonials() {
  return (
    <section className="border-b" style={{ borderColor: "var(--theme-border)", borderWidth: "0 0 var(--theme-border-weight)" }}>
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <h2 className="mb-6 text-2xl font-black uppercase tracking-tight">Отзывы клиентов</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col p-5"
              style={{ background: "var(--theme-card)", border: "var(--theme-border-weight) solid var(--theme-border)" }}
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className={`h-4 w-4 ${s < r.rating ? "" : "opacity-25"}`} style={{ color: "var(--theme-primary)" }} />
                ))}
              </div>
              <p className="mb-4 text-sm font-medium leading-relaxed opacity-80">«{r.text}»</p>
              <div className="mt-auto">
                <div className="text-sm font-black uppercase">{r.name}</div>
                <div className="text-xs opacity-50">{r.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ Blog ============ */

const POSTS = [
  { title: "Как выбрать арматуру для фундамента", tag: "Металлопрокат", time: "5 мин" },
  { title: "Песок мытый vs карьерный: что выбрать", tag: "Сыпучие", time: "4 мин" },
  { title: "Логистика сыпучих: самосвал или вагон?", tag: "Опт", time: "7 мин" },
];

function StrikerBlog() {
  return (
    <section className="border-b" style={{ borderColor: "var(--theme-border)", borderWidth: "0 0 var(--theme-border-weight)" }}>
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tight">Статьи и аналитика</h2>
          <button className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest" style={{ color: "var(--theme-primary)" }}>
            Все статьи <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {POSTS.map((p, i) => (
            <motion.article
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="group cursor-pointer p-5"
              style={{ background: "var(--theme-card)", border: "var(--theme-border-weight) solid var(--theme-border)" }}
            >
              <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <span style={{ color: "var(--theme-primary)" }}>{p.tag}</span>
                <span className="opacity-40">· {p.time}</span>
              </div>
              <h3 className="text-base font-black uppercase leading-snug transition-opacity group-hover:opacity-70">{p.title}</h3>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest" style={{ color: "var(--theme-primary)" }}>
                Читать <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ Footer ============ */

function StrikerFooter({ content }: { content: ContentOverrides }) {
  return (
    <footer className="border-t" style={{ borderColor: "var(--theme-border)", borderWidth: "var(--theme-border-weight) 0 0", background: "var(--theme-card)" }}>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center font-black" style={{ background: "var(--theme-primary)", color: "var(--theme-background)" }}>П</span>
            <span className="text-sm font-black uppercase tracking-widest">Песок-Металл</span>
          </div>
          <p className="text-xs font-medium leading-relaxed opacity-60">
            Металлопрокат и сыпучие материалы в Москве и Московской области. Отгрузка 24/7.
          </p>
        </div>
        <div>
          <div className="mb-3 text-xs font-black uppercase tracking-widest" style={{ color: "var(--theme-primary)" }}>Каталог</div>
          <ul className="space-y-2 text-xs font-semibold opacity-70">
            <li>Металлопрокат</li>
            <li>Песок и щебень</li>
            <li>Цемент и смеси</li>
            <li>Доставка</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-black uppercase tracking-widest" style={{ color: "var(--theme-primary)" }}>Компания</div>
          <ul className="space-y-2 text-xs font-semibold opacity-70">
            <li>О складе</li>
            <li>Опт и тендеры</li>
            <li>Статьи</li>
            <li>Контакты</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-black uppercase tracking-widest" style={{ color: "var(--theme-primary)" }}>Контакты</div>
          <div className="space-y-2 text-xs font-semibold opacity-70">
            <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {content.phone}</div>
            <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> {content.address}</div>
            <div className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5" /> WhatsApp / Telegram</div>
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ borderColor: "var(--theme-border)" }}>
        © 2026 Песок-Металл · Создано в конструкторе тем
      </div>
    </footer>
  );
}
