"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  Home,
  Layers,
  List,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { productImageSrc } from "@/lib/product-image";
import { cn } from "@/lib/utils";
import { calcLineWeightKg, getUnitInfo, kgToTons } from "@/lib/product-units";
import { categoryIcon } from "@/lib/category-icons";
import type { CategoryNode } from "@/components/catalog/CategorySidebar";
import type { UnifiedProduct } from "@/lib/unified-catalog";
import { useCart } from "@/components/checkout/CartContext";
import type { CheckoutCartItem } from "@/types/checkout";

const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

const TYPE_LABELS: Record<string, string> = {
  METALL: "Металлопрокат",
  BAG_30KG: "Мешок 30 кг",
  BIG_BAG_1TON: "Биг-бег 1 т",
  GENERAL_CONSTRUCTION: "Общестрой",
};

type SortMode = "popular" | "price-asc" | "price-desc" | "name";
type ViewMode = "grid" | "list";
type UnitFilter = "ALL" | "м" | "шт" | "лист" | "кг";

const POPULAR_CATEGORIES = [
  "Арматура",
  "Труба профильная",
  "Труба электросварная",
  "Уголок",
  "Швеллер",
  "Лист",
  "Сетка",
  "Сваи",
  "Песок",
  "Щебень",
];

const UNIT_FILTERS: { value: UnitFilter; label: string }[] = [
  { value: "ALL", label: "Все" },
  { value: "м", label: "За метр" },
  { value: "шт", label: "За штуку" },
  { value: "лист", label: "За лист" },
  { value: "кг", label: "За кг" },
];

/** Сколько позиций показывать сразу; остальное — кнопкой «Показать ещё» */
const PAGE_SIZE = 24;

/** Преобразование товара единого каталога в позицию корзины FastCheckout */
function unifiedToCartItem(p: UnifiedProduct, quantity = 1): CheckoutCartItem {
  const gostAttr = p.attributes.find((a) => /гост|gost/i.test(a.key));
  const unit = p.unit ?? "ед.";
  return {
    productId: p.id,
    sku: p.slug,
    name: p.groupName || p.name,
    gost: gostAttr?.value ?? null,
    unit,
    quantity,
    weightKg: p.weightKg,
    weightTons: kgToTons(calcLineWeightKg(unit, p.weightKg, quantity, p.type)),
    pricePerUnit: p.price,
    lineTotal: p.price != null ? p.price * quantity : null,
  };
}

/**
 * Полноценный каталог: слева дерево категорий и фильтры, справа товары.
 * Работает на общем контексте корзины (CartProvider) и открывает FastCheckout.
 */
export function FullCatalog({
  products,
  categories,
  title,
  subtitle,
  totalProducts,
}: {
  products: UnifiedProduct[];
  categories: CategoryNode[];
  title: string;
  subtitle?: string;
  totalProducts?: number;
}) {
  const { addItem, setOpen } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [unitFilter, setUnitFilter] = useState<UnitFilter>("ALL");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("popular");
  const [view, setView] = useState<ViewMode>("grid");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [catQuery, setCatQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // При смене фильтров/сортировки возвращаемся к первой странице
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, typeFilter, unitFilter, categorySlug, onlyInStock, priceMin, priceMax, sort]);

  // Счётчики позиций по категориям — из фактически загруженных товаров
  const categoryCounts = useMemo(() => {
    const direct = new Map<string, number>();
    products.forEach((p) => direct.set(p.categorySlug, (direct.get(p.categorySlug) ?? 0) + 1));
    const total = new Map<string, number>();
    const walk = (nodes: CategoryNode[]): number => {
      let sum = 0;
      nodes.forEach((n) => {
        const childrenSum = walk(n.children);
        const own = direct.get(n.slug) ?? 0;
        total.set(n.id, own + childrenSum);
        sum += own + childrenSum;
      });
      return sum;
    };
    walk(categories);
    return total;
  }, [products, categories]);

  const isLimited = totalProducts != null && totalProducts > products.length;

  // Плоский список категорий для фильтра
  const flatCategories = useMemo(() => {
    const out: CategoryNode[] = [];
    const walk = (nodes: CategoryNode[]) => {
      nodes.forEach((n) => {
        out.push({ ...n, children: [] });
        if (n.children.length) walk(n.children);
      });
    };
    walk(categories);
    return out;
  }, [categories]);

  // Границы цен для подсказок в фильтре
  const priceBounds = useMemo(() => {
    const prices = products.map((p) => p.price).filter((x): x is number => x != null);
    return {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    };
  }, [products]);

  // Дерево категорий с учётом поиска: оставляем совпавшие и их предков
  const filteredTree = useMemo(() => {
    const q = catQuery.trim().toLowerCase();
    if (!q) return categories;
    const filterNode = (nodes: CategoryNode[]): CategoryNode[] =>
      nodes
        .map((n) => {
          const children = filterNode(n.children);
          const self = n.name.toLowerCase().includes(q);
          if (self || children.length) return { ...n, children };
          return null;
        })
        .filter((n): n is CategoryNode => n != null);
    return filterNode(categories);
  }, [categories, catQuery]);

  // Автораскрытие предков активной категории
  const autoExpand = useMemo(() => {
    const set = new Set<string>();
    const walk = (nodes: CategoryNode[], path: string[] = []) => {
      nodes.forEach((n) => {
        const p = [...path, n.id];
        if (n.slug === categorySlug) p.forEach((id) => set.add(id));
        if (n.children.length) walk(n.children, p);
      });
    };
    walk(categories);
    return set;
  }, [categories, categorySlug]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);
    let list = products.filter((p) => {
      if (typeFilter !== "ALL" && p.type !== typeFilter) return false;
      if (unitFilter !== "ALL") {
        const info = getUnitInfo(p.unit, Number(p.weightKg), p.price, p.type);
        if (info.unit !== unitFilter) return false;
      }
      if (categorySlug && p.categorySlug !== categorySlug) return false;
      if (onlyInStock && !p.inStock) return false;
      if (!isNaN(min) && (p.price ?? Infinity) < min) return false;
      if (!isNaN(max) && (p.price ?? -Infinity) > max) return false;
      if (q && !`${p.name} ${p.categoryName}`.toLowerCase().includes(q)) return false;
      return true;
    });

    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "price-desc":
        list = [...list].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
        break;
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ru"));
        break;
      default:
        break;
    }
    return list;
  }, [products, query, typeFilter, categorySlug, onlyInStock, sort, priceMin, priceMax]);

  // Видимая часть списка — не все товары сразу
  const visibleProducts = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const activeFilterCount =
    (categorySlug ? 1 : 0) +
    (typeFilter !== "ALL" ? 1 : 0) +
    (unitFilter !== "ALL" ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (priceMin || priceMax ? 1 : 0) +
    (query ? 1 : 0);

  function resetFilters() {
    setCategorySlug(null);
    setTypeFilter("ALL");
    setUnitFilter("ALL");
    setOnlyInStock(false);
    setPriceMin("");
    setPriceMax("");
    setQuery("");
  }

  function addToCart(p: UnifiedProduct) {
    if (p.price == null || p.isOnOrder) return;
    const n = qty[p.id] ?? 1;
    addItem(unifiedToCartItem(p, n));
    setAdded((a) => ({ ...a, [p.id]: true }));
    setTimeout(() => setAdded((a) => ({ ...a, [p.id]: false })), 1200);
  }

  return (
    <section id="catalog" className="block-section py-12">
      <div className="mx-auto max-w-[1440px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 transition-colors hover:text-primary">
            <Home className="h-3.5 w-3.5" />
            Главная
          </Link>
          <ChevronRight className="h-3 w-3 opacity-50" />
          <Link href="/catalog" className="transition-colors hover:text-primary">Каталог</Link>
          {categorySlug && (
            <>
              <ChevronRight className="h-3 w-3 opacity-50" />
              <span className="text-foreground">
                {flatCategories.find((c) => c.slug === categorySlug)?.name ?? categorySlug}
              </span>
            </>
          )}
        </nav>

        {/* Заголовок */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
              <Layers className="h-3.5 w-3.5" />
              {categorySlug ? flatCategories.find((c) => c.slug === categorySlug)?.name ?? "Категория" : "Весь ассортимент"}
            </span>
            <h2 className="font-jakarta text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
            {subtitle && <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>}
            {isLimited && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="text-sm font-bold text-foreground">
                  Показаны популярные позиции — {products.length} из {totalProducts}
                </p>
                <Link
                  href="/catalog"
                  className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-110 active:scale-95"
                >
                  Весь каталог
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск: арматура, песок, труба..."
                className="h-11 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm font-semibold outline-none transition-colors focus:border-primary sm:w-72"
              />
            </div>
            <div className="flex items-center rounded-full border border-border bg-card p-1">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Сетка"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Список"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="h-11 rounded-full border border-border bg-card px-4 text-sm font-bold outline-none transition-colors focus:border-primary"
            >
              <option value="popular">Сначала популярные</option>
              <option value="price-asc">Цена ↑</option>
              <option value="price-desc">Цена ↓</option>
              <option value="name">По названию</option>
            </select>
          </div>
        </div>

        {/* Популярные категории — быстрый вход */}
        <div className="mb-6 flex items-center gap-3">
          <span className="hidden shrink-0 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground sm:block">
            Популярное:
          </span>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {POPULAR_CATEGORIES.map((name) => {
              const cat = flatCategories.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));
              const isActive = categorySlug === cat?.slug;
              return (
                <Link
                  key={name}
                  href={cat ? `/catalog/${cat.slug}` : "#"}
                  onClick={(e) => { if (!cat) e.preventDefault(); }}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary"
                  )}
                >
                  {name}
                  {cat ? ` · ${categoryCounts.get(cat.id) ?? 0}` : ""}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Две колонки: категории слева, товары справа */}
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Левая колонка — категории и фильтры */}
          <aside className="space-y-4 self-start lg:sticky lg:top-24">
            {/* Мобильная панель: чипы категорий + кнопка «Фильтры» */}
            <div className="lg:hidden">
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Link
                  href="/catalog"
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
                    categorySlug === null
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground"
                  )}
                >
                  Все товары
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/catalog/${c.slug}`}
                    className={cn(
                      "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
                      categorySlug === c.slug
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    {c.name} · {categoryCounts.get(c.id) ?? 0}
                  </Link>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((v) => !v)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-black transition-colors hover:border-primary/50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Фильтры
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-black text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {mobileFiltersOpen && (
                <div className="mt-3 rounded-2xl border border-border bg-card p-4">
                  <FilterPanel
                    unitFilter={unitFilter}
                    setUnitFilter={setUnitFilter}
                    onlyInStock={onlyInStock}
                    setOnlyInStock={setOnlyInStock}
                    priceMin={priceMin}
                    setPriceMin={setPriceMin}
                    priceMax={priceMax}
                    setPriceMax={setPriceMax}
                    priceBounds={priceBounds}
                    sort={sort}
                    setSort={setSort}
                  />
                </div>
              )}
            </div>

            {/* Десктоп: категории — компактное дерево с поиском */}
            <div className="hidden rounded-2xl border border-border bg-card p-4 lg:block">
              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                <Layers className="h-3.5 w-3.5" />
                Категории
              </h4>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={catQuery}
                  onChange={(e) => setCatQuery(e.target.value)}
                  placeholder="Найти категорию..."
                  className="h-9 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-xs font-semibold outline-none transition-colors focus:border-primary"
                />
              </div>
              <nav className="mt-3 max-h-[calc(100vh-320px)] space-y-0.5 overflow-y-auto pr-1">
                <Link
                  href="/catalog"
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] font-bold transition-all",
                    categorySlug === null
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 opacity-60" />
                    <span>Все товары</span>
                  </span>
                  <span className="text-[11px] opacity-70">{products.length}</span>
                </Link>
                {filteredTree.map((c) => (
                  <CategoryTreeItem
                    key={c.id}
                    category={c}
                    activeSlug={categorySlug}
                    expanded={expanded}
                    autoExpand={autoExpand}
                    forceOpen={!!catQuery.trim()}
                    counts={categoryCounts}
                    onToggle={() => setExpanded((e) => ({ ...e, [c.id]: !e[c.id] }))}
                    onSelect={(slug) => setCategorySlug(slug)}
                  />
                ))}
                {filteredTree.length === 0 && (
                  <p className="px-3 py-2 text-xs text-muted-foreground">Ничего не найдено</p>
                )}
              </nav>
            </div>

            {/* Десктоп: фильтры */}
            <div className="hidden rounded-2xl border border-border bg-card p-4 lg:block">
              <FilterPanel
                unitFilter={unitFilter}
                setUnitFilter={setUnitFilter}
                onlyInStock={onlyInStock}
                setOnlyInStock={setOnlyInStock}
                priceMin={priceMin}
                setPriceMin={setPriceMin}
                priceMax={priceMax}
                setPriceMax={setPriceMax}
                priceBounds={priceBounds}
                sort={sort}
                setSort={setSort}
              />
            </div>
          </aside>

          {/* Правая колонка — товары */}
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-muted-foreground">
                Найдено: <span className="text-foreground">{filtered.length}</span> поз.
              </p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                  Сбросить всё
                </button>
              )}
            </div>

            {/* Активные фильтры */}
            {activeFilterCount > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {categorySlug && (
                  <FilterChip
                    label={flatCategories.find((c) => c.slug === categorySlug)?.name ?? categorySlug}
                    onRemove={() => setCategorySlug(null)}
                  />
                )}
                {unitFilter !== "ALL" && (
                  <FilterChip
                    label={UNIT_FILTERS.find((u) => u.value === unitFilter)?.label ?? unitFilter}
                    onRemove={() => setUnitFilter("ALL")}
                  />
                )}
                {onlyInStock && <FilterChip label="В наличии" onRemove={() => setOnlyInStock(false)} />}
                {(priceMin || priceMax) && (
                  <FilterChip
                    label={`Цена: ${priceMin || "0"}–${priceMax || "∞"} ₽`}
                    onRemove={() => {
                      setPriceMin("");
                      setPriceMax("");
                    }}
                  />
                )}
                {query && <FilterChip label={`Поиск: «${query}»`} onRemove={() => setQuery("")} />}
              </div>
            )}

            {filtered.length > 0 ? (
              view === "grid" ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      qty={qty[p.id] ?? 1}
                      added={!!added[p.id]}
                      onQty={(n) => setQty((q) => ({ ...q, [p.id]: n }))}
                      onAdd={() => addToCart(p)}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-border bg-card">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Товар</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Тип</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Вес</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Цена</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Цена за тонну</th>
                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Кол-во</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Действие</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {visibleProducts.map((p) => {
                        const n = qty[p.id] ?? 1;
                        const info = getUnitInfo(p.unit, Number(p.weightKg), p.price, p.type);
                        const available = !p.isOnOrder && p.price != null;
                        return (
                          <tr key={p.id} className="transition-colors hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
                                  {productImageSrc(p.imageLocal, p.imageUrl) ? (
                                    <Image src={productImageSrc(p.imageLocal, p.imageUrl)!} alt={p.name} fill className="object-contain p-1" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-lg font-black text-muted-foreground/30">
                                      {p.categoryName.slice(0, 1)}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <Link href={`/metall/${p.slug}`} className="block truncate text-sm font-bold hover:text-primary">
                                    {p.groupName || p.name}
                                  </Link>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{p.categoryName}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {TYPE_LABELS[p.type] ?? p.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-muted-foreground">
                              {info.weightLabel ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {available ? (
                                <span className="text-base font-black">{fmt(p.price!)} ₽<span className="text-xs font-bold text-muted-foreground"> {info.priceLabel}</span></span>
                              ) : (
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Под заказ</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {info.pricePerTon != null ? (
                                <span className="text-sm font-black text-primary">{fmt(info.pricePerTon)} ₽</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <QtyStepper value={n} onChange={(v) => setQty((q) => ({ ...q, [p.id]: v }))} disabled={!available} />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => addToCart(p)}
                                disabled={!available}
                                className={cn(
                                  "inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-xs font-black transition-all active:scale-95 disabled:opacity-40",
                                  added[p.id] ? "bg-green-500 text-white" : "bg-primary text-primary-foreground hover:brightness-110"
                                )}
                              >
                                {added[p.id] ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                                {added[p.id] ? "В корзине" : "Заказать"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed border-border py-24 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
                  <Package className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-black tracking-tight">Ничего не найдено</h3>
                <p className="mt-2 text-muted-foreground">Попробуйте изменить фильтры или поисковый запрос</p>
              </div>
            )}

            {/* Показать ещё — не вываливаем все товары сразу */}
            {visibleCount < filtered.length && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <p className="text-xs font-bold text-muted-foreground">
                  Показано {visibleProducts.length} из {filtered.length} поз.
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  className="flex items-center gap-2 rounded-full border-2 border-primary/30 bg-card px-8 py-3 text-sm font-black uppercase tracking-widest text-primary transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95"
                >
                  Показать ещё
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryTreeItem({
  category,
  activeSlug,
  expanded,
  autoExpand,
  forceOpen,
  counts,
  onToggle,
  onSelect,
  depth = 0,
}: {
  category: CategoryNode;
  activeSlug: string | null;
  expanded: Record<string, boolean>;
  autoExpand?: Set<string>;
  forceOpen?: boolean;
  counts: Map<string, number>;
  onToggle: () => void;
  onSelect: (slug: string) => void;
  depth?: number;
}) {
  const hasChildren = category.children.length > 0;
  const isOpen = forceOpen || (expanded[category.id] ?? autoExpand?.has(category.id) ?? false);
  const isActive = activeSlug === category.slug;
  const Icon = categoryIcon(category.name);

  return (
    <div>
      <div
        className={cn(
          "flex w-full items-center gap-1 rounded-lg py-1.5 text-[13px] font-bold transition-all",
          isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-foreground hover:bg-muted"
        )}
        style={{ paddingLeft: `${8 + depth * 12}px`, paddingRight: "8px" }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={onToggle}
            className="shrink-0 rounded p-0.5 transition-transform"
            aria-label="Развернуть категорию"
          >
            {isOpen ? <ChevronDown className="h-3 w-3 opacity-60" /> : <ChevronRight className="h-3 w-3 opacity-60" />}
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <Link href={`/catalog/${category.slug}`} className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left">
          <span className="flex min-w-0 items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />
            <span className="truncate">{category.name}</span>
          </span>
          <span className="shrink-0 text-[11px] opacity-60">{counts.get(category.id) ?? 0}</span>
        </Link>
      </div>
      {hasChildren && isOpen && (
        <div className="mt-0.5 space-y-0.5">
          {category.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              activeSlug={activeSlug}
              expanded={expanded}
              autoExpand={autoExpand}
              forceOpen={forceOpen}
              counts={counts}
              onToggle={() => onToggle()}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-3 pr-1.5 text-xs font-bold text-primary">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Убрать фильтр ${label}`}
        className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary/15 transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function FilterPanel({
  unitFilter,
  setUnitFilter,
  onlyInStock,
  setOnlyInStock,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  priceBounds,
  sort,
  setSort,
}: {
  unitFilter: UnitFilter;
  setUnitFilter: (v: UnitFilter) => void;
  onlyInStock: boolean;
  setOnlyInStock: (v: boolean) => void;
  priceMin: string;
  setPriceMin: (v: string) => void;
  priceMax: string;
  setPriceMax: (v: string) => void;
  priceBounds: { min: number; max: number };
  sort: SortMode;
  setSort: (v: SortMode) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Как продаётся */}
      <div>
        <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Как продаётся</label>
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          {UNIT_FILTERS.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => setUnitFilter(u.value)}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95",
                unitFilter === u.value
                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary"
              )}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Цена */}
      <div>
        <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Цена, ₽</label>
        <div className="mt-2.5 flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder={fmt(priceBounds.min)}
            className="h-9 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none transition-colors focus:border-primary"
          />
          <span className="text-xs font-bold text-muted-foreground">—</span>
          <input
            type="number"
            inputMode="numeric"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder={fmt(priceBounds.max)}
            className="h-9 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none transition-colors focus:border-primary"
          />
        </div>
      </div>

      {/* В наличии */}
      <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold">
        <span>Только в наличии</span>
        <button
          type="button"
          role="switch"
          aria-checked={onlyInStock}
          onClick={() => setOnlyInStock(!onlyInStock)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            onlyInStock ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
              onlyInStock ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
      </label>

      {/* Сортировка */}
      <div className="border-t border-border pt-4">
        <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Сортировка</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-bold outline-none focus:border-primary"
        >
          <option value="popular">Сначала популярные</option>
          <option value="price-asc">Цена: по возрастанию</option>
          <option value="price-desc">Цена: по убыванию</option>
          <option value="name">По названию</option>
        </select>
      </div>
    </div>
  );
}

function QtyStepper({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={cn(
      "mx-auto flex w-fit items-center overflow-hidden rounded-xl border-2 border-border bg-background",
      disabled && "opacity-40"
    )}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled}
        className="p-1.5 transition-colors hover:bg-muted"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
        disabled={disabled}
        className="w-10 border-x-2 border-border bg-transparent text-center text-sm font-bold outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled}
        className="p-1.5 transition-colors hover:bg-muted"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ProductCard({
  product: p,
  qty,
  added,
  onQty,
  onAdd,
}: {
  product: UnifiedProduct;
  qty: number;
  added: boolean;
  onQty: (n: number) => void;
  onAdd: () => void;
}) {
  const img = productImageSrc(p.imageLocal, p.imageUrl);
  const available = !p.isOnOrder && p.price != null;
  const info = getUnitInfo(p.unit, Number(p.weightKg), p.price, p.type);

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10">
      <div className="relative aspect-square overflow-hidden bg-background">
        {img ? (
          <Image src={img} alt={p.name} fill sizes="(max-width: 768px) 50vw, 300px" className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl font-black text-muted-foreground/15">
            {p.categoryName.slice(0, 1)}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm backdrop-blur">
          {TYPE_LABELS[p.type] ?? p.type}
        </span>
        {p.inStock && available && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-green-500/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
            <Check className="h-3 w-3" strokeWidth={4} />
            В наличии
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{p.categoryName}</p>
        <Link href={`/metall/${p.slug}`} className="mt-1.5 line-clamp-2 font-bold leading-snug transition-colors hover:text-primary">
          {p.groupName || p.name}
        </Link>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(() => {
            const dia = p.attributes.find((a) => /диаметр/i.test(a.key));
            if (dia) return (
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                ⌀ {dia.value}
              </span>
            );
            return null;
          })()}
          {(() => {
            const thick = p.attributes.find((a) => /толщ/i.test(a.key));
            if (thick) return (
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {thick.value}
              </span>
            );
            return null;
          })()}
          {p.length && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {p.length}
            </span>
          )}
          {info.weightLabel && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {info.weightLabel}
            </span>
          )}
          {(() => {
            const gost = p.attributes.find((a) => /гост/i.test(a.key));
            if (gost) return (
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {gost.value}
              </span>
            );
            return null;
          })()}
          {(() => {
            const grade = p.attributes.find((a) => /марка/i.test(a.key));
            if (grade) return (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {grade.value}
              </span>
            );
            return null;
          })()}
        </div>

        <div className="mt-auto pt-5">
          {available ? (
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-black tracking-tight">{fmt(p.price!)} ₽</p>
                <p className="text-xs font-bold text-muted-foreground">{info.priceLabel}</p>
              </div>
              {info.isLinear && info.pricePerTon != null && (
                <div className="text-right">
                  <p className="text-sm font-black text-primary">{fmt(info.pricePerTon)} ₽</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">за тонну</p>
                </div>
              )}
              <QtyStepper value={qty} onChange={onQty} disabled={!available} />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">Под заказ</span>
              <QtyStepper value={qty} onChange={onQty} disabled={!available} />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={!available}
          className={cn(
            "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-40",
            added
              ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
              : "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110"
          )}
        >
          {added ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          {added ? "В корзине" : "В корзину"}
        </button>
      </div>
    </div>
  );
}
