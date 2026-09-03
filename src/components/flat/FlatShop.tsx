"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, Grid3x3, List, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import "@/components/flat/flat.css";
import { FlatHeader, FlatFooter, FlatBreadcrumbs } from "../../components/flat/FlatChrome";
import { FlatProductCard } from "../../components/flat/FlatProductCard";
import { useCartStore } from "@/components/atlas/checkout/cart-store";
import { formatRub } from "@/lib/atlas/pricing";
import type { StorefrontProduct } from "@/lib/theme-storefront";

export function FlatShop({ products, initialCategory }: { products: StorefrontProduct[]; initialCategory?: string }) {
  const [category, setCategory] = useState(initialCategory ?? "");
  const [sort, setSort] = useState("default");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.categoryName))), [products]);

  const filtered = useMemo(() => {
    let r = category ? products.filter((p) => p.categoryName === category) : products;
    if (sort === "price-asc") r = [...r].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sort === "price-desc") r = [...r].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (sort === "name") r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    return r;
  }, [products, category, sort]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="flat-theme">
      <FlatHeader />
      <div className="flat-container">
        <FlatBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--flat-dark)" }}>Каталог товаров</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select className="flat-input" style={{ width: "auto", padding: "10px 14px" }} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">По умолчанию</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
              <option value="name">По названию</option>
            </select>
            <button className="flat-icon-btn" onClick={() => setView("grid")} style={{ background: view === "grid" ? "var(--flat-primary-light)" : "transparent", color: view === "grid" ? "var(--flat-primary)" : "var(--flat-gray-700)" }}><Grid3x3 size={18} /></button>
            <button className="flat-icon-btn" onClick={() => setView("list")} style={{ background: view === "list" ? "var(--flat-primary-light)" : "transparent", color: view === "list" ? "var(--flat-primary)" : "var(--flat-gray-700)" }}><List size={18} /></button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 32, alignItems: "start" }}>
          {/* Sidebar */}
          <aside>
            <div className="flat-sidebar">
              <div className="flat-sidebar__head"><SlidersHorizontal size={14} style={{ display: "inline", marginRight: 6 }} /> Категории</div>
              <div className={`flat-sidebar__item ${category === "" ? "flat-sidebar__item--active" : ""}`} onClick={() => { setCategory(""); setPage(1); }}>
                <span>Все товары</span>
                <span className="flat-sidebar__count">{products.length}</span>
              </div>
              {categories.map((c) => {
                const count = products.filter((p) => p.categoryName === c).length;
                return (
                  <div key={c} className={`flat-sidebar__item ${category === c ? "flat-sidebar__item--active" : ""}`} onClick={() => { setCategory(c); setPage(1); }}>
                    <span>{c}</span>
                    <span className="flat-sidebar__count">{count}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Products */}
          <div>
            <div style={{ fontSize: 13, color: "var(--flat-text-muted)", marginBottom: 20 }}>
              Найдено: <strong style={{ color: "var(--flat-dark)" }}>{filtered.length}</strong> товаров
            </div>
            {pageItems.length === 0 ? (
              <div className="flat-empty">
                <div className="flat-empty__icon"><ShoppingBag size={36} /></div>
                <div className="flat-empty__title">Товары не найдены</div>
                <div className="flat-empty__text">Попробуйте изменить категорию</div>
              </div>
            ) : view === "grid" ? (
              <div className="flat-products">
                {pageItems.map((p) => <FlatProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pageItems.map((p) => <FlatProductRow key={p.id} product={p} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flat-pagination">
                <button className="flat-pagination__btn" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><ChevronLeft size={16} /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map((p) => (
                  <button key={p} className={`flat-pagination__btn ${p === page ? "flat-pagination__btn--active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="flat-pagination__btn" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
      <FlatFooter />
    </div>
  );
}

function FlatProductRow({ product }: { product: StorefrontProduct }) {
  const addToCart = useCartStore((s) => s.add);
  return (
    <div className="flat-card" style={{ display: "flex", gap: 20, padding: 16, alignItems: "center", background: "#fff", border: "1px solid var(--flat-border)", borderRadius: "var(--flat-radius-lg)", transition: "box-shadow 0.2s ease" }}>
      <div style={{ width: 96, height: 96, background: "var(--flat-bg-light)", borderRadius: "var(--flat-radius)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {product.imageLocal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageLocal} alt={product.name} style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }} />
        ) : <div style={{ fontSize: 32 }}>📦</div>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "var(--flat-text-muted)" }}>{product.categoryName}</div>
        <a href={`/product/${product.slug}`} style={{ fontWeight: 600, color: "var(--flat-dark)", fontSize: 15, display: "block", margin: "4px 0", transition: "color 0.2s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--flat-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--flat-dark)")}>
          {product.name}
        </a>
        <div style={{ fontSize: 13, color: "var(--flat-text-muted)" }}>
          {product.inStock ? "В наличии" : "Под заказ"} {product.gost && `· ГОСТ ${product.gost}`}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--flat-dark)", marginBottom: 8 }}>
          {product.price ? `${formatRub(product.price)} ₽` : "По запросу"}
        </div>
        <button className="flat-btn flat-btn-primary flat-btn-sm" onClick={() => addToCart({
          productId: product.id, name: product.name, slug: product.slug,
          price: product.price ?? 0, imageLocal: product.imageLocal,
          imagePlaceholder: !product.imageLocal && !product.imageUrl,
          unit: product.unit, minQty: 1, step: 1, inStock: product.inStock,
        } as any, 1)}>
          <ShoppingBag size={14} /> В корзину
        </button>
      </div>
    </div>
  );
}
