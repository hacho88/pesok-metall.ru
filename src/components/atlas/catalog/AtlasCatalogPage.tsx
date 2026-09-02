"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, LayoutGrid, Table2, X, ChevronLeft, ChevronRight, FolderTree, Package, Frown } from "lucide-react";
import type { AtlasCategoryNode, AtlasProduct, AtlasFacet } from "@/lib/atlas/catalog";
import type { AtlasPageCategory } from "@/lib/atlas/config-schema";
import type { AtlasPrice } from "@/lib/atlas/pricing";
import { ProductCard } from "./ProductCard";
import { ProductTableRow } from "./ProductTableRow";
import { AtlasBreadcrumbs } from "./AtlasBreadcrumbs";
import { formatRub } from "@/lib/atlas/pricing";

interface ProductWithPrice {
  product: AtlasProduct;
  price: AtlasPrice;
}

export function AtlasCatalogPage({
  category,
  categoryDescription,
  tree,
  products,
  total,
  page,
  perPage,
  totalPages,
  facets,
  config,
  currentZoneSlug,
}: {
  category: AtlasCategoryNode | null;
  categoryDescription?: string | null;
  tree: AtlasCategoryNode[];
  products: ProductWithPrice[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: AtlasFacet[];
  config: AtlasPageCategory;
  currentZoneSlug: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"grid" | "table">(config.defaultView);
  const [showFilters, setShowFilters] = useState(false);

  const sort = searchParams.get("sort") || config.defaultSort;
  const stock = searchParams.get("stock") || "all";
  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  const selectedAttrs = useMemo(() => {
    const obj: Record<string, string[]> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("attr_")) {
        const attrKey = key.replace("attr_", "");
        obj[attrKey] = value.split(",");
      }
    }
    return obj;
  }, [searchParams]);

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    if (!updates.page) params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [router, searchParams]);

  const toggleAttr = (key: string, value: string) => {
    const current = selectedAttrs[key] || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    updateUrl({ [`attr_${key}`]: next.length > 0 ? next.join(",") : null });
  };

  const clearFilters = () => {
    router.push(window.location.pathname);
  };

  const hasActiveFilters = stock !== "all" || priceMin || priceMax || Object.keys(selectedAttrs).length > 0;
  const activeFilterCount = (stock !== "all" ? 1 : 0) + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + Object.values(selectedAttrs).flat().length;

  // Active filter chips
  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (stock === "in_stock") activeChips.push({ label: "В наличии", onRemove: () => updateUrl({ stock: null }) });
  if (stock === "on_order") activeChips.push({ label: "Под заказ", onRemove: () => updateUrl({ stock: null }) });
  if (priceMin) activeChips.push({ label: `от ${priceMin} ₽`, onRemove: () => updateUrl({ priceMin: null }) });
  if (priceMax) activeChips.push({ label: `до ${priceMax} ₽`, onRemove: () => updateUrl({ priceMax: null }) });
  for (const [key, values] of Object.entries(selectedAttrs)) {
    for (const v of values) {
      activeChips.push({ label: `${key}: ${v}`, onRemove: () => toggleAttr(key, v) });
    }
  }

  const subcategories = category?.children ?? tree.filter((n) => !n.parentId);

  const sortOptions = [
    { value: "popular", label: "По популярности" },
    { value: "price_asc", label: "Сначала дешёвые" },
    { value: "price_desc", label: "Сначала дорогие" },
    { value: "name_asc", label: "По названию" },
  ];

  return (
    <div className="atlas-fade-in">
      {/* Breadcrumbs */}
      <AtlasBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/shop" }, ...(category ? [{ label: category.name }] : [])]} />

      {/* Title */}
      <h1 className="text-3xl font-bold mt-4 mb-2 atlas-heading-accent" style={{ fontFamily: "var(--atlas-font-heading)" }}>
        {category ? category.name : "Каталог"}
      </h1>
      <p className="text-sm mb-4" style={{ color: "var(--atlas-text-muted)" }}>
        {total} {pluralize(total, "товар", "товара", "товаров")}
      </p>

      {/* Subcategory tiles */}
      {config.showSubcategoryTiles && subcategories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
          {subcategories.map((sub) => (
            <a
              key={sub.id}
              href={`/shop/${encodeURIComponent(sub.slug)}`}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-md atlas-card"
              style={{ background: "var(--atlas-surface)" }}
            >
              <FolderTree size={16} style={{ color: "var(--atlas-primary)" }} />
              <span className="truncate flex-1">{sub.name}</span>
              <span className="text-xs shrink-0 px-1.5 py-0.5 rounded-full" style={{ background: "var(--atlas-surface-2)", color: "var(--atlas-text-muted)" }}>{sub.totalProductCount}</span>
            </a>
          ))}
        </div>
      )}

      {/* Category description (top) */}
      {config.descriptionPosition === "top" && categoryDescription && (
        <div className="atlas-card p-5 mb-6 prose-atlas text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: categoryDescription }} />
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button
          className="atlas-btn atlas-btn-secondary atlas-btn-sm lg:hidden"
          onClick={() => setShowFilters(true)}
        >
          <SlidersHorizontal size={16} />
          Фильтры
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "var(--atlas-primary)", color: "var(--atlas-primary-fg)" }}>{activeFilterCount}</span>
          )}
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm hidden sm:inline" style={{ color: "var(--atlas-text-muted)" }}>Сортировка:</span>
          <select
            value={sort}
            onChange={(e) => updateUrl({ sort: e.target.value })}
            className="atlas-sort-select"
          >
            {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>

          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--atlas-border)" }}>
            <button
              className={`w-9 h-9 flex items-center justify-center transition-colors ${view === "grid" ? "" : "opacity-50"}`}
              style={{ background: view === "grid" ? "var(--atlas-surface-2)" : "transparent" }}
              onClick={() => setView("grid")}
              title="Сетка"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={`w-9 h-9 flex items-center justify-center transition-colors ${view === "table" ? "" : "opacity-50"}`}
              style={{ background: view === "table" ? "var(--atlas-surface-2)" : "transparent" }}
              onClick={() => setView("table")}
              title="Таблица"
            >
              <Table2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeChips.map((chip, i) => (
            <button key={i} className="atlas-filter-chip" onClick={chip.onRemove}>
              {chip.label}
              <X size={14} />
            </button>
          ))}
          <button onClick={clearFilters} className="text-sm font-medium hover:underline" style={{ color: "var(--atlas-text-muted)" }}>
            Сбросить всё
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filters sidebar (desktop) */}
        <aside className="w-[240px] shrink-0 hidden lg:block">
          <div className="atlas-card p-4 atlas-filter-sidebar atlas-scroll">
            <FilterContent
              config={config}
              stock={stock}
              priceMin={priceMin}
              priceMax={priceMax}
              facets={facets}
              selectedAttrs={selectedAttrs}
              updateUrl={updateUrl}
              toggleAttr={toggleAttr}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
            />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {showFilters && (
          <>
            <div className="atlas-mobile-filter-overlay lg:hidden" onClick={() => setShowFilters(false)} />
            <div className="atlas-mobile-filter-panel lg:hidden">
              <div className="sticky top-0 flex items-center justify-between p-4 border-b" style={{ background: "var(--atlas-surface)", borderColor: "var(--atlas-border)" }}>
                <h3 className="font-bold text-lg">Фильтры</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 rounded-lg hover:bg-[var(--atlas-surface-2)]"><X size={20} /></button>
              </div>
              <div className="p-4">
                <FilterContent
                  config={config}
                  stock={stock}
                  priceMin={priceMin}
                  priceMax={priceMax}
                  facets={facets}
                  selectedAttrs={selectedAttrs}
                  updateUrl={updateUrl}
                  toggleAttr={toggleAttr}
                  hasActiveFilters={hasActiveFilters}
                  clearFilters={clearFilters}
                />
              </div>
              <div className="sticky bottom-0 p-4 border-t" style={{ background: "var(--atlas-surface)", borderColor: "var(--atlas-border)" }}>
                <button className="atlas-btn atlas-btn-primary w-full atlas-btn-lg" onClick={() => setShowFilters(false)}>
                  Показать {total} {pluralize(total, "товар", "товара", "товаров")}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Products */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="atlas-empty-state atlas-card">
              <div className="atlas-empty-state-icon">
                <Frown size={36} style={{ color: "var(--atlas-text-muted)" }} />
              </div>
              <p className="text-lg font-bold mb-2">Товары не найдены</p>
              <p className="text-sm mb-4" style={{ color: "var(--atlas-text-muted)" }}>Попробуйте изменить фильтры или поисковый запрос</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="atlas-btn atlas-btn-primary">Сбросить фильтры</button>
              )}
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(({ product, price }) => (
                <ProductCard key={product.id} product={product} price={price} />
              ))}
            </div>
          ) : (
            <div className="atlas-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--atlas-surface-2)", borderBottom: "1px solid var(--atlas-border)" }}>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase" style={{ color: "var(--atlas-text-muted)" }}>Товар</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase hidden md:table-cell" style={{ color: "var(--atlas-text-muted)" }}>Характеристики</th>
                    <th className="text-right px-4 py-3 font-semibold text-xs uppercase" style={{ color: "var(--atlas-text-muted)" }}>Цена</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(({ product, price }) => (
                    <ProductTableRow key={product.id} product={product} price={price} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <a href={`?${buildPageUrl(searchParams, page - 1)}`} className="w-10 h-10 flex items-center justify-center rounded-lg atlas-card hover:shadow-md transition-shadow">
                  <ChevronLeft size={18} />
                </a>
              )}
              {buildPageRange(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-2">...</span>
                ) : (
                  <a
                    key={p}
                    href={`?${buildPageUrl(searchParams, p)}`}
                    className="w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-all hover:shadow-md"
                    style={{
                      background: p === page ? "var(--atlas-primary)" : "var(--atlas-surface)",
                      color: p === page ? "var(--atlas-primary-fg)" : "var(--atlas-text)",
                      border: p === page ? "none" : "1px solid var(--atlas-border)",
                    }}
                  >
                    {p}
                  </a>
                )
              )}
              {page < totalPages && (
                <a href={`?${buildPageUrl(searchParams, page + 1)}`} className="w-10 h-10 flex items-center justify-center rounded-lg atlas-card hover:shadow-md transition-shadow">
                  <ChevronRight size={18} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category description (bottom) */}
      {config.descriptionPosition === "bottom" && categoryDescription && (
        <div className="atlas-card p-5 mt-6 prose-atlas text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: categoryDescription }} />
      )}
    </div>
  );
}

function FilterContent({
  config, stock, priceMin, priceMax, facets, selectedAttrs, updateUrl, toggleAttr, hasActiveFilters, clearFilters,
}: any) {
  return (
    <>
      {/* Availability */}
      {config.filters.availability && (
        <FilterGroup title="Наличие">
          <FilterRadio name="stock" value="all" current={stock} onChange={(v: string) => updateUrl({ stock: v })} label="Все товары" />
          <FilterRadio name="stock" value="in_stock" current={stock} onChange={(v: string) => updateUrl({ stock: v })} label="В наличии" />
          <FilterRadio name="stock" value="on_order" current={stock} onChange={(v: string) => updateUrl({ stock: v })} label="Под заказ" />
        </FilterGroup>
      )}

      {/* Price */}
      {config.filters.price && (
        <FilterGroup title="Цена, ₽">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="от"
              value={priceMin || ""}
              onChange={(e: any) => updateUrl({ priceMin: e.target.value || null })}
              className="atlas-input"
              style={{ height: 36, fontSize: 13 }}
            />
            <input
              type="number"
              placeholder="до"
              value={priceMax || ""}
              onChange={(e: any) => updateUrl({ priceMax: e.target.value || null })}
              className="atlas-input"
              style={{ height: 36, fontSize: 13 }}
            />
          </div>
        </FilterGroup>
      )}

      {/* Attribute facets */}
      {config.filters.attributes && facets.slice(0, config.filters.maxAttributeFacets).map((facet: AtlasFacet) => (
        <FilterGroup key={facet.key} title={facet.key}>
          {facet.values.slice(0, 8).map((v) => (
            <label key={v.value} className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:text-[var(--atlas-primary)] transition-colors">
              <input
                type="checkbox"
                checked={(selectedAttrs[facet.key] || []).includes(v.value)}
                onChange={() => toggleAttr(facet.key, v.value)}
                style={{ accentColor: "var(--atlas-primary)" }}
              />
              <span className="flex-1">{v.value}</span>
              <span className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>{v.count}</span>
            </label>
          ))}
        </FilterGroup>
      ))}

      {hasActiveFilters && (
        <button onClick={clearFilters} className="atlas-btn atlas-btn-secondary atlas-btn-sm w-full mt-4">
          <X size={14} />
          Сбросить фильтры
        </button>
      )}
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 pb-4" style={{ borderBottom: "1px solid var(--atlas-border)" }}>
      <h4 className="font-semibold text-sm mb-2">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterRadio({ name, value, current, onChange, label }: { name: string; value: string; current: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:text-[var(--atlas-primary)] transition-colors">
      <input type="radio" name={name} checked={current === value} onChange={() => onChange(value)} style={{ accentColor: "var(--atlas-primary)" }} />
      {label}
    </label>
  );
}

function buildPageUrl(params: URLSearchParams, page: number): string {
  const p = new URLSearchParams(params.toString());
  p.set("page", String(page));
  return p.toString();
}

function buildPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const range: (number | "...")[] = [1];
  if (current > 3) range.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    range.push(i);
  }
  if (current < total - 2) range.push("...");
  range.push(total);
  return range;
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
