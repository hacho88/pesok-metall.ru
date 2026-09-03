"use client";

import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { useState } from "react";
import type { StorefrontProduct } from "@/lib/theme-storefront";
import { formatRub } from "@/lib/atlas/pricing";
import { useCartStore } from "@/components/atlas/checkout/cart-store";
import { useFavoritesStore } from "@/components/atlas/checkout/favorites-store";

export function FlatProductCard({ product }: { product: StorefrontProduct }) {
  const addToCart = useCartStore((s) => s.add);
  const favStore = useFavoritesStore();
  const isFav = favStore.has(product.id);
  const [added, setAdded] = useState(false);

  const slug = product.slug;
  const price = product.price;
  const oldPrice = price ? Math.round(price * 1.15) : null;

  return (
    <div className="flat-product flat-fade-in">
      <Link href={`/product/${slug}`} className="flat-product__photo" style={{ position: "relative" }}>
        {product.imageLocal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageLocal} alt={product.name} />
        ) : product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div style={{ fontSize: 40, color: "#d6dee5" }}>📦</div>
        )}

        {/* Badges */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {product.inStock ? (
            <span className="flat-badge flat-badge-success">В наличии</span>
          ) : (
            <span className="flat-badge flat-badge-warning">Под заказ</span>
          )}
          {oldPrice && price && (
            <span className="flat-badge flat-badge-danger">-{Math.round((1 - price / oldPrice) * 100)}%</span>
          )}
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => { e.preventDefault(); favStore.toggle(product.id); }}
          style={{
            position: "absolute", top: 10, right: 10,
            width: 32, height: 32, borderRadius: "50%",
            border: "1px solid var(--flat-border)",
            background: isFav ? "rgba(253,95,0,0.1)" : "#fff",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s ease",
          }}
        >
          <Heart size={16} fill={isFav ? "#fd5f00" : "none"} color={isFav ? "#fd5f00" : "#a3aeb7"} />
        </button>
      </Link>

      <div className="flat-product__body">
        <div className="flat-product__category">{product.categoryName}</div>
        <Link href={`/product/${slug}`}>
          <div className="flat-product__name">{product.name}</div>
        </Link>
        <div className="flat-product__price">
          {price ? `${formatRub(price)} ₽` : "Цена по запросу"}
          {oldPrice && price && <span className="flat-product__price-old">{formatRub(oldPrice)} ₽</span>}
          {product.unit && price && <span style={{ fontSize: 13, color: "#a3aeb7", fontWeight: 400, marginLeft: 4 }}>/{product.unit}</span>}
        </div>
      </div>

      <div className="flat-product__actions">
        <button
          className="flat-btn flat-btn-primary flat-btn-block flat-btn-sm"
          onClick={() => {
            addToCart({
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: price ?? 0,
              imageLocal: product.imageLocal,
              imagePlaceholder: !product.imageLocal && !product.imageUrl,
              unit: product.unit,
              minQty: 1,
              step: 1,
              inStock: product.inStock,
            } as any, 1);
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
        >
          <ShoppingBag size={16} /> {added ? "Добавлено!" : "В корзину"}
        </button>
      </div>
    </div>
  );
}
