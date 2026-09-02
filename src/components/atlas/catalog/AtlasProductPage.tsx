"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Check, Phone, FileText, Zap, Truck, Shield, Package, ChevronLeft, ChevronRight } from "lucide-react";
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

type TabKey = "description" | "specs" | "delivery" | "faq";

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
  const [activeTab, setActiveTab] = useState<TabKey>("description");
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

  const hasPrice = price.perUnit != null;
  const totalPrice = (price.perUnit ?? 0) * qty;

  const tabs: { key: TabKey; label: string; show: boolean }[] = [
    { key: "description", label: "Описание", show: !!product.description },
    { key: "specs", label: "Характеристики", show: product.attributes.length > 0 },
    { key: "delivery", label: "Доставка", show: true },
    { key: "faq", label: "Вопросы", show: true },
  ];
  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <div className="atlas-fade-in">
      <AtlasBreadcrumbs items={breadcrumbs} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Photo gallery */}
        <div>
          <div className="atlas-photo-canvas aspect-square rounded-xl overflow-hidden relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageLocal || product.imageUrl || "/products/placeholders/default.svg"}
              alt={product.name}
              className="w-full h-full object-contain atlas-product-img"
            />
            {product.imagePlaceholder && (
              <div className="absolute bottom-3 left-3 atlas-badge atlas-badge-neutral" style={{ fontSize: 11 }}>
                Фото типовое. Реальный товар может отличаться.
              </div>
            )}
          </div>
          {/* Thumbnails (placeholder for future gallery) */}
          <div className="flex gap-2 mt-3">
            <div className="atlas-thumb atlas-thumb-active">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.imageLocal || product.imageUrl || "/products/placeholders/default.svg"} alt={product.name} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Buy box */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight" style={{ fontFamily: "var(--atlas-font-heading)" }}>
            {product.name}
          </h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.inStock ? (
              <span className="atlas-badge atlas-badge-success">● В наличии</span>
            ) : (
              <span className="atlas-badge atlas-badge-warning">● Под заказ 1–3 дня</span>
            )}
            {product.gost && <span className="atlas-badge atlas-badge-neutral">{product.gost}</span>}
            {product.weightLabel && <span className="atlas-badge atlas-badge-neutral">{product.weightLabel}</span>}
          </div>

          {/* Price block */}
          <div className="p-5 rounded-xl mb-4" style={{ background: "var(--atlas-surface-2)" }}>
            {hasPrice ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold atlas-price-main" style={{ color: "var(--atlas-text)" }}>
                    {formatRub(price.perUnit!)}
                  </span>
                  <span className="text-lg" style={{ color: "var(--atlas-text-muted)" }}>₽{price.unitLabel.replace("₽/", "/")}</span>
                </div>
                {config.buyBox.showPerTon && price.perTonLabel && (
                  <div className="text-sm mt-1.5" style={{ color: "var(--atlas-text-muted)" }}>{price.perTonLabel}</div>
                )}
                {config.buyBox.showZonePrice && (
                  <div className="text-xs mt-1" style={{ color: "var(--atlas-text-muted)" }}>Цена актуальна для вашего города</div>
                )}
                {qty > 1 && (
                  <div className="text-sm mt-2 pt-2 border-t" style={{ borderColor: "var(--atlas-border)", color: "var(--atlas-text-muted)" }}>
                    Итого за {qty} {price.unitLabel.replace("₽/", "")}: <b style={{ color: "var(--atlas-text)" }}>{formatRub(totalPrice)} ₽</b>
                  </div>
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
          {hasPrice && (
            <div className="flex gap-3 mb-4">
              <div className="atlas-qty shrink-0" style={{ height: 52 }}>
                <button className="atlas-qty-btn" style={{ width: 48, height: 52 }} onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Minus size={18} />
                </button>
                <span className="atlas-qty-val" style={{ width: 56, height: 52, fontSize: 16 }}>{qty}</span>
                <button className="atlas-qty-btn" style={{ width: 48, height: 52 }} onClick={() => setQty((q) => q + 1)}>
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
            {config.buyBox.showOneClick && hasPrice && (
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

          {/* Quick info — trust badges */}
          <div className="atlas-card p-4 space-y-2.5 text-sm">
            {config.buyBox.showDelivery && (
              <div className="atlas-trust-inline">
                <Truck size={18} /> Доставка по Москве и МО в день заказа
              </div>
            )}
            <div className="atlas-trust-inline">
              <Shield size={18} /> Сертификат качества при необходимости
            </div>
            <div className="atlas-trust-inline">
              <Package size={18} /> Отгрузка от 1 единицы · Самовывоз со склада
            </div>
          </div>

          {/* Short specs preview */}
          {product.attributes.length > 0 && (
            <div className="mt-4 text-sm">
              <table className="w-full">
                <tbody>
                  {product.attributes.slice(0, 5).map((a, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--atlas-border)" }}>
                      <td className="py-2 pr-4" style={{ color: "var(--atlas-text-muted)" }}>{a.key}</td>
                      <td className="py-2 font-medium text-right">{a.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      {visibleTabs.length > 0 && (
        <div className="mt-10">
          <div className="atlas-tabs">
            {visibleTabs.map((tab) => (
              <div
                key={tab.key}
                className={`atlas-tab ${activeTab === tab.key ? "atlas-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          <div className="py-6">
            {activeTab === "description" && product.description && (
              <div className="text-sm leading-relaxed max-w-3xl" dangerouslySetInnerHTML={{ __html: sanitizeDescription(product.description) }} />
            )}
            {activeTab === "specs" && (
              <div className="max-w-2xl">
                <table className="w-full text-sm">
                  <tbody>
                    {product.attributes.map((a, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--atlas-border)" }}>
                        <td className="py-3 pr-6" style={{ color: "var(--atlas-text-muted)", width: "40%" }}>{a.key}</td>
                        <td className="py-3 font-medium">{a.value}</td>
                      </tr>
                    ))}
                    {product.gost && (
                      <tr style={{ borderBottom: "1px solid var(--atlas-border)" }}>
                        <td className="py-3 pr-6" style={{ color: "var(--atlas-text-muted)" }}>ГОСТ</td>
                        <td className="py-3 font-medium">{product.gost}</td>
                      </tr>
                    )}
                    {product.weightLabel && (
                      <tr style={{ borderBottom: "1px solid var(--atlas-border)" }}>
                        <td className="py-3 pr-6" style={{ color: "var(--atlas-text-muted)" }}>Вес</td>
                        <td className="py-3 font-medium">{product.weightLabel}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "delivery" && (
              <div className="max-w-3xl text-sm space-y-4 leading-relaxed">
                <div className="flex gap-3">
                  <Truck size={24} className="shrink-0" style={{ color: "var(--atlas-primary)" }} />
                  <div>
                    <h4 className="font-bold mb-1">Доставка по Москве и МО</h4>
                    <p style={{ color: "var(--atlas-text-muted)" }}>Доставка в день заказа при оформлении до 14:00. Стоимость доставки рассчитывается менеджером индивидуально.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Package size={24} className="shrink-0" style={{ color: "var(--atlas-primary)" }} />
                  <div>
                    <h4 className="font-bold mb-1">Самовывоз</h4>
                    <p style={{ color: "var(--atlas-text-muted)" }}>Возможен самовывоз со склада. Адрес и время согласуются с менеджером после оформления заказа.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Shield size={24} className="shrink-0" style={{ color: "var(--atlas-primary)" }} />
                  <div>
                    <h4 className="font-bold mb-1">Гарантия и сертификаты</h4>
                    <p style={{ color: "var(--atlas-text-muted)" }}>Весь металлопрокат сертифицирован. Сертификат качества предоставляется по запросу.</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "faq" && (
              <div className="max-w-3xl text-sm space-y-4">
                <div>
                  <h4 className="font-bold mb-1">Как оформить заказ?</h4>
                  <p style={{ color: "var(--atlas-text-muted)" }}>Добавьте товар в корзину, заполните форму заказа или позвоните нам. Менеджер свяжется с вами для подтверждения.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Можно купить оптом?</h4>
                  <p style={{ color: "var(--atlas-text-muted)" }}>Да, мы работаем с оптовыми заказами. Для получения оптового прайса запросите коммерческое предложение.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Какие способы оплаты?</h4>
                  <p style={{ color: "var(--atlas-text-muted)" }}>Наличными водителю, картой при получении, безналичный расчёт для юридических лиц.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Config-driven sections (ProductDescription, ProductSpecs, ProductCalculator, ProductDelivery) */}
      {sections.length > 0 && (
        <div className="mt-8 space-y-8">
          <AtlasRenderer sections={sections} resolved={resolved} />
        </div>
      )}

      {/* Similar products */}
      {similar.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4 atlas-heading-accent" style={{ fontFamily: "var(--atlas-font-heading)" }}>
            Похожие товары
          </h2>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 atlas-overlay-enter" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-xl p-6 atlas-fade-in" style={{ background: "var(--atlas-surface)" }} onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "color-mix(in srgb, var(--atlas-success) 12%, transparent)" }}>
              <Check size={32} style={{ color: "var(--atlas-success)" }} />
            </div>
            <p className="text-lg font-bold">Заявка принята!</p>
            <p className="text-sm mt-1" style={{ color: "var(--atlas-text-muted)" }}>Менеджер свяжется в течение 15 минут</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-2">Купить в 1 клик</h3>
            <p className="text-sm mb-4" style={{ color: "var(--atlas-text-muted)" }}>
              {product.name} × {qty} = <b style={{ color: "var(--atlas-text)" }}>{formatRub((price.perUnit ?? 0) * qty)} ₽</b>
            </p>
            <div className="space-y-3">
              <input className="atlas-input" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="atlas-input" placeholder="+7 (___) ___-__-__" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
              <button className="atlas-btn atlas-btn-primary w-full atlas-btn-lg" onClick={submit} disabled={!phone.trim()}>
                <Phone size={18} /> Отправить заявку
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
