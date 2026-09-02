"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import type { AtlasProduct } from "@/lib/atlas/catalog";
import type { AtlasPrice } from "@/lib/atlas/pricing";
import { formatRub } from "@/lib/atlas/pricing";
import { useCartStore } from "../checkout/cart-store";

export function ProductTableRow({ product, price }: { product: AtlasProduct; price: AtlasPrice }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((s) => s.add);
  const href = `/product/${encodeURIComponent(product.slug)}`;

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <tr style={{ borderBottom: "1px solid var(--atlas-border)" }} className="hover:bg-[var(--atlas-surface-2)]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={href} className="w-14 h-14 shrink-0 atlas-photo-canvas">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageLocal || product.imageUrl || "/products/placeholders/default.svg"} alt={product.name} className="w-full h-full object-contain" loading="lazy" />
          </Link>
          <div className="min-w-0">
            <Link href={href} className="font-medium text-sm hover:text-[var(--atlas-primary)] line-clamp-2">{product.name}</Link>
            <div className="text-xs mt-0.5" style={{ color: "var(--atlas-text-muted)" }}>
              {product.inStock ? "В наличии" : "Под заказ 1–3 дня"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="text-xs space-y-0.5" style={{ color: "var(--atlas-text-muted)" }}>
          {product.attributes.slice(0, 4).map((a, i) => (
            <div key={i}><span style={{ color: "var(--atlas-text)" }}>{a.key}:</span> {a.value}</div>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        {price.perUnit != null ? (
          <>
            <div className="font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{formatRub(price.perUnit)} ₽</div>
            {price.perTonLabel && <div className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>{price.perTonLabel}</div>}
          </>
        ) : (
          <Link href={href} className="text-sm" style={{ color: "var(--atlas-primary)" }}>Цена по запросу</Link>
        )}
      </td>
      <td className="px-4 py-3">
        {price.perUnit != null && (
          <div className="flex items-center gap-2 justify-end">
            <div className="atlas-qty shrink-0">
              <button className="atlas-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus size={14} />
              </button>
              <span className="atlas-qty-val">{qty}</span>
              <button className="atlas-qty-btn" onClick={() => setQty((q) => q + 1)}>
                <Plus size={14} />
              </button>
            </div>
            <button className={`atlas-btn ${added ? "atlas-btn-success" : "atlas-btn-primary"} atlas-btn-sm`} onClick={handleAdd}>
              {added ? <Check size={16} /> : <ShoppingCart size={16} />}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
