"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InlineCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  totalProductCount: number;
  sectionId: string | null;
  sectionName: string | null;
  sectionSlug: string | null;
  sortOrder: number;
  children: InlineCategory[];
}

export interface InlineSection {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isVisible: boolean;
  categories: InlineCategory[];
}

/**
 * Inline (always-visible) catalog menu — 2-column layout:
 * LEFT: categories grouped by section (Песок и щебень / Металлопрокат)
 * RIGHT: subcategories of the hovered/active category
 */
export function InlineCatalogMenu({
  sections,
  categories,
}: {
  sections: InlineSection[];
  categories: InlineCategory[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const roots = categories.filter((c) => !c.parentId);
  const activeCat = roots.find((c) => c.id === activeId) ?? roots[0] ?? null;

  // Group roots by section
  const groupedRoots = useMemo(() => {
    if (sections && sections.length > 0) {
      return sections.filter((s) => s.isVisible).map((s) => ({
        sectionName: s.name,
        categories: s.categories.filter((c) => !c.parentId),
      }));
    }
    const groups = new Map<string, InlineCategory[]>();
    for (const c of roots) {
      const key = c.sectionName ?? "Прочее";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(c);
    }
    return Array.from(groups.entries()).map(([sectionName, cats]) => ({ sectionName, categories: cats }));
  }, [roots, sections]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Заголовок секции */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <Ruler className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">
              Каталог металлопроката и справочник типоразмеров
            </h2>
          </div>
          <p className="mt-1 text-xs font-semibold text-neutral-500">
            Прямая выборка с ценами за метр и тонну · Наличие на складе в Москве
          </p>
        </div>
      </div>

      {/* 2-Column Layout: LEFT = categories, RIGHT = subcategories */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* LEFT COLUMN — categories grouped by section */}
        <div className="w-full shrink-0 lg:w-[40%] lg:max-w-[480px]">
          <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04),0_12px_24px_-8px_rgba(0,0,0,0.08)]">
            {groupedRoots.map((group, gIdx) => (
              <div key={group.sectionName}>
                {gIdx > 0 && <div className="my-2 h-px bg-neutral-100" />}
                <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  {group.sectionName}
                </div>
                {group.categories.map((cat) => {
                  const isActive = activeCat?.id === cat.id;
                  return (
                    <Link
                      key={cat.id}
                      href={`/shop/${encodeURIComponent(cat.slug)}`}
                      className={cn(
                        "group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all duration-200",
                        isActive
                          ? "bg-neutral-900 text-white shadow-md"
                          : "text-neutral-900 hover:bg-neutral-50 hover:text-red-600"
                      )}
                      onMouseEnter={() => setActiveId(cat.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs font-black uppercase tracking-wide transition-colors",
                              isActive ? "text-white" : "text-neutral-900 group-hover:text-red-600"
                            )}
                          >
                            {cat.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {cat.totalProductCount > 0 && (
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 text-[10px] font-black tabular-nums transition-colors",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-neutral-100 text-neutral-500 group-hover:bg-red-50 group-hover:text-red-600"
                            )}
                          >
                            {cat.totalProductCount}
                          </span>
                        )}
                        {cat.children.length > 0 && (
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              isActive
                                ? "text-white"
                                : "text-neutral-300 group-hover:translate-x-0.5 group-hover:text-red-600"
                            )}
                          />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN — subcategories of active category */}
        <div className="min-w-0 flex-1 lg:w-[60%]">
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            {activeCat ? (
              <>
                <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
                  <Link
                    href={`/shop/${encodeURIComponent(activeCat.slug)}`}
                    className="flex items-center gap-2 text-sm font-black uppercase tracking-tight text-neutral-900 hover:text-red-600"
                  >
                    {activeCat.name}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <span className="text-[11px] font-bold text-neutral-400">
                    {activeCat.totalProductCount} товаров
                  </span>
                </div>
                {activeCat.children.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {activeCat.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/shop/${encodeURIComponent(sub.slug)}`}
                        className="group flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5 transition-all hover:border-red-200 hover:bg-red-50"
                      >
                        <span className="text-xs font-bold text-neutral-700 group-hover:text-red-600">
                          {sub.name}
                        </span>
                        {sub.totalProductCount > 0 && (
                          <span className="text-[10px] font-black tabular-nums text-neutral-400 group-hover:text-red-500">
                            {sub.totalProductCount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm font-bold text-neutral-400">
                      Нет подкатегорий
                    </p>
                    <Link
                      href={`/shop/${encodeURIComponent(activeCat.slug)}`}
                      className="mt-2 rounded-full bg-neutral-900 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-700"
                    >
                      Перейти в раздел →
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm font-bold text-neutral-400">
                  Категории не найдены
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
