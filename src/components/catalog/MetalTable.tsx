"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Check, 
  CheckCircle2, 
  Clock, 
  Minus, 
  Phone, 
  Plus, 
  Search, 
  ShoppingCart, 
  X,
  Package,
  ArrowRight,
  ArrowLeft,
  Info,
  Scale,
  Ruler,
  ShoppingBag,
  MessageCircle,
  Truck,
  MapPin,
  User,
  CreditCard
} from "lucide-react";
import { productImageSrc } from "@/lib/product-image";
import { MetalSidebar } from "./MetalSidebar";
import type { CategoryNode } from "./CategorySidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export interface MetalProductData {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  price: number | null; // null = «под заказ»
  isOnOrder: boolean;
  unit?: string | null;
  weightKg: number;
  length?: string | null;
  weightLabel?: string | null;
  imageUrl?: string | null;
  imageLocal?: string | null;
  inStock: boolean;
  groupId?: string | null;
  groupName?: string | null;
}

interface CartItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  unit: string;
}

const fmt = (n: number) =>
  n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

const fmtDetailed = (n: number) =>
  n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

// Цена за тонну: для «м» — из веса метра, для «т» — та же, иначе нет переключателя
function pricePerTon(p: MetalProductData): number | null {
  if (p.price == null) return null;
  if (p.unit === "т") return p.price;
  if (p.unit === "м" && p.weightKg > 0) return (p.price / p.weightKg) * 1000;
  return null;
}

export function MetalTable({
  products,
  categories,
  activeSlug,
  title,
  subtitle,
}: {
  products: MetalProductData[];
  categories: CategoryNode[];
  activeSlug?: string;
  title: string;
  subtitle?: string;
}) {
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1=cart, 2=contacts, 3=delivery, 4=confirm
  const [form, setForm] = useState({ name: "", phone: "", address: "", deliveryType: "delivery", comment: "" });
  const [formError, setFormError] = useState<string | null>(null);

  // Состояние выбранных вариантов для каждой группы
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const groupedProducts = useMemo(() => {
    const groups: Record<string, MetalProductData[]> = {};
    const singles: MetalProductData[] = [];

    products.forEach(p => {
      if (p.groupId) {
        if (!groups[p.groupId]) groups[p.groupId] = [];
        groups[p.groupId].push(p);
      } else {
        singles.push(p);
      }
    });

    const result: MetalProductData[] = [...singles];
    Object.entries(groups).forEach(([gid, items]) => {
      // Сортируем варианты внутри группы (например, по весу или названию)
      items.sort((a, b) => a.weightKg - b.weightKg);
      
      // Берем либо уже выбранный вариант, либо первый
      const selectedId = selectedVariants[gid] || items[0].id;
      const selected = items.find(i => i.id === selectedId) || items[0];
      
      // Добавляем мета-данные о вариантах
      result.push({
        ...selected,
        _variants: items
      } as any);
    });

    return result;
  }, [products, selectedVariants]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groupedProducts;
    return groupedProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q)
    );
  }, [groupedProducts, query]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSum = cart.reduce((s, i) => s + i.qty * i.price, 0);

  function addToCart(p: MetalProductData) {
    const price = p.price;
    if (price == null) return;
    const n = qty[p.id] ?? 1;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) {
        return prev.map((i) =>
          i.id === p.id ? { ...i, qty: i.qty + n, price } : i
        );
      }
      return [...prev, { id: p.id, name: p.name, qty: n, price, unit: p.unit ?? "ед" }];
    });
  }

  function closeModal() {
    setModalOpen(false);
    setOrderSent(false);
    setCheckoutStep(1);
    setFormError(null);
  }

  function nextStep() {
    if (checkoutStep === 2) {
      if (!form.name.trim() || !form.phone.trim()) {
        setFormError("Укажите имя и телефон");
        return;
      }
    }
    setFormError(null);
    setCheckoutStep((s) => Math.min(s + 1, 4));
  }

  function prevStep() {
    setFormError(null);
    setCheckoutStep((s) => Math.max(s - 1, 1));
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
          source: "metal-catalog",
          message: `Заказ из каталога:\n${message}\nИтого: ${fmt(cartSum)} ₽\nДоставка: ${form.deliveryType === "delivery" ? form.address || "уточнить" : "самовывоз"}${form.comment ? `\nКомментарий: ${form.comment}` : ""}`,
        }),
      });
      if (!res.ok) throw new Error("Ошибка отправки");
      setOrderSent(true);
      setCart([]);
      setCheckoutStep(1);
    } catch {
      setFormError("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  }

  function sendWhatsApp() {
    const message = cart
      .map((i) => `${i.name} — ${i.qty} × ${fmt(i.price)} ₽/${i.unit}`)
      .join("\n");
    const text = encodeURIComponent(
      `Здравствуйте! Хочу заказать:\n${message}\nИтого: ${fmt(cartSum)} ₽\nИмя: ${form.name || ""}\nТелефон: ${form.phone || ""}`
    );
    window.open(`https://wa.me/74951234567?text=${text}`, "_blank");
  }

  return (
    <div className="metal-catalog-page min-h-screen bg-slate-50/40 font-jakarta">
      <div className="mx-auto flex max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:gap-8 lg:px-8">
        <MetalSidebar categories={categories} activeSlug={activeSlug} />
        
        <main className="flex-1 min-w-0">
          <div className="mb-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
              <div>
                <Badge variant="outline" className="mb-4 rounded-full border-slate-200 bg-white px-4 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                  Каталог продукции
                </Badge>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
                {subtitle && <p className="mt-4 text-lg text-slate-500 max-w-2xl leading-relaxed">{subtitle}</p>}
              </div>

              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск по названию или размеру..." 
                  className="h-14 rounded-full border-none bg-white pl-12 pr-6 text-sm font-medium shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-slate-900"
                />
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-36">Фото</th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Наименование</th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Параметры</th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Цена</th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Количество</th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((p) => {
                    const price = p.price;
                    const perTon = pricePerTon(p);
                    const n = qty[p.id] ?? 1;
                    const inCart = cart.some((i) => i.id === p.id);
                    const img = productImageSrc(p.imageLocal, p.imageUrl);

                    return (
                      <tr key={p.id} className="group transition-all duration-300 hover:bg-slate-50/80">
                        <td className="py-4 px-4">
                          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
                            {img ? (
                              <Image src={img} alt={p.name} fill className="object-contain p-2" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-50 text-2xl font-black text-slate-200">
                                {p.categoryName.slice(0, 1)}
                              </div>
                            )}
                            {!p.isOnOrder && (
                              <div className="absolute bottom-0 right-0 rounded-tl-lg bg-green-500 p-1 text-white shadow-sm">
                                <Check className="h-3 w-3" strokeWidth={4} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 min-w-[200px]">
                          <Link href={`/metall/${p.slug}`} className="block">
                            <span className="block text-sm font-bold text-slate-900 group-hover:text-slate-700">
                              {(p as any).groupName || p.name}
                            </span>
                            <span className="mt-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">{p.categoryName}</span>
                          </Link>
                          
                          {/* Селектор вариантов */}
                          {(p as any)._variants && (p as any)._variants.length > 1 && (
                            <div className="mt-3">
                              <select 
                                value={p.id}
                                onChange={(e) => setSelectedVariants(prev => ({ ...prev, [p.groupId!]: e.target.value }))}
                                className="w-full rounded-lg border border-slate-100 bg-slate-50/50 px-2 py-1.5 text-[11px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900"
                              >
                                {(p as any)._variants.map((v: any) => (
                                  <option key={v.id} value={v.id}>
                                    {v.name.replace(p.groupName || "", "").trim() || "Стандарт"}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            {p.length ? (
                              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                <Ruler className="h-3 w-3 text-slate-300" />
                                {p.length}
                              </div>
                            ) : (
                              <Badge variant="secondary" className="w-fit rounded-md bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Стандарт</Badge>
                            )}
                            {p.weightLabel ? (
                              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                <Scale className="h-3 w-3 text-slate-300" />
                                {p.weightLabel}
                              </div>
                            ) : (
                              <Badge variant="secondary" className="w-fit rounded-md bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono text-slate-400">ГОСТ</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          {p.isOnOrder || price == null ? (
                            <Badge className="bg-slate-100 text-slate-500 shadow-none hover:bg-slate-100">ПОД ЗАКАЗ</Badge>
                          ) : (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-base font-bold text-slate-900">{fmt(price)} ₽/{p.unit ?? "ед"}</span>
                              {perTon && (
                                <Badge variant="secondary" className="rounded-md bg-slate-900/5 text-[10px] font-bold text-slate-500 px-1.5 py-0">
                                  {fmtDetailed(perTon)} ₽/т
                                </Badge>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="mx-auto flex w-fit items-center overflow-hidden rounded-xl border-2 border-slate-100 bg-white shadow-sm">
                            <button 
                              onClick={() => setQty(q => ({ ...q, [p.id]: Math.max(1, n - 1) }))}
                              className="p-1.5 transition-colors hover:bg-slate-50"
                            >
                              <Minus className="h-3.5 w-3.5 text-slate-400" />
                            </button>
                            <input 
                              type="number" 
                              value={n} 
                              onChange={(e) => setQty(q => ({ ...q, [p.id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                              className="w-10 border-x-2 border-slate-100 bg-transparent text-center text-sm font-bold text-slate-900 focus:outline-none"
                            />
                            <button 
                              onClick={() => setQty(q => ({ ...q, [p.id]: n + 1 }))}
                              className="p-1.5 transition-colors hover:bg-slate-50"
                            >
                              <Plus className="h-3.5 w-3.5 text-slate-400" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <Button 
                            onClick={() => addToCart(p)}
                            disabled={p.isOnOrder}
                            className={cn(
                              "h-10 rounded-xl px-4 text-xs font-black shadow-md transition-all active:scale-95 whitespace-nowrap",
                              inCart 
                                ? "bg-green-500 text-white hover:bg-green-600 shadow-green-200" 
                                : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
                            )}
                          >
                            {inCart ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> : <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />}
                            {inCart ? "В КОРЗИНЕ" : "ЗАКАЗАТЬ"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {filtered.map((p) => {
                const price = p.price;
                const perTon = pricePerTon(p);
                const n = qty[p.id] ?? 1;
                const inCart = cart.some((i) => i.id === p.id);
                const img = productImageSrc(p.imageLocal, p.imageUrl);

                return (
                  <div key={p.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex gap-4 mb-5">
                      <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
                        {img ? (
                          <Image src={img} alt={p.name} fill className="object-contain p-3" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-200">
                            {p.categoryName.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{p.categoryName}</span>
                        <h3 className="line-clamp-2 text-sm font-bold text-slate-900 leading-snug">{p.name}</h3>
                        <div className="mt-2 flex gap-3">
                           {p.length && <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Ruler className="h-3 w-3" /> {p.length}</span>}
                           {p.weightLabel && <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Scale className="h-3 w-3" /> {p.weightLabel}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                      <div>
                        {p.isOnOrder || price == null ? (
                          <span className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Под заказ</span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-900">{fmt(price)} ₽/{p.unit ?? "ед"}</span>
                            {perTon && <span className="text-[10px] font-bold text-slate-400">{fmtDetailed(perTon)} ₽/т</span>}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center overflow-hidden rounded-lg border-2 border-slate-100">
                        <button 
                          onClick={() => setQty(q => ({ ...q, [p.id]: Math.max(1, n - 1) }))}
                          className="px-2 py-1 text-slate-400"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">{n}</span>
                        <button 
                          onClick={() => setQty(q => ({ ...q, [p.id]: n + 1 }))}
                          className="px-2 py-1 text-slate-400"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <Button 
                      onClick={() => addToCart(p)}
                      disabled={p.isOnOrder}
                      className={cn(
                        "mt-4 w-full h-12 rounded-2xl font-black shadow-lg transition-all active:scale-[0.98]",
                        inCart 
                          ? "bg-green-500 text-white shadow-green-100" 
                          : "bg-slate-900 text-white shadow-slate-100"
                      )}
                    >
                      {inCart ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
                      {inCart ? "В КОРЗИНЕ" : "В КОРЗИНУ"}
                    </Button>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-slate-100 py-24 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-200">
                  <Package className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-slate-900">Ничего не найдено</h3>
                <p className="mt-2 text-slate-500">Попробуйте изменить параметры поиска или категорию</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Mini Cart */}
      <div className={cn(
        "fixed bottom-8 left-1/2 z-40 -translate-x-1/2 transition-all duration-500",
        cart.length > 0 ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
      )}>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-4 rounded-full bg-slate-900 p-2 pr-8 text-white shadow-2xl shadow-slate-900/40 ring-4 ring-white transition-all hover:scale-105 active:scale-95"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 font-black">
            {cartCount}
          </div>
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Корзина</div>
            <div className="text-sm font-bold">{fmt(cartSum)} ₽</div>
          </div>
          <ArrowRight className="ml-4 h-5 w-5 animate-pulse text-primary" />
        </button>
      </div>

      {/* Multi-Step Checkout Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={closeModal} />
          <div className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col">
            {orderSent ? (
              <div className="flex flex-col items-center text-center py-10">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h3 className="text-3xl font-black tracking-tight text-slate-900">Заявка принята!</h3>
                <p className="mt-4 text-slate-500 leading-relaxed">
                  Менеджер уже получил ваш заказ и свяжется с вами в течение 15 минут для подтверждения времени доставки.
                </p>
                <Button onClick={closeModal} className="mt-10 h-14 w-full rounded-2xl bg-slate-900 text-base font-black uppercase tracking-widest">
                  ОТЛИЧНО
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Оформление</h3>
                  <button onClick={closeModal} className="rounded-full bg-slate-50 p-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Step indicator */}
                <div className="mb-6 flex items-center gap-2">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-black", checkoutStep >= s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>{s}</div>
                  ))}
                </div>

                <div className="mb-6 space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-50 bg-slate-50/50 p-4">
                      <div className="min-w-0 pr-4">
                        <p className="truncate text-sm font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.qty} × {fmt(item.price)} ₽/{item.unit}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900 whitespace-nowrap">{fmt(item.qty * item.price)} ₽</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {checkoutStep === 2 && (<>
                    <div className="space-y-2">
                      <label className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ваше имя</label>
                    <Input 
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Иван Иванов" 
                      className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 font-bold focus-visible:border-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Контактный телефон</label>
                    <Input 
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+7 (999) 000-00-00" 
                      type="tel"
                      className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 font-bold focus-visible:border-slate-900"
                    />
                  </div>
                  </>)}

                  {formError && <p className="px-2 text-xs font-bold text-red-500">{formError}</p>}

                  {checkoutStep === 3 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setForm({ ...form, deliveryType: "delivery" })} className={cn("flex flex-col items-center gap-2 rounded-2xl border-2 p-6", form.deliveryType === "delivery" ? "border-slate-900 bg-slate-50" : "border-slate-100")}>
                          <Truck className="h-6 w-6" /><span className="text-sm font-bold">Доставка</span>
                        </button>
                        <button onClick={() => setForm({ ...form, deliveryType: "pickup" })} className={cn("flex flex-col items-center gap-2 rounded-2xl border-2 p-6", form.deliveryType === "pickup" ? "border-slate-900 bg-slate-50" : "border-slate-100")}>
                          <Package className="h-6 w-6" /><span className="text-sm font-bold">Самовывоз</span>
                        </button>
                      </div>
                      {form.deliveryType === "delivery" && (
                        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Адрес доставки" className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 font-bold" />
                      )}
                      <Input value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="Комментарий к заказу (необязательно)" className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 font-bold" />
                    </div>
                  )}

                  {checkoutStep === 4 && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                        <p className="text-sm font-bold text-slate-900">{form.name}</p>
                        <p className="text-xs text-slate-500">{form.phone}</p>
                        <p className="mt-2 text-xs text-slate-500">{form.deliveryType === "delivery" ? (form.address || "Адрес уточним") : "Самовывоз"}</p>
                      </div>
                      <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-bold text-slate-500">ИТОГО:</span>
                        <span className="text-3xl font-black text-slate-900">{fmt(cartSum)} ₽</span>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="pt-4 space-y-3">
                    <div className="flex gap-3">
                      {checkoutStep > 1 && (
                        <Button onClick={prevStep} variant="outline" className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest">
                          <ArrowLeft className="mr-2 h-4 w-4" /> НАЗАД
                        </Button>
                      )}
                      {checkoutStep < 4 ? (
                        <Button onClick={nextStep} className="h-14 flex-1 rounded-2xl bg-slate-900 font-black uppercase tracking-widest">
                          ДАЛЕЕ <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button onClick={submitOrder} disabled={sending} className="h-14 flex-1 rounded-2xl bg-slate-900 font-black uppercase tracking-widest">
                          {sending ? "ОТПРАВКА..." : "ПОДТВЕРДИТЬ ЗАКАЗ"}
                        </Button>
                      )}
                    </div>
                    <Button onClick={sendWhatsApp} variant="outline" className="h-12 w-full rounded-2xl border-green-200 text-green-700 font-black uppercase tracking-widest hover:bg-green-50">
                      <MessageCircle className="mr-2 h-4 w-4" /> ЗАКАЗАТЬ В WHATSAPP
                    </Button>
                    <p className="text-center text-[10px] font-medium text-slate-400 px-8">
                      Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
