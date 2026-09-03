"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Check, Heart, Eye } from "lucide-react";
import { useState } from "react";
import type { AtlasProduct } from "@/lib/atlas/catalog";
import { formatRub, type AtlasPrice } from "@/lib/atlas/pricing";
import { useCartStore } from "../checkout/cart-store";
import { useFavoritesStore } from "../checkout/favorites-store";

export function ProductCard({ product, price }: { product: AtlasProduct; price: AtlasPrice }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((s) => s.add);
  const favStore = useFavoritesStore();
  const isFav = favStore.has(product.id);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const href = `/product/${encodeURIComponent(product.slug)}`;
  const hasPrice = price.perUnit != null;

  return (
    <div className="atlas-card atlas-card-elevated p-3 flex flex-col group atlas-fade-in">
      {/* Photo */}
      <Link href={href} className="block atlas-photo-canvas aspect-square mb-3 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageLocal || product.imageUrl || "/products/placeholders/default.svg"}
          alt={product.name}
          className="w-full h-full object-contain atlas-product-img"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.inStock ? (
            <span className="atlas-badge atlas-badge-success">В наличии</span>
          ) : (
            <span className="atlas-badge atlas-badge-warning">Под заказ</span>
          )}
          {product.imagePlaceholder && (
            <span className="atlas-badge atlas-badge-neutral" style={{ fontSize: 10 }}>Фото типовое</span>
          )}
        </div>
        {/* Favorite button */}
        <button
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all atlas-quick-add ${isFav ? "opacity-100" : ""}`}
          style={{
            background: isFav ? "color-mix(in srgb, #EF4444 10%, white)" : "rgba(255,255,255,0.9)",
            border: "1px solid var(--atlas-border)",
          }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); favStore.toggle(product.id); }}
          title={isFav ? "Убрать из избранного" : "В избранное"}
        >
          <Heart size={16} fill={isFav ? "#EF4444" : "none"} color={isFav ? "#EF4444" : "var(--atlas-text-muted)"} />
        </button>
        {/* Quick add button (reveal on hover) */}
        {hasPrice && (
          <button
            className="atlas-quick-add absolute bottom-2 right-2 w-10 h-10 rounded-full atlas-btn-primary flex items-center justify-center shadow-lg z-10"
            onClick={quickAdd}
            title="Быстро в корзину"
          >
            {added ? <Check size={18} /> : <ShoppingCart size={18} />}
          </button>
        )}
      </Link>

      {/* Name */}
      <Link href={href} className="text-sm font-semibold line-clamp-2 mb-1 hover:text-[var(--atlas-primary)] transition-colors leading-snug">
        {product.name}
      </Link>

      {/* Attributes */}
      <div className="text-xs mb-2 line-clamp-1" style={{ color: "var(--atlas-text-muted)" }}>
        {product.attributes.slice(0, 3).map((a) => a.value).join(" · ")}
      </div>

      {/* Price */}
      <div className="mt-auto">
        {hasPrice ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold atlas-price-main" style={{ color: "var(--atlas-text)" }}>
                {formatRub(price.perUnit!)}
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
            <Link href={href} className="text-xs font-medium atlas-link-hover" style={{ color: "var(--atlas-primary)" }}>Узнать цену →</Link>
          </>
        )}
      </div>

      {/* Add to cart row */}
      {hasPrice && (
        <div className="flex gap-2 mt-3">
          <div className="atlas-qty shrink-0">
            <button className="atlas-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              <Minus size={14} />
            </button>
            <span className="atlas-qty-val">{qty}</span>
            <button className="atlas-qty-btn" onClick={() => setQty((q) => q + 1)}>
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
