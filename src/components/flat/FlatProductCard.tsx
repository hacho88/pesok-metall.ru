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

  const price = product.price;
  const oldPrice = price ? Math.round(price * 1.15) : null;
  const isNew = Math.random() > 0.5; // demo badge

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  };

  return (
    <Link href={`/product/${product.slug}`} className="flat-product flat-fade-in">
      <div className="flat-product__photo">
        {/* Badges */}
        <div className="flat-product__badges">
          {isNew && <span className="flat-badge flat-badge--new">New</span>}
          {oldPrice && price && (
            <span className="flat-badge flat-badge--sale">-{Math.round((1 - price / oldPrice) * 100)}%</span>
          )}
          {!product.inStock && <span className="flat-badge flat-badge--order">Под заказ</span>}
        </div>

        {/* Favorite */}
        <button
          className="flat-product__fav"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); favStore.toggle(product.id); }}
          style={{ background: isFav ? "rgba(253,95,0,0.1)" : "rgba(255,255,255,0.9)" }}
        >
          <Heart size={16} fill={isFav ? "#fd5f00" : "none"} color={isFav ? "#fd5f00" : "#798892"} />
        </button>

        {/* Image */}
        {product.imageLocal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageLocal} alt={product.name} />
        ) : product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div style={{ fontSize: 48, color: "#d6dee5" }}>📦</div>
        )}
      </div>

      <div className="flat-product__body">
        <div className="flat-product__cat">{product.categoryName}</div>
        <div className="flat-product__name">{product.name}</div>
        <div className="flat-product__price">
          {price ? `${formatRub(price)} ₽` : "По запросу"}
          {oldPrice && price && <span className="flat-product__price-old">{formatRub(oldPrice)} ₽</span>}
          {product.unit && price && <span className="flat-product__price-unit"> / {product.unit}</span>}
        </div>
      </div>
    </Link>
  );
}
