"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Heart, Truck, ShieldCheck, Check, Minus, Plus } from "lucide-react";
import "@/components/flat/flat.css";
import { FlatHeader, FlatFooter, FlatBreadcrumbs } from "../../components/flat/FlatChrome";
import { FlatProductCard } from "../../components/flat/FlatProductCard";
import { useCartStore } from "@/components/atlas/checkout/cart-store";
import { useFavoritesStore } from "@/components/atlas/checkout/favorites-store";
import { formatRub } from "@/lib/atlas/pricing";
import type { StorefrontProduct } from "@/lib/theme-storefront";

export function FlatProduct({ product, allProducts }: { product: StorefrontProduct; allProducts: StorefrontProduct[] }) {
  const addToCart = useCartStore((s) => s.add);
  const favStore = useFavoritesStore();
  const isFav = favStore.has(product.id);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "specs" | "delivery">("desc");

  const similar = allProducts.filter((p) => p.categoryName === product.categoryName && p.id !== product.id).slice(0, 4);
  const price = product.price;
  const oldPrice = price ? Math.round(price * 1.15) : null;

  return (
    <div className="flat-theme">
      <FlatHeader />
      <div className="flat-container">
        <FlatBreadcrumbs items={[
          { label: "Главная", href: "/" },
          { label: "Каталог", href: "/shop" },
          { label: product.categoryName, href: `/shop?cat=${encodeURIComponent(product.categoryName)}` },
          { label: product.name },
        ]} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 60, marginTop: 20 }}>
          {/* Photo */}
          <div style={{ background: "var(--flat-bg-light)", borderRadius: "var(--flat-radius-lg)", aspectRatio: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            {product.inStock && <span className="flat-badge flat-badge--stock" style={{ position: "absolute", top: 16, left: 16 }}><Check size={12} /> В наличии</span>}
            {product.imageLocal ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageLocal} alt={product.name} style={{ maxWidth: "85%", maxHeight: "85%", objectFit: "contain" }} />
            ) : product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} style={{ maxWidth: "85%", maxHeight: "85%", objectFit: "contain" }} />
            ) : (
              <div style={{ fontSize: 80, color: "#d6dee5" }}>📦</div>
            )}
          </div>

          {/* Info */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--flat-text-muted)", marginBottom: 8 }}>{product.categoryName}</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--flat-dark)", marginBottom: 16, lineHeight: 1.3 }}>{product.name}</h1>

            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: "var(--flat-primary)" }}>
                {price ? `${formatRub(price)} ₽` : "Цена по запросу"}
              </span>
              {oldPrice && price && (
                <span style={{ fontSize: 20, color: "var(--flat-gray-500)", textDecoration: "line-through", marginLeft: 16 }}>
                  {formatRub(oldPrice)} ₽
                </span>
              )}
              {product.unit && price && <span style={{ fontSize: 16, color: "var(--flat-text-muted)", marginLeft: 8 }}> / {product.unit}</span>}
            </div>

            {/* Qty + Add */}
            <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
              <div className="flat-qty">
                <button className="flat-qty__btn" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14} /></button>
                <input className="flat-qty__val" value={qty} readOnly />
                <button className="flat-qty__btn" onClick={() => setQty(qty + 1)}><Plus size={14} /></button>
              </div>
              <button
                className="flat-btn flat-btn-primary flat-btn-lg"
                onClick={() => addToCart({
                  productId: product.id, name: product.name, slug: product.slug,
                  price: price ?? 0, imageLocal: product.imageLocal,
                  imagePlaceholder: !product.imageLocal && !product.imageUrl,
                  unit: product.unit, minQty: 1, step: 1, inStock: product.inStock,
                } as any, qty)}>
                <ShoppingBag size={18} /> В корзину
              </button>
              <button
                className="flat-icon-btn"
                style={{ border: "2px solid var(--flat-border)", width: 52, height: 52 }}
                onClick={() => favStore.toggle(product.id)}>
                <Heart size={22} fill={isFav ? "#fd5f00" : "none"} color={isFav ? "#fd5f00" : "var(--flat-gray-700)"} />
              </button>
            </div>

            {/* Quick info */}
            <div style={{ display: "flex", gap: 32, padding: "20px 0", borderTop: "1px solid var(--flat-border)", borderBottom: "1px solid var(--flat-border)", marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <Truck size={20} style={{ color: "var(--flat-primary)" }} /> Доставка в день заказа
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <ShieldCheck size={20} style={{ color: "var(--flat-primary)" }} /> Гарантия ГОСТ
              </div>
            </div>

            {/* Tabs */}
            <div className="flat-tabs">
              {[
                { k: "desc", l: "Описание" },
                { k: "specs", l: "Характеристики" },
                { k: "delivery", l: "Доставка" },
              ].map((t) => (
                <button key={t.k} className={`flat-tab ${tab === t.k ? "flat-tab--active" : ""}`} onClick={() => setTab(t.k as any)}>{t.l}</button>
              ))}
            </div>

            <div style={{ fontSize: 14, color: "var(--flat-text-muted)", lineHeight: 1.7 }}>
              {tab === "desc" && <p>{product.name} — качественный строительный материал, соответствующий требованиям ГОСТ. Идеально подходит для строительных и ремонтных работ. Гарантированное качество от проверенных поставщиков.</p>}
              {tab === "specs" && (
                <table style={{ width: "100%", fontSize: 14 }}>
                  <tbody>
                    <tr><td style={{ padding: "10px 0", color: "var(--flat-text-muted)", width: 160 }}>Категория</td><td style={{ fontWeight: 600 }}>{product.categoryName}</td></tr>
                    <tr><td style={{ padding: "10px 0", color: "var(--flat-text-muted)" }}>Тип</td><td style={{ fontWeight: 600 }}>{product.type}</td></tr>
                    {product.gost && <tr><td style={{ padding: "10px 0", color: "var(--flat-text-muted)" }}>ГОСТ</td><td style={{ fontWeight: 600 }}>{product.gost}</td></tr>}
                    {product.unit && <tr><td style={{ padding: "10px 0", color: "var(--flat-text-muted)" }}>Ед. изм.</td><td style={{ fontWeight: 600 }}>{product.unit}</td></tr>}
                    {product.length && <tr><td style={{ padding: "10px 0", color: "var(--flat-text-muted)" }}>Длина</td><td style={{ fontWeight: 600 }}>{product.length}</td></tr>}
                    {product.weightLabel && <tr><td style={{ padding: "10px 0", color: "var(--flat-text-muted)" }}>Вес</td><td style={{ fontWeight: 600 }}>{product.weightLabel}</td></tr>}
                  </tbody>
                </table>
              )}
              {tab === "delivery" && <p>Доставка по Москве в день заказа при оформлении до 14:00. По Московской области — 1-3 дня. Возможен самовывоз со склада. Доставка рассчитывается менеджером индивидуально.</p>}
            </div>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="flat-section flat-section--gray" style={{ margin: "0 -20px", padding: "60px 20px" }}>
            <div className="flat-section__head">
              <div className="flat-section__label">Рекомендуем</div>
              <h2 className="flat-section__title">Похожие товары</h2>
            </div>
            <div className="flat-products">
              {similar.map((p) => <FlatProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
      <FlatFooter />
    </div>
  );
}
