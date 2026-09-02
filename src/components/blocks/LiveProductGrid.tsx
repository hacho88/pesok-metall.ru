"use client";

import { useMemo, useState, useEffect } from "react";
import { genZone } from "@/lib/geo-declensions";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, List } from "lucide-react";
import {
  DEMO_PRODUCTS,
  type ProductCardData,
} from "@/components/blocks/ProductGridCards";
import { ConceptProductGrid } from "@/components/concepts/ConceptProductGrid";
import { B2BProductTable } from "@/components/catalog/B2BProductTable";
import type { ThemeConcept } from "@/lib/theme-concepts";
import type { LiveProductGridBlock, GeoZoneInfo } from "@/types/page-builder";

interface LiveProductGridProps extends LiveProductGridBlock {
  geoZone?: GeoZoneInfo | null;
  concept?: ThemeConcept;
  initialProducts?: ProductCardData[];
}

export function LiveProductGrid({
  title,
  categorySlugs,
  limit = 8,
  geoZone,
  concept = "hyper",
  initialProducts = [],
}: LiveProductGridProps) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [products, setProducts] = useState<ProductCardData[]>(initialProducts);

  useEffect(() => {
    if (initialProducts.length === 0) {
      // If we don't have initial products (e.g. CSR), we might want to fetch them.
      // But for this project we'll assume they are passed from server component wrapper.
      setProducts(DEMO_PRODUCTS.slice(0, limit));
    }
  }, [initialProducts, limit]);

  return (
    <section id="catalog" className="block-section py-12">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-jakarta text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
          {geoZone && (
            <p className="mt-2 text-muted-foreground">
              Актуальные цены для <span className="font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4">{genZone(geoZone.name)}</span>
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1 rounded-full border bg-muted/20 p-1 shadow-inner">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all ${
              view === "grid"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Сетка
          </button>
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all ${
              view === "table"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-4 w-4" />
            Таблица
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="animate-fade-up">
          <ConceptProductGrid concept={concept} products={products} />
        </div>
      ) : (
        <div className="animate-fade-up">
          <B2BProductTable products={products} />
        </div>
      )}
    </section>
  );
}

