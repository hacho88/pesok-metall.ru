"use client";

import { useState } from "react";
import { LayoutGrid, Table2 } from "lucide-react";
import { MetalProductCard, type MetalProductData } from "./MetalProductCard";
import { MetalProductTable } from "./MetalProductTable";

// Переключатель «Сетка / Таблица» для каталога
export function CatalogView({ products }: { products: MetalProductData[] }) {
  const [view, setView] = useState<"grid" | "table">("grid");

  const buttonClass = (active: boolean) =>
    `flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border text-muted-foreground hover:bg-muted"
    }`;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} товаров</p>
        <div className="flex gap-2">
          <button type="button" className={buttonClass(view === "grid")} onClick={() => setView("grid")}>
            <LayoutGrid className="h-3.5 w-3.5" />
            Сетка
          </button>
          <button type="button" className={buttonClass(view === "table")} onClick={() => setView("table")}>
            <Table2 className="h-3.5 w-3.5" />
            Таблица
          </button>
        </div>
      </div>
      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <MetalProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <MetalProductTable products={products} />
      )}
    </div>
  );
}
