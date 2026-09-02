"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, Phone, ShoppingCart, X } from "lucide-react";
import type { ProductCardData } from "@/components/blocks/ProductGridCards";
import { formatRubles } from "@/lib/calculator";
import { productImageSrc } from "@/lib/product-image";
import { AttributePills } from "./AttributePills";
import { cn } from "@/lib/utils";
import { useCart, productCardToCartItem } from "@/components/checkout/CartContext";

/**
 * Концепция 4 «High-Conversion Hyper-Grid»:
 * липкий сайдбар фильтров, плотная таблица, row-селекторы атрибутов,
 * quick-buy модалка, липкая плавающая корзина.
 */
export function HyperProductGrid({
  products,
}: {
  products: ProductCardData[];
}) {
  const { addItem, setOpen } = useCart();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [quickBuy, setQuickBuy] = useState<ProductCardData | null>(null);
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.categoryName))),
    [products]
  );

  const filtered = useMemo(
    () =>
      categoryFilter === "all"
        ? products
        : products.filter((p) => p.categoryName === categoryFilter),
    [products, categoryFilter]
  );

  function addToCart(p: ProductCardData) {
    if (p.isOnOrder || p.price == null) return;
    addItem(productCardToCartItem(p));
    setAdded((a) => ({ ...a, [p.id]: true }));
    setTimeout(() => setAdded((a) => ({ ...a, [p.id]: false })), 1200);
  }

  return (
    <div className="hyper-wrap font-jakarta">
      <div className="hyper-layout grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Липкий сайдбар фильтров */}
        <aside className="hyper-filters sticky top-24 self-start space-y-8 rounded-2xl border bg-card p-6 shadow-sm">
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">Фильтры</h4>
            <div className="mt-6 space-y-2">
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all",
                  categoryFilter === "all" ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-muted"
                )}
                onClick={() => setCategoryFilter("all")}
              >
                Все категории
                {categoryFilter === "all" && <Check className="h-4 w-4" />}
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all",
                    categoryFilter === c ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-muted"
                  )}
                  onClick={() => setCategoryFilter(c)}
                >
                  {c}
                  {categoryFilter === c && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-6 border-t">
            <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 border border-green-100">
              <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Все товары в наличии</span>
            </div>
          </div>
        </aside>

        {/* Плотная таблица */}
        <div className="hyper-table-wrap overflow-hidden rounded-2xl border bg-card shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/30 uppercase tracking-widest text-muted-foreground font-bold text-[10px]">
                <th className="px-6 py-4">Товар</th>
                <th className="px-6 py-4">Параметры</th>
                <th className="px-6 py-4 text-right">Цена</th>
                <th className="px-6 py-4 text-center">Заказ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => {
                const priceTon = p.price && p.weightKg && p.weightKg > 0 ? (p.price / p.weightKg) * 1000 : null;
                return (
                  <tr key={p.id} className="transition-colors hover:bg-muted/20 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 overflow-hidden rounded-lg border bg-white shadow-sm transition-transform group-hover:scale-110">
                          {productImageSrc(p.imageLocal, p.imageUrl) ? (
                            <Image
                              src={productImageSrc(p.imageLocal, p.imageUrl)!}
                              alt={p.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/5 text-lg font-black text-primary">
                              {p.categoryName.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors">{p.name}</div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{p.categoryName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AttributePills attributes={p.attributes} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.isOnOrder ? (
                        <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Под заказ</div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <div className="text-lg font-black text-foreground">{formatRubles(p.price!)}</div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase">{p.unit}</div>
                          {priceTon && (
                            <div className="mt-1 text-xs font-bold text-primary">{formatRubles(priceTon)}/т</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className={cn(
                            "h-10 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2",
                            added[p.id] 
                              ? "bg-green-500 text-white shadow-lg shadow-green-200" 
                              : "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105"
                          )}
                          onClick={() => addToCart(p)}
                          disabled={p.isOnOrder || p.price == null}
                        >
                          {added[p.id] ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                          {added[p.id] ? "Готово" : "Купить"}
                        </button>
                        <button
                          type="button"
                          className="h-10 w-10 flex items-center justify-center rounded-xl border-2 border-border text-muted-foreground hover:border-primary hover:text-primary transition-all active:scale-95"
                          onClick={() => setQuickBuy(p)}
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick-buy модалка */}
      {quickBuy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setQuickBuy(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-3xl border bg-card p-8 shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black tracking-tight">{quickBuy.name}</h3>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
                onClick={() => setQuickBuy(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mb-8 rounded-2xl bg-muted/30 p-6">
               <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">{quickBuy.categoryName}</div>
               {quickBuy.isOnOrder ? (
                <div className="text-lg font-bold text-amber-600">Под заказ 1-3 дня</div>
               ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-foreground">{formatRubles(quickBuy.price!)}</span>
                  <span className="text-sm font-bold text-muted-foreground uppercase">{quickBuy.unit}</span>
                </div>
               )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Телефон для связи</label>
                <input 
                  type="tel" 
                  placeholder="+7 (___) ___-__-__" 
                  className="h-14 w-full rounded-xl border-2 bg-background px-4 text-lg font-bold transition-all focus:border-primary focus:outline-none"
                />
              </div>
              <button
                type="button"
                className="h-14 w-full rounded-full bg-primary text-lg font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => {
                  addToCart(quickBuy);
                  setQuickBuy(null);
                  setOpen(true);
                }}
                disabled={quickBuy.isOnOrder || quickBuy.price == null}
              >
                БЫСТРЫЙ ЗАКАЗ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
