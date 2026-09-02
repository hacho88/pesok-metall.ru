"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SectionComponentProps } from "./index";
import type { AtlasProduct } from "@/lib/atlas/catalog";
import { ProductCard } from "../catalog/ProductCard";
import { resolvePrice } from "@/lib/atlas/pricing";
import type { Prisma } from "@prisma/client";

type ProductRow = Prisma.ProductGetPayload<{ include: { category: true; attributes: true; geoData: { where: { geoZoneId: string } } } }>;

export function FeaturedProducts({ props, data }: SectionComponentProps) {
  const resolved = data as { products: AtlasProduct[] } | null;
  const products = resolved?.products ?? [];
  const title = (props.title as string) ?? "";
  const variant = (props.variant as string) ?? "grid";
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  // Convert AtlasProduct to a format resolvePrice can use
  const toPrice = (p: AtlasProduct) => resolvePrice({
    priceRetailBase: p.price,
    isOnOrder: p.isOnOrder,
    unit: p.unit,
    weightKg: p.weightKg as any,
    type: p.type,
    geoData: [],
  } as any, null);

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--atlas-font-heading)" }}>{title}</h2>
          {variant === "carousel" && (
            <div className="flex gap-2">
              <button onClick={() => scroll("left")} className="w-9 h-9 rounded-lg flex items-center justify-center atlas-card">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scroll("right")} className="w-9 h-9 rounded-lg flex items-center justify-center atlas-card">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {variant === "carousel" ? (
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto atlas-scroll pb-2" style={{ scrollSnapType: "x mandatory" }}>
          {products.map((p) => (
            <div key={p.id} className="shrink-0 w-[240px]" style={{ scrollSnapAlign: "start" }}>
              <ProductCard product={p} price={toPrice(p)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} price={toPrice(p)} />
          ))}
        </div>
      )}
    </div>
  );
}
