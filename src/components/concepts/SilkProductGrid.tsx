"use client";

import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ProductCardData } from "@/components/blocks/ProductGridCards";
import { formatRubles } from "@/lib/calculator";
import { productImageSrc } from "@/lib/product-image";
import { AttributePills } from "./AttributePills";

/**
 * Концепция 1 «Silk Luxury / Premium B2B»:
 * асимметричная masonry-сетка, glassmorphism hero-карточка,
 * текст-пилюли атрибутов, крупный CTA.
 */
export function SilkProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;
  const [hero, ...rest] = products;

  return (
    <div className="silk-grid">
      {/* Hero-карточка с glassmorphism */}
      <article className="silk-hero-card">
        <div className="silk-hero-card__media">
          {productImageSrc(hero.imageLocal, hero.imageUrl) ? (
            <Image
              src={productImageSrc(hero.imageLocal, hero.imageUrl)!}
              alt={hero.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <span className="silk-hero-card__letter">
              {hero.categoryName.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="silk-hero-card__body">
          <span className="silk-eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            {hero.categoryName}
          </span>
          <h3 className="silk-hero-card__title">{hero.name}</h3>
          <AttributePills attributes={hero.attributes} />
          <div className="silk-hero-card__footer border-t pt-6">
            <div className="flex flex-col gap-1">
              {hero.isOnOrder ? (
                <span className="silk-price silk-price--order text-amber-600">
                  Под заказ 1-3 дня
                </span>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="silk-price text-3xl font-black text-foreground">{formatRubles(hero.price!)}</span>
                    <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{hero.unit}</span>
                  </div>
                  {hero.weightKg && hero.weightKg > 0 && (
                    <div className="text-sm font-bold text-primary">
                      {formatRubles((hero.price! / hero.weightKg) * 1000)} / тонна
                    </div>
                  )}
                </>
              )}
            </div>
            <button className="h-14 rounded-full bg-primary px-10 text-lg font-bold text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              В корзину
            </button>
          </div>
        </div>
      </article>

      {/* Masonry-поток остальных товаров */}
      <div className="silk-masonry">
        {rest.map((p) => {
           const priceTon = p.price && p.weightKg && p.weightKg > 0 ? (p.price / p.weightKg) * 1000 : null;
           return (
          <article key={p.id} className="silk-card group">
            <div className="silk-card__media">
              {productImageSrc(p.imageLocal, p.imageUrl) ? (
                <Image
                  src={productImageSrc(p.imageLocal, p.imageUrl)!}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <span className="silk-card__letter">
                  {p.categoryName.slice(0, 1)}
                </span>
              )}
            </div>
            <div className="silk-card__body">
              <p className="silk-card__cat">{p.categoryName}</p>
              <h4 className="silk-card__title group-hover:text-primary transition-colors">{p.name}</h4>
              <AttributePills attributes={p.attributes} />
              <div className="silk-card__footer flex flex-col gap-2 border-t pt-4">
                <div className="flex items-baseline justify-between w-full">
                  {p.isOnOrder ? (
                    <span className="silk-price silk-price--order text-amber-600">
                      Под заказ
                    </span>
                  ) : (
                    <span className="silk-price text-xl font-bold">{formatRubles(p.price!)}</span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{p.unit}</span>
                </div>
                {priceTon && (
                  <div className="text-xs font-bold text-primary">
                    {formatRubles(priceTon)} / тонна
                  </div>
                )}
                <button className="mt-2 h-10 w-full rounded-full bg-foreground text-xs font-bold text-background transition-all hover:bg-primary hover:text-white">
                  В корзину
                </button>
              </div>
            </div>
          </article>
        )})}
      </div>
    </div>
  );
}
