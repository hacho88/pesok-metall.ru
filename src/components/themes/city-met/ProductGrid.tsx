"use client";

/**
 * ProductGrid — правая часть dashboard hub (75%): канвас, который рендерит
 * точные rounded-карточки товаров по выбранному узлу дерева/бенто.
 * Сетка 1/2/3/4 колонки, плавные layout-анимации Framer Motion при
 * переключении разделов.
 */
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PackageSearch, SlidersHorizontal } from "lucide-react";
import type { CityMetRow } from "./catalog-data";
import ProductCard from "./ProductCard";
import FilterTags from "./FilterTags";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  rows: CityMetRow[];
  /** Строки до фильтра по тегам (для чипов) */
  scoped: CityMetRow[];
  title: string;
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

export default function ProductGrid({
  rows,
  scoped,
  title,
  activeTags,
  onToggleTag,
  onClearTags,
}: ProductGridProps) {
  /** Ключ для ре-анимации сетки при смене раздела */
  const sectionKey = useMemo(() => title, [title]);

  return (
    <section className="min-w-0 flex-1">
      {/* Шапка канваса */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm">
            <PackageSearch className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight text-neutral-900">{title}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              {rows.length} поз. · карточки товаров
            </p>
          </div>
        </div>
        {activeTags.length > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-blue-600/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
            <SlidersHorizontal className="h-3 w-3" />
            Фильтр: {activeTags.length}
          </span>
        )}
      </div>

      {/* Параметрические чипы */}
      <FilterTags
        rows={scoped}
        activeTags={activeTags}
        onToggleTag={onToggleTag}
        onClearTags={onClearTags}
      />

      {/* Сетка карточек */}
      <div className="mt-3">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-20 text-center">
            <PackageSearch className="h-10 w-10 text-neutral-300" />
            <p className="mt-3 text-sm font-black uppercase tracking-widest text-neutral-400">
              По выбранным фильтрам ничего не найдено
            </p>
            <button
              type="button"
              onClick={onClearTags}
              className="mt-3 rounded-full bg-neutral-900 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-700"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <motion.div
            key={sectionKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {rows.map((row) => (
                <ProductCard key={row.id} row={row} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
