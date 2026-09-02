"use client";

import type { SectionComponentProps } from "./index";
import type { AtlasProduct } from "@/lib/atlas/catalog";
import { ProductCard } from "../catalog/ProductCard";
import { resolvePrice } from "@/lib/atlas/pricing";

export function SimilarProducts({ data }: SectionComponentProps) {
  const resolved = data as { products: AtlasProduct[] } | null;
  const products = resolved?.products ?? [];

  if (products.length === 0) return null;

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
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--atlas-font-heading)" }}>Похожие товары</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} price={toPrice(p)} />
        ))}
      </div>
    </div>
  );
}
