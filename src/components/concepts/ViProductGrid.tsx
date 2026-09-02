"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ShoppingCart, Star, Zap } from "lucide-react";
import type { ProductCardData } from "@/components/blocks/ProductGridCards";
import { formatRubles } from "@/lib/calculator";
import { productImageSrc } from "@/lib/product-image";
import { cn } from "@/lib/utils";

/**
 * Концепция «ВИ» — клон vseinstrumenti.ru:
 * плотная сетка карточек с фото, рейтингом, ценой, красной скидкой,
 * кнопками «В корзину» и «Быстрый заказ».
 */
export function ViProductGrid({ products }: { products: ProductCardData[] }) {
  const [added, setAdded] = useState<Record<string, boolean>>({});

  function addToCart(id: string) {
    setAdded((a) => ({ ...a, [id]: true }));
    setTimeout(() => setAdded((a) => ({ ...a, [id]: false })), 1200);
  }

  if (products.length === 0) return null;

  return (
    <div className="vi-grid font-jakarta grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p, i) => {
        const oldPrice = p.price != null ? Math.round(p.price * 1.07) : null;
        const discount = oldPrice != null && p.price != null
          ? Math.round(((oldPrice - p.price) / oldPrice) * 100)
          : null;
        const priceTon = p.price && p.weightKg && p.weightKg > 0 ? (p.price / p.weightKg) * 1000 : null;
        
        return (
          <article key={p.id} className="group relative flex flex-col rounded-2xl border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">
            <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-muted/20 transition-transform duration-300 group-hover:scale-[1.02]">
              {productImageSrc(p.imageLocal, p.imageUrl) ? (
                <Image
                  src={productImageSrc(p.imageLocal, p.imageUrl)!}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-contain p-4"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-black text-primary/10">
                  {p.categoryName.slice(0, 1)}
                </div>
              )}
              {discount != null && discount > 0 && (
                <span className="absolute left-2 top-2 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black text-white shadow-lg shadow-red-200">
                  -{discount}%
                </span>
              )}
            </div>
            
            <div className="flex flex-1 flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "h-3 w-3",
                        s <= 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
                      )}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">отзывы</span>
              </div>
              
              <h3 className="line-clamp-2 min-h-[2.5rem] font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                {p.name}
              </h3>
              
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{p.categoryName}</p>
              
              <div className="mt-4 space-y-1">
                {p.isOnOrder || p.price == null ? (
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Под заказ</span>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground">{formatRubles(p.price)}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{p.unit.replace("за ", "")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {oldPrice != null && (
                        <span className="text-sm text-muted-foreground line-through decoration-red-500/50">{formatRubles(oldPrice)}</span>
                      )}
                      {priceTon && (
                        <span className="text-[10px] font-black text-primary uppercase">{formatRubles(priceTon)}/т</span>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-6 flex items-center gap-2">
                <button
                  type="button"
                  className={cn(
                    "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-95",
                    added[p.id] 
                      ? "bg-green-500 text-white shadow-lg shadow-green-100" 
                      : "bg-red-600 text-white shadow-xl shadow-red-200 hover:bg-red-700 hover:scale-105"
                  )}
                  onClick={() => addToCart(p.id)}
                  disabled={p.isOnOrder || p.price == null}
                >
                  {added[p.id] ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                  {added[p.id] ? "В корзине" : "Купить"}
                </button>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border text-muted-foreground hover:border-primary hover:text-primary transition-all active:scale-95"
                  onClick={() => addToCart(p.id)}
                  disabled={p.isOnOrder || p.price == null}
                  aria-label="Быстрый заказ"
                >
                  <Zap className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                <span>Код: {p.id.slice(0, 8).toUpperCase()}</span>
                <span className="flex items-center gap-1 text-green-600/60">
                  <div className="h-1 w-1 rounded-full bg-green-500" />
                  В наличии
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
