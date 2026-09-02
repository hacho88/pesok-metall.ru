"use client";

import { useState } from "react";
import type { SectionComponentProps } from "./index";
import type { AtlasProduct } from "@/lib/atlas/catalog";
import { formatRub } from "@/lib/atlas/pricing";

export function ProductCalculator({ data }: SectionComponentProps) {
  const resolved = data as { product: AtlasProduct | null } | null;
  const product = resolved?.product;
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState<"unit" | "ton">("unit");

  if (!product || !product.price) return null;

  const isMetal = product.type === "METALL" && product.weightKg > 0 && (product.unit === "м" || product.unit === "п.м");
  const pricePerUnit = product.price;
  const pricePerTon = isMetal ? (product.price / product.weightKg) * 1000 : product.unit === "т" ? product.price : null;

  const displayPrice = unit === "ton" && pricePerTon ? pricePerTon : pricePerUnit;
  const displayUnit = unit === "ton" ? "т" : product.unit ?? "шт";
  const total = displayPrice * qty;

  return (
    <div className="atlas-card atlas-card-elevated p-5">
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--atlas-font-heading)" }}>Калькулятор</h2>
      {isMetal && pricePerTon && (
        <div className="flex gap-2 mb-4">
          <button className={`atlas-btn atlas-btn-sm ${unit === "unit" ? "atlas-btn-primary" : "atlas-btn-secondary"}`} onClick={() => setUnit("unit")}>
            За {product.unit}
          </button>
          <button className={`atlas-btn atlas-btn-sm ${unit === "ton" ? "atlas-btn-primary" : "atlas-btn-secondary"}`} onClick={() => setUnit("ton")}>
            За тонну
          </button>
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium">Количество:</label>
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="atlas-input max-w-[120px]"
          min={1}
        />
        <span className="text-sm" style={{ color: "var(--atlas-text-muted)" }}>{displayUnit}</span>
      </div>
      <div className="p-4 rounded-lg" style={{ background: "var(--atlas-surface-2)" }}>
        <div className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>Итого:</div>
        <div className="text-2xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatRub(total)} ₽
        </div>
        {isMetal && unit === "unit" && (
          <div className="text-xs mt-1" style={{ color: "var(--atlas-text-muted)" }}>
            Вес: {(qty * product.weightKg).toFixed(2)} кг ({((qty * product.weightKg) / 1000).toFixed(3)} т)
          </div>
        )}
      </div>
    </div>
  );
}
