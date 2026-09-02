"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Check, Phone, FileText, Zap, Truck, Shield, Package } from "lucide-react";
import type { AtlasProduct } from "@/lib/atlas/catalog";
import type { AtlasPageProduct, Section } from "@/lib/atlas/config-schema";
import type { AtlasPrice } from "@/lib/atlas/pricing";
import { formatRub } from "@/lib/atlas/pricing";
import { useCartStore } from "../checkout/cart-store";
import { AtlasBreadcrumbs } from "./AtlasBreadcrumbs";
import { ProductCard } from "./ProductCard";
import { AtlasRenderer } from "../renderer/AtlasRenderer";
import type { ResolvedSectionData } from "@/lib/atlas/resolver";
import { sanitizeDescription } from "@/lib/atlas/sanitize";

interface SimilarItem { product: AtlasProduct; price: AtlasPrice; }

export function AtlasProductPage({
  product,
  price,
  similar,
  config,
  sections,
  resolved,
  jsonLd,
}: {
  product: AtlasProduct;
  price: AtlasPrice;
  similar: SimilarItem[];
  config: AtlasPageProduct;
  sections: Section[];
  resolved: ResolvedSectionData;
  jsonLd: string;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [oneClickOpen, setOneClickOpen] = useState(false);
  const addToCart = useCartStore((s) => s.add);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const href = `/product/${encodeURIComponent(product.slug)}`;
  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/shop" },
    ...(product.categorySlug ? [{ label: product.categoryName, href: `/shop/${encodeURIComponent(product.categorySlug)}` }] : []),
    { label: product.name },
  ];

  return (
    <div>
      <AtlasBreadcrumbs items={breadcrumbs} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Photo gallery */}
        <div>
          <div className="atlas-photo-canvas aspect-square rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageLocal || product.imageUrl || "/products/placeholders/default.svg"}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
          {product.imagePlaceholder && (
            <div className="mt-2 atlas-badge atlas-badge-neutral">
              Фото типовое. Реальный товар может отличаться.
            </div>
          )}
        </div>

        {/* Buy box */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ fontFamily: "var(--atlas-font-heading)" }}>
            {product.name}
          </h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.inStock ? (
              <span className="atlas-badge atlas-badge-success">В наличии</span>
            ) : (
              <span className="atlas-badge atlas-badge-warning">Под заказ 1–3 дня</span>
            )}
            {product.gost && <span className="atlas-badge atlas-badge-neutral">{product.gost}</span>}
          </div>

          {/* Price */}
          <div className="p-4 rounded-lg mb-4" style={{ background: "var(--atlas-surface-2)" }}>
            {price.perUnit != null ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatRub(price.perUnit)}
                  </span>
                  <span className="text-lg">₽{price.unitLabel.replace("₽/", "/")}</span>
                </div>
                {config.buyBox.showPerTon && price.perTonLabel && (
                  <div className="text-sm mt-1" style={{ color: "var(--atlas-text-muted)" }}>{price.perTonLabel}</div>
                )}
                {config.buyBox.showZonePrice && (
                  <div className="text-xs mt-1" style={{ color: "var(--atlas-text-muted)" }}>Цена актуальна для вашего города</div>
                )}
              </>
            ) : (
              <div>
                <div className="text-lg font-medium" style={{ color: "var(--atlas-text-muted)" }}>Цена по запросу</div>
                <div className="text-sm mt-1">Позвоните или оставьте заявку для уточнения цены</div>
              </div>
            )}
          </div>

          {/* Qty + Add to cart */}
          {price.perUnit != null && (
            <div className="flex gap-3 mb-4">
              <div className="flex items-center shrink-0" style={{ border: "1px solid var(--atlas-border)", borderRadius: "var(--atlas-radius-md)" }}>
                <button className="w-11 h-11 flex items-center justify-center hover:bg-[var(--atlas-surface-2)]" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Minus size={18} />
                </button>
                <span className="w-14 text-center font-medium">{qty}</span>
                <button className="w-11 h-11 flex items-center justify-center hover:bg-[var(--atlas-surface-2)]" onClick={() => setQty((q) => q + 1)}>
                  <Plus size={18} />
                </button>
              </div>
              <button className={`atlas-btn flex-1 ${added ? "atlas-btn-success" : "atlas-btn-primary"} atlas-btn-lg`} onClick={handleAdd}>
                {added ? (<><Check size={20} /> В корзине</>) : (<><ShoppingCart size={20} /> В корзину</>)}
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {config.buyBox.showOneClick && price.perUnit != null && (
              <button className="atlas-btn atlas-btn-outline atlas-btn-sm" onClick={() => setOneClickOpen(true)}>
                <Zap size={16} /> Купить в 1 клик
              </button>
            )}
            {config.buyBox.showRequestQuote && (
              <a href="/contacts" className="atlas-btn atlas-btn-secondary atlas-btn-sm">
                <FileText size={16} /> Запросить КП
              </a>
            )}
          </div>

          {/* Quick info */}
          <div className="atlas-card p-4 space-y-2 text-sm">
            {config.buyBox.showDelivery && (
              <div className="flex items-center gap-2">
                <Truck size={18} style={{ color: "var(--atlas-primary)" }} />
                <span>Доставка по Москве и МО в день заказа</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Shield size={18} style={{ color: "var(--atlas-primary)" }} />
              <span>Сертификат качества при необходимости</span>
            </div>
            <div className="flex items-center gap-2">
              <Package size={18} style={{ color: "var(--atlas-primary)" }} />
              <span>Отгрузка от 1 единицы</span>
            </div>
          </div>

          {/* Short specs */}
          <div className="mt-4 text-sm">
            <table className="w-full">
              <tbody>
                {product.attributes.slice(0, 5).map((a, i) => (
                  <tr key={i}>
                    <td className="py-1 pr-4" style={{ color: "var(--atlas-text-muted)" }}>{a.key}</td>
                    <td className="py-1 font-medium">{a.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Config-driven sections (ProductDescription, ProductSpecs, ProductCalculator, ProductDelivery) */}
      {sections.length > 0 && (
        <div className="mt-8 space-y-8">
          <AtlasRenderer sections={sections} resolved={resolved} />
        </div>
      )}

      {/* Fallback description if no sections */}
      {sections.length === 0 && product.description && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--atlas-font-heading)" }}>Описание</h2>
          <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeDescription(product.description) }} />
        </div>
      )}

      {/* Similar products */}
      {similar.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--atlas-font-heading)" }}>Похожие товары</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {similar.map(({ product: p, price: pr }) => (
              <ProductCard key={p.id} product={p} price={pr} />
            ))}
          </div>
        </div>
      )}

      {/* One-click modal */}
      {oneClickOpen && (
        <OneClickModal
          product={product}
          qty={qty}
          price={price}
          onClose={() => setOneClickOpen(false)}
        />
      )}
    </div>
  );
}

function OneClickModal({ product, qty, price, onClose }: { product: AtlasProduct; qty: number; price: AtlasPrice; onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!phone.trim()) return;
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Заказ в 1 клик",
          phone,
          source: "one_click",
          message: `${product.name} × ${qty} — ${formatRub((price.perUnit ?? 0) * qty)} ₽`,
        }),
      });
    } catch {}
    setSent(true);
    setTimeout(onClose, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-xl p-6" style={{ background: "var(--atlas-surface)" }} onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-8">
            <Check size={48} style={{ color: "var(--atlas-success)", margin: "0 auto" }} />
            <p className="text-lg font-bold mt-4">Заявка принята!</p>
            <p className="text-sm mt-1" style={{ color: "var(--atlas-text-muted)" }}>Менеджер свяжется в течение 15 минут</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-2">Купить в 1 клик</h3>
            <p className="text-sm mb-4" style={{ color: "var(--atlas-text-muted)" }}>
              {product.name} × {qty} = <b>{formatRub((price.perUnit ?? 0) * qty)} ₽</b>
            </p>
            <div className="space-y-3">
              <input className="atlas-input" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="atlas-input" placeholder="+7 (___) ___-__-__" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
              <button className="atlas-btn atlas-btn-primary w-full" onClick={submit} disabled={!phone.trim()}>
                <Phone size={18} /> Отправить заявку
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
