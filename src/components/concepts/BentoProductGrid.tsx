"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Flame, Zap } from "lucide-react";
import type { ProductCardData } from "@/components/blocks/ProductGridCards";
import { formatRubles } from "@/lib/calculator";
import { productImageSrc } from "@/lib/product-image";
import { AttributePills } from "./AttributePills";
import { cn } from "@/lib/utils";

/**
 * Концепция 2 «Cyber Bento Tech»:
 * плотная bento-мозаика из скруглённых плиток (20-24px),
 * неоновое свечение, анимированные селекты, тикер-маркиза.
 */
export function BentoProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;

  return (
    <div className="bento-wrap font-jakarta">
      {/* Тикер горячих предложений */}
      <div className="mb-10 bento-ticker overflow-hidden border-y border-primary/20 bg-primary/5 py-4" aria-hidden>
        <div className="bento-ticker__track flex gap-12 whitespace-nowrap">
          {[0, 1, 2].map((i) => (
            <span key={i} className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">
              {products
                .slice(0, 6)
                .map((p) => `${p.name} — ${p.isOnOrder ? "ПОД ЗАКАЗ" : formatRubles(p.price!)}`)
                .join("  ✦  ")}
            </span>
          ))}
        </div>
      </div>

      <div className="bento-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        {products.map((p, i) => {
          const priceTon = p.price && p.weightKg && p.weightKg > 0 ? (p.price / p.weightKg) * 1000 : null;
          return (
            <article
              key={p.id}
              className={cn(
                "group relative overflow-hidden rounded-[2rem] border-2 border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10",
                i === 0 && "sm:col-span-2 lg:col-span-2 lg:row-span-2",
                i === 1 && "lg:col-span-1 lg:row-span-2"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="relative z-10 flex h-full flex-col">
                <div className={cn(
                  "relative mb-6 overflow-hidden rounded-2xl bg-muted/30 transition-transform duration-500 group-hover:scale-105",
                  i === 0 ? "aspect-[16/10]" : "aspect-square"
                )}>
                  {productImageSrc(p.imageLocal, p.imageUrl) ? (
                    <Image
                      src={productImageSrc(p.imageLocal, p.imageUrl)!}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain p-6"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-black text-primary/20">
                      {p.categoryName.slice(0, 1)}
                    </div>
                  )}
                  {!p.isOnOrder && (
                    <div className="absolute left-4 top-4">
                      <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/30">
                        <Flame className="h-3 w-3" />
                        HOT
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-1 flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{p.categoryName}</span>
                  <h4 className={cn(
                    "mt-2 font-black tracking-tight text-foreground transition-colors group-hover:text-primary",
                    i === 0 ? "text-3xl" : "text-xl"
                  )}>
                    {p.name}
                  </h4>
                  
                  <div className="mt-4">
                    <AttributePills attributes={p.attributes} />
                  </div>
                  
                  <div className="mt-auto pt-6">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        {p.isOnOrder ? (
                          <span className="text-sm font-bold uppercase tracking-widest text-amber-600">Под заказ</span>
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-foreground">{formatRubles(p.price!)}</span>
                              <span className="text-[10px] font-black uppercase text-muted-foreground">{p.unit}</span>
                            </div>
                            {priceTon && (
                              <div className="text-xs font-bold text-primary">{formatRubles(priceTon)}/т</div>
                            )}
                          </div>
                        )}
                      </div>
                      <button 
                        type="button" 
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg transition-all hover:bg-primary hover:text-white hover:scale-110 active:scale-90"
                        aria-label="В корзину"
                      >
                        <Zap className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
