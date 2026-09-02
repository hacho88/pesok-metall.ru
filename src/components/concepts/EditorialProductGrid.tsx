"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ProductCardData } from "@/components/blocks/ProductGridCards";
import { formatRubles } from "@/lib/calculator";
import { productImageSrc } from "@/lib/product-image";
import { AttributePills } from "./AttributePills";
import { cn } from "@/lib/utils";

/**
 * Концепция 3 «Editorial Studio / Industrial Vogue»:
 * lookbook-вертикальный поток, чередование позиций текста,
 * серифные заголовки, плавающие геометрические сетки атрибутов.
 */
export function EditorialProductGrid({
  products,
}: {
  products: ProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    <div className="editorial-stream font-jakarta space-y-24 lg:space-y-48">
      {products.map((p, i) => {
        const flip = i % 2 === 1;
        const priceTon = p.price && p.weightKg && p.weightKg > 0 ? (p.price / p.weightKg) * 1000 : null;
        
        return (
          <article
            key={p.id}
            className={cn(
              "group relative grid gap-12 lg:grid-cols-2 lg:items-center",
              flip ? "lg:direction-rtl" : ""
            )}
          >
            <div className={cn(
              "relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-muted/30 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]",
              flip ? "lg:order-2" : "lg:order-1"
            )}>
              {productImageSrc(p.imageLocal, p.imageUrl) ? (
                <Image
                  src={productImageSrc(p.imageLocal, p.imageUrl)!}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-12 transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-9xl font-black text-primary/10">
                  {p.categoryName.slice(0, 1)}
                </div>
              )}
              <div className="absolute bottom-8 right-8 text-8xl font-black text-foreground/5 select-none">
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
            
            <div className={cn(
              "flex flex-col",
              flip ? "lg:order-1 lg:text-right" : "lg:order-2"
            )}>
              <div className={cn(
                "mb-6 flex items-center gap-3",
                flip ? "lg:justify-end" : ""
              )}>
                <span className="h-px w-12 bg-primary" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">{p.categoryName}</span>
              </div>
              
              <h3 className="font-jakarta text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {p.name}
              </h3>
              
              <div className={cn(
                "mt-10",
                flip ? "lg:flex lg:justify-end" : ""
              )}>
                <AttributePills attributes={p.attributes} />
              </div>
              
              <div className={cn(
                "mt-12 space-y-6 border-t pt-10",
                flip ? "lg:items-end lg:text-right" : ""
              )}>
                <div className="flex flex-col gap-2">
                  {p.isOnOrder ? (
                    <span className="text-xl font-bold uppercase tracking-widest text-amber-600">Под заказ 1-3 дня</span>
                  ) : (
                    <>
                      <div className={cn(
                        "flex items-baseline gap-3",
                        flip ? "lg:justify-end" : ""
                      )}>
                        <span className="text-5xl font-black text-foreground">{formatRubles(p.price!)}</span>
                        <span className="text-sm font-black uppercase text-muted-foreground">{p.unit}</span>
                      </div>
                      {priceTon && (
                        <div className="text-lg font-bold text-primary">
                          {formatRubles(priceTon)} / тонна
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className={cn(
                  "flex items-center gap-6",
                  flip ? "lg:justify-end" : ""
                )}>
                  <button className="h-16 rounded-full bg-primary px-10 text-lg font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    В КОРЗИНУ
                  </button>
                  <a href="#catalog" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-colors hover:text-primary">
                    ДЕТАЛИ
                    <ArrowUpRight className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
