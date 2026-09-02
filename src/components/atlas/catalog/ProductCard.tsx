"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import type { AtlasProduct } from "@/lib/atlas/catalog";
import { formatRub, type AtlasPrice } from "@/lib/atlas/pricing";
import { useCartStore } from "../checkout/cart-store";

export function ProductCard({ product, price }: { product: AtlasProduct; price: AtlasPrice }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((s) => s.add);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const href = `/product/${encodeURIComponent(product.slug)}`;

  return (
    <div className="atlas-card atlas-card-elevated p-3 flex flex-col">
      {/* Photo */}
      <Link href={href} className="block atlas-photo-canvas aspect-square mb-3 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageLocal || product.imageUrl || "/products/placeholders/default.svg"}
          alt={product.name}
          className="w-full h-full object-contain"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.inStock ? (
            <span className="atlas-badge atlas-badge-success">В наличии</span>
          ) : (
            <span className="atlas-badge atlas-badge-warning">Под заказ 1–3 дня</span>
          )}
          {product.imagePlaceholder && (
            <span className="atlas-badge atlas-badge-neutral">Фото типовое</span>
          )}
        </div>
      </Link>

      {/* Name */}
      <Link href={href} className="text-sm font-semibold line-clamp-2 mb-1 hover:text-[var(--atlas-primary)]">
        {product.name}
      </Link>

      {/* Attributes */}
      <div className="text-xs mb-2 line-clamp-1" style={{ color: "var(--atlas-text-muted)" }}>
        {product.attributes.slice(0, 3).map((a) => a.value).join(" · ")}
      </div>

      {/* Price */}
      <div className="mt-auto">
        {price.perUnit != null ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatRub(price.perUnit)}
              </span>
              <span className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>₽{price.unitLabel.replace("₽/", "/")}</span>
            </div>
            {price.perTonLabel && (
              <div className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>{price.perTonLabel}</div>
            )}
          </>
        ) : (
          <>
            <div className="text-sm font-medium" style={{ color: "var(--atlas-text-muted)" }}>Цена по запросу</div>
            <Link href={href} className="text-xs font-medium" style={{ color: "var(--atlas-primary)" }}>Узнать цену →</Link>
          </>
        )}
      </div>

      {/* Add to cart */}
      {price.perUnit != null && (
        <div className="flex gap-2 mt-3">
          <div className="flex items-center shrink-0" style={{ border: "1px solid var(--atlas-border)", borderRadius: "var(--atlas-radius-sm)" }}>
            <button className="w-9 h-9 flex items-center justify-center hover:bg-[var(--atlas-surface-2)]" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-medium">{qty}</span>
            <button className="w-9 h-9 flex items-center justify-center hover:bg-[var(--atlas-surface-2)]" onClick={() => setQty((q) => q + 1)}>
              <Plus size={14} />
            </button>
          </div>
          <button
            className={`atlas-btn flex-1 ${added ? "atlas-btn-success" : "atlas-btn-primary"} atlas-btn-sm`}
            onClick={handleAdd}
          >
            {added ? (<><Check size={16} /> В корзине</>) : (<><ShoppingCart size={16} /> В корзину</>)}
          </button>
        </div>
      )}
    </div>
  );
}
