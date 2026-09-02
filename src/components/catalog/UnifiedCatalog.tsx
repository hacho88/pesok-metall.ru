"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  Layers,
  List,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Truck,
  X,
} from "lucide-react";
import { productImageSrc } from "@/lib/product-image";
import { cn } from "@/lib/utils";
import type { CategoryNode } from "@/components/catalog/CategorySidebar";
import type { UnifiedProduct } from "@/lib/unified-catalog";

const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

const TYPE_LABELS: Record<string, string> = {
  METALL: "Металлопрокат",
  BAG_30KG: "Мешок 30 кг",
  BIG_BAG_1TON: "Биг-бег 1 т",
  GENERAL_CONSTRUCTION: "Общестрой",
};

type SortMode = "popular" | "price-asc" | "price-desc" | "name";
type ViewMode = "grid" | "list";

interface CartItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  unit: string;
}

export function UnifiedCatalog({
  products,
  categories,
  title,
  subtitle,
}: {
  products: UnifiedProduct[];
  categories: CategoryNode[];
  title: string;
  subtitle?: string;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("popular");
  const [view, setView] = useState<ViewMode>("grid");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [formError, setFormError] = useState<string | null>(null);

  // Плоский список категорий для фильтра
  const flatCategories = useMemo(() => {
    const out: CategoryNode[] = [];
    const walk = (nodes: CategoryNode[], depth: number) => {
      nodes.forEach((n) => {
        out.push({ ...n, children: [] });
        if (n.children.length) walk(n.children, depth + 1);
      });
    };
    walk(categories, 0);
    return out;
  }, [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (typeFilter !== "ALL" && p.type !== typeFilter) return false;
      if (categorySlug && p.categorySlug !== categorySlug) return false;
      if (onlyInStock && !p.inStock) return false;
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
  }, [products, query, typeFilter, categorySlug, onlyInStock, sort]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSum = cart.reduce((s, i) => s + i.qty * i.price, 0);

  function addToCart(p: UnifiedProduct) {
    if (p.price == null || p.isOnOrder) return;
    const n = qty[p.id] ?? 1;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) {
        return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + n, price: p.price! } : i));
      }
      return [...prev, { id: p.id, name: p.name, qty: n, price: p.price!, unit: p.unit ?? "ед" }];
    });
  }

  async function submitOrder() {
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError("Укажите имя и телефон");
      return;
    }
    setSending(true);
    setFormError(null);
    try {
      const message = cart
        .map((i) => `${i.name} — ${i.qty} × ${fmt(i.price)} ₽/${i.unit}`)
        .join("\n");
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          source: "vinsovkhoz-catalog",
          message: `Заказ из единого каталога:\n${message}\nИтого: ${fmt(cartSum)} ₽\nАдрес: ${form.address || "уточнить"}`,
        }),
      });
      if (!res.ok) throw new Error("Ошибка отправки");
      setOrderSent(true);
      setCart([]);
    } catch {
      setFormError("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
              <Layers className="h-3.5 w-3.5" />
              Единый каталог
            </span>
            <h1 className="font-jakarta text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
            {subtitle && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск: арматура, песок, труба..."
                className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm font-semibold outline-none transition-colors focus:border-primary sm:w-72"
              />
            </div>
            {/* Переключение вида */}
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
          </div>
        </div>

        {/* Панель фильтров */}
        <div className="mb-8 rounded-3xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              Фильтры
            </span>

            {/* Тип товара */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: "ALL", label: "Всё" },
                { value: "METALL", label: "Металлопрокат" },
                { value: "BAG_30KG", label: "Мешки 30 кг" },
                { value: "BIG_BAG_1TON", label: "Биг-беги 1 т" },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTypeFilter(t.value)}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-bold transition-all",
                    typeFilter === t.value
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

            {/* Только в наличии */}
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted-foreground">
              <button
                type="button"
                role="switch"
                aria-checked={onlyInStock}
                onClick={() => setOnlyInStock((v) => !v)}
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
              В наличии
            </label>

            <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

            {/* Сортировка */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="h-10 rounded-full border border-border bg-background px-4 text-sm font-bold outline-none focus:border-primary"
            >
              <option value="popular">Сначала популярные</option>
              <option value="price-asc">Цена: по возрастанию</option>
              <option value="price-desc">Цена: по убыванию</option>
              <option value="name">По названию</option>
            </select>

            <span className="ml-auto text-sm font-bold text-muted-foreground">
              Найдено: <span className="text-foreground">{filtered.length}</span>
            </span>
          </div>

          {/* Категории */}
          {flatCategories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setCategorySlug(null)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                  categorySlug === null
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                Все категории
              </button>
              {flatCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategorySlug(c.slug)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                    categorySlug === c.slug
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c.name}
                  <span className="ml-1.5 opacity-50">{c.productCount}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Сетка товаров */}
        {filtered.length > 0 ? (
          view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  qty={qty[p.id] ?? 1}
                  inCart={cart.some((i) => i.id === p.id)}
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
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Параметры</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Цена</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Кол-во</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => {
                    const n = qty[p.id] ?? 1;
                    const inCart = cart.some((i) => i.id === p.id);
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
                        <td className="px-4 py-3 text-xs font-medium text-muted-foreground">
                          {p.length || p.weightLabel || "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p.isOnOrder || p.price == null ? (
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Под заказ</span>
                          ) : (
                            <span className="text-base font-black">{fmt(p.price)} ₽<span className="text-xs font-bold text-muted-foreground">/{p.unit ?? "ед"}</span></span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <QtyStepper value={n} onChange={(v) => setQty((q) => ({ ...q, [p.id]: v }))} disabled={p.isOnOrder || p.price == null} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => addToCart(p)}
                            disabled={p.isOnOrder || p.price == null}
                            className={cn(
                              "inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-xs font-black transition-all active:scale-95 disabled:opacity-40",
                              inCart ? "bg-green-500 text-white" : "bg-primary text-primary-foreground hover:brightness-110"
                            )}
                          >
                            {inCart ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                            {inCart ? "В корзине" : "Заказать"}
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
      </div>

      {/* Плавающая корзина */}
      <div className={cn(
        "fixed bottom-8 left-1/2 z-40 -translate-x-1/2 transition-all duration-500",
        cart.length > 0 ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
      )}>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-4 rounded-full bg-foreground p-2 pr-8 text-background shadow-2xl ring-4 ring-background/50 transition-all hover:scale-105 active:scale-95"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-black text-primary-foreground">
            {cartCount}
          </div>
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Корзина</div>
            <div className="text-sm font-bold">{fmt(cartSum)} ₽</div>
          </div>
          <ArrowRight className="ml-4 h-5 w-5 animate-pulse text-primary" />
        </button>
      </div>

      {/* Модалка оформления */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => { setModalOpen(false); setOrderSent(false); }} />
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-border bg-card p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            {orderSent ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/15 text-green-500">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Заявка принята!</h3>
                <p className="mt-3 text-muted-foreground">
                  Менеджер свяжется с вами в течение 15 минут для подтверждения доставки.
                </p>
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setOrderSent(false); }}
                  className="mt-8 h-12 w-full rounded-2xl bg-primary font-black uppercase tracking-widest text-primary-foreground"
                >
                  Отлично
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-black tracking-tight">Ваш заказ</h3>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 max-h-56 space-y-3 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4">
                      <div className="min-w-0 pr-4">
                        <p className="truncate text-sm font-bold">{item.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {item.qty} × {fmt(item.price)} ₽/{item.unit}
                        </p>
                      </div>
                      <span className="whitespace-nowrap text-sm font-black">{fmt(item.qty * item.price)} ₽</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ваше имя"
                    className="h-13 w-full rounded-2xl border-2 border-border bg-background px-5 py-3.5 font-bold outline-none transition-colors focus:border-primary"
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+7 (999) 000-00-00"
                    type="tel"
                    className="h-13 w-full rounded-2xl border-2 border-border bg-background px-5 py-3.5 font-bold outline-none transition-colors focus:border-primary"
                  />
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Адрес доставки (необязательно)"
                    className="h-13 w-full rounded-2xl border-2 border-border bg-background px-5 py-3.5 font-bold outline-none transition-colors focus:border-primary"
                  />
                  {formError && <p className="px-2 text-xs font-bold text-destructive">{formError}</p>}

                  <div className="flex items-center justify-between px-2 pt-2">
                    <span className="text-sm font-bold text-muted-foreground">ИТОГО:</span>
                    <span className="text-3xl font-black">{fmt(cartSum)} ₽</span>
                  </div>

                  <button
                    type="button"
                    onClick={submitOrder}
                    disabled={sending}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-black uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                  >
                    {sending ? "Отправка..." : "Подтвердить заказ"}
                    <Truck className="h-5 w-5" />
                  </button>
                  <p className="text-center text-[10px] font-medium text-muted-foreground">
                    Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
  inCart,
  onQty,
  onAdd,
}: {
  product: UnifiedProduct;
  qty: number;
  inCart: boolean;
  onQty: (n: number) => void;
  onAdd: () => void;
}) {
  const img = productImageSrc(p.imageLocal, p.imageUrl);
  const available = !p.isOnOrder && p.price != null;

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
        {(p.length || p.weightLabel) && (
          <p className="mt-1.5 text-xs font-medium text-muted-foreground">
            {[p.length, p.weightLabel].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {available ? (
              <>
                <p className="text-2xl font-black tracking-tight">{fmt(p.price!)} ₽</p>
                <p className="text-xs font-bold text-muted-foreground">за {p.unit ?? "ед."}</p>
              </>
            ) : (
              <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">Под заказ</span>
            )}
          </div>
          <QtyStepper value={qty} onChange={onQty} disabled={!available} />
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={!available}
          className={cn(
            "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-40",
            inCart
              ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
              : "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110"
          )}
        >
          {inCart ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          {inCart ? "В корзине" : "В корзину"}
        </button>
      </div>
    </div>
  );
}
