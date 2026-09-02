"use client";

/**
 * city-met — многоуровневое текстовое дерево разделов.
 * Точная структурная копия city-met.ru: плотный plain-text каталог
 * без каруселей и плиток. Клик по подразделу фильтрует таблицу.
 *
 * Разделы:
 *  - Металл (спарсен с city-met.ru): АРМАТУРА, ТРУБЫ СТАЛЬНЫЕ,
 *    ФАСОННЫЙ & ЛИСТОВОЙ ПРОКАТ.
 *  - Наши сыпучие (админка): СТРОИТЕЛЬНЫЕ МАТЕРИАЛЫ В МЕШКАХ.
 */
import { ChevronDown } from "lucide-react";
import { CITY_MET_TREE, type CityMetRow } from "./catalog-data";
import { cn } from "@/lib/utils";

interface CategorySidebarProps {
  rows: CityMetRow[];
  activeCategory: string | null;
  activeSubcategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onSelectSubcategory: (subcategory: string | null) => void;
}

export default function CategorySidebar({
  rows,
  activeCategory,
  activeSubcategory,
  onSelectCategory,
  onSelectSubcategory,
}: CategorySidebarProps) {
  /** Количество позиций в разделе */
  const categoryCount = (category: string) => rows.filter((r) => r.category === category).length;

  /** Количество позиций в подразделе */
  const subcategoryCount = (category: string, subcategory: string) =>
    rows.filter((r) => r.category === category && r.subcategory === subcategory).length;

  return (
    <aside className="w-full shrink-0 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm lg:w-[25%] lg:min-w-[240px]">
      {/* Заголовок дерева */}
      <div className="border-b border-neutral-100 bg-neutral-50/70 px-3.5 py-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900">
          Каталог продукции
        </span>
      </div>

      <nav className="p-2">
        {/* Все позиции */}
        <button
          type="button"
          onClick={() => {
            onSelectCategory(null);
            onSelectSubcategory(null);
          }}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition-colors",
            activeCategory === null
              ? "bg-neutral-900 text-white"
              : "text-neutral-900 hover:bg-neutral-50"
          )}
        >
          <span>Все позиции</span>
          <span className={cn("text-[10px] font-black", activeCategory === null ? "text-white/80" : "text-neutral-400")}>
            {rows.length}
          </span>
        </button>

        {/* Разделы */}
        {CITY_MET_TREE.map((node) => {
          const isOpen = activeCategory === node.category;
          const count = categoryCount(node.category);
          return (
            <div key={node.category} className="mt-1">
              {/* Раздел верхнего уровня */}
              <button
                type="button"
                onClick={() => {
                  onSelectCategory(isOpen ? null : node.category);
                  onSelectSubcategory(null);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-black uppercase tracking-wide transition-colors",
                  isOpen ? "bg-neutral-100 text-blue-700" : "text-neutral-900 hover:bg-neutral-50"
                )}
              >
                <span>{node.category}</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-neutral-400">{count}</span>
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 text-neutral-400 transition-transform", isOpen && "rotate-180")}
                  />
                </span>
              </button>

              {/* Подразделы */}
              {isOpen && (
                <div className="mt-0.5 border-l-2 border-neutral-200 pl-2">
                  {node.subcategories.map((sub) => {
                    const subCount = subcategoryCount(node.category, sub);
                    const isActive = activeSubcategory === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => onSelectSubcategory(isActive ? null : sub)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-left text-[11px] font-semibold transition-colors",
                          isActive ? "bg-blue-600 text-white" : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        )}
                      >
                        <span>{sub}</span>
                        <span className={cn("text-[10px] font-black", isActive ? "text-white/80" : "text-neutral-400")}>
                          {subCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
