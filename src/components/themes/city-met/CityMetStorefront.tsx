"use client";

/**
 * city-met — корневая композиция темы: карточный движок товаров.
 *
 * Иерархия страницы:
 *  1. Верхний ряд — 3 массивные bento-карточки [ ПЕСОК ] [ ЩЕБЕНЬ ] [ КЕРАМЗИТ ]
 *     с текстурными оверлеями (собственные высокомаржинальные категории).
 *  2. Dashboard Hub — слева 25% текстовое дерево разделов металлопроката,
 *     справа 75% канвас с точными rounded-карточками товаров (ProductCard),
 *     интерактивными селекторами единиц и живой математикой.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ShoppingCart, Truck, X } from "lucide-react";
import type { StorefrontProduct } from "@/lib/theme-storefront";
import { buildCatalog, type CityMetRow } from "./catalog-data";
import { CityMetBasketProvider, useCityMetBasket } from "./basket-context";
import CategorySidebar from "./CategorySidebar";
import BentoBulkCards from "./BentoBulkCards";
import ProductGrid from "./ProductGrid";
import FastCheckout from "./FastCheckout";
import { cn } from "@/lib/utils";

const PHONE = "+7 (495) 123-45-67";

interface CityMetStorefrontProps {
  products: StorefrontProduct[];
}

/** Внутренняя часть: состояние фильтров + корзина */
function CityMetContent({ rows }: { rows: CityMetRow[] }) {
  const { count } = useCityMetBasket();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  /** Строки после фильтра по разделу/подразделу (до тегов) */
  const scoped = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!activeCategory || r.category === activeCategory) &&
          (!activeSubcategory || r.subcategory === activeSubcategory)
      ),
    [rows, activeCategory, activeSubcategory]
  );

  /** Строки после фильтра по тегам (все активные теги обязательны) */
  const filtered = useMemo(
    () =>
      activeTags.length === 0
        ? scoped
        : scoped.filter((r) => activeTags.every((tag) => r.tags.includes(tag))),
    [scoped, activeTags]
  );

  const toggleTag = (tag: string) =>
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  /** Bento-карточка: выбирает раздел сыпучих и подраздел */
  const handleBentoSelect = (subcategory: string | null) => {
    setActiveCategory(subcategory ? "Строительные материалы в мешках" : null);
    setActiveSubcategory(subcategory);
    setActiveTags([]);
  };

  const title = activeSubcategory ?? activeCategory ?? "Весь каталог";

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-neutral-900 antialiased">
      {/* Шапка */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-sm font-black text-white">
              CM
            </span>
            <div>
              <div className="text-sm font-black uppercase tracking-tight">City-Met</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Металлопрокат и сыпучие · Москва и МО
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${PHONE.replace(/[^+\d]/g, "")}`}
              className="hidden items-center gap-2 text-sm font-black text-neutral-900 transition-colors hover:text-blue-600 sm:flex"
            >
              <Phone className="h-4 w-4 text-blue-600" />
              {PHONE}
            </a>
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              disabled={count === 0}
              className={cn(
                "flex h-10 items-center gap-2 rounded-full px-4 text-[11px] font-black uppercase tracking-widest text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                count > 0 ? "bg-neutral-900 hover:bg-neutral-700" : "bg-neutral-300"
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              Корзина
              {count > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-black">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Заголовок каталога */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-neutral-900">
              Прайс-лист металлопроката и сыпучих материалов
            </h1>
            <p className="mt-0.5 text-xs font-semibold text-neutral-500">
              Резка в размер, доставка манипулятором и самосвалом по Москве и МО
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-500">
            <Truck className="h-3.5 w-3.5 text-blue-600" />
            Отгрузка 24/7
          </span>
        </div>

        {/* 1. Верхний ряд: массивные bento-карточки сыпучих */}
        <BentoBulkCards
          rows={rows}
          activeSubcategory={activeSubcategory}
          onSelect={handleBentoSelect}
        />

        {/* 2. Dashboard Hub: 25% дерево разделов + 75% канвас карточек */}
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start">
          <CategorySidebar
            rows={rows}
            activeCategory={activeCategory}
            activeSubcategory={activeSubcategory}
            onSelectCategory={(c) => {
              setActiveCategory(c);
              setActiveTags([]);
            }}
            onSelectSubcategory={(s) => {
              setActiveSubcategory(s);
              setActiveTags([]);
            }}
          />

          <ProductGrid
            rows={filtered}
            scoped={scoped}
            title={title}
            activeTags={activeTags}
            onToggleTag={toggleTag}
            onClearTags={() => setActiveTags([])}
          />
        </div>
      </main>

      {/* Подвал */}
      <footer className="border-t border-neutral-200 bg-white py-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-4 text-[11px] font-bold uppercase tracking-widest text-neutral-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} City-Met · Металлопрокат и сыпучие материалы</p>
          <p>Москва, Каширское шоссе, 61 · Склад Пн–Сб 8:00–20:00</p>
          <a href={`tel:${PHONE.replace(/[^+\d]/g, "")}`} className="text-blue-600 hover:text-blue-700">
            {PHONE}
          </a>
        </div>
      </footer>

      {/* Модальное окно оформления */}
      <AnimatePresence>
        {checkoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-900/60 p-4 backdrop-blur-sm sm:p-8"
            onClick={(e) => {
              if (e.target === e.currentTarget) setCheckoutOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="w-full max-w-4xl"
            >
              <FastCheckout onClose={() => setCheckoutOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CityMetStorefront({ products }: CityMetStorefrontProps) {
  const rows = useMemo(() => buildCatalog(products), [products]);
  return (
    <CityMetBasketProvider>
      <CityMetContent rows={rows} />
    </CityMetBasketProvider>
  );
}
