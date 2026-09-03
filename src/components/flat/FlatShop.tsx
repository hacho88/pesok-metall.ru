"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, Grid3x3, List, ChevronLeft, ChevronRight } from "lucide-react";
import "@/components/flat/flat.css";
import { FlatHeader, FlatFooter, FlatBreadcrumbs } from "../../components/flat/FlatChrome";
import { FlatProductCard } from "../../components/flat/FlatProductCard";
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
      <FlatHeader products={products} />
      <div className="flat-container">
        <FlatBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 className="flat-section__title" style={{ margin: 0 }}>Каталог товаров</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select className="flat-input" style={{ width: "auto" }} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">По умолчанию</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
              <option value="name">По названию</option>
            </select>
            <button className="flat-icon-btn" onClick={() => setView("grid")} style={{ background: view === "grid" ? "var(--flat-primary-light)" : "transparent", color: view === "grid" ? "var(--flat-primary)" : "var(--flat-gray-700)" }}>
              <Grid3x3 size={18} />
            </button>
            <button className="flat-icon-btn" onClick={() => setView("list")} style={{ background: view === "list" ? "var(--flat-primary-light)" : "transparent", color: view === "list" ? "var(--flat-primary)" : "var(--flat-gray-700)" }}>
              <List size={18} />
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, alignItems: "start" }}>
          {/* Sidebar */}
          <aside className="flat-sidebar" style={{ position: "sticky", top: "calc(var(--flat-header-h) + 16px)" }}>
            <div className="flat-sidebar__group">
              <SlidersHorizontal size={12} style={{ display: "inline", marginRight: 4 }} /> Категории
            </div>
            <div className="flat-sidebar__item" onClick={() => { setCategory(""); setPage(1); }} style={{ cursor: "pointer", ...(category === "" ? { background: "var(--flat-primary-light)", color: "var(--flat-primary)", fontWeight: 600 } : {}) }}>
              <span>Все товары</span>
              <span className="flat-sidebar__count">{products.length}</span>
            </div>
            {categories.map((c) => {
              const count = products.filter((p) => p.categoryName === c).length;
              return (
                <div key={c} className={`flat-sidebar__item ${category === c ? "flat-sidebar__item--active" : ""}`} onClick={() => { setCategory(c); setPage(1); }} style={{ cursor: "pointer" }}>
                  <span>{c}</span>
                  <span className="flat-sidebar__count">{count}</span>
                </div>
              );
            })}
          </aside>

          {/* Products */}
          <div>
            <div style={{ fontSize: 13, color: "var(--flat-text-muted)", marginBottom: 16 }}>
              Найдено: <strong style={{ color: "var(--flat-dark)" }}>{filtered.length}</strong> товаров
            </div>
            {pageItems.length === 0 ? (
              <div className="flat-empty">
                <div className="flat-empty__icon">📦</div>
                <div className="flat-empty__title">Товары не найдены</div>
                <div className="flat-empty__text">Попробуйте изменить категорию</div>
              </div>
            ) : view === "grid" ? (
              <div className="flat-grid flat-grid-3">
                {pageItems.map((p) => <FlatProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pageItems.map((p) => <FlatProductRow key={p.id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flat-pagination">
                <button className="flat-pagination__btn" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map((p) => (
                  <button key={p} className={`flat-pagination__btn ${p === page ? "flat-pagination__btn--active" : ""}`} onClick={() => setPage(p)}>
                    {p}
                  </button>
                ))}
                <button className="flat-pagination__btn" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                  <ChevronRight size={16} />
                </button>
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
  return (
    <div className="flat-card" style={{ display: "flex", gap: 16, padding: 16, alignItems: "center" }}>
      <div style={{ width: 80, height: 80, background: "var(--flat-gray-100)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {product.imageLocal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageLocal} alt={product.name} style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }} />
        ) : <div style={{ fontSize: 28 }}>📦</div>}
      </div>
      <div style={{ flex: 1 }}>
        <div className="flat-product__category">{product.categoryName}</div>
        <a href={`/product/${product.slug}`} style={{ fontWeight: 600, color: "var(--flat-text)", fontSize: 15, display: "block", margin: "4px 0" }}>
          {product.name}
        </a>
        <div style={{ fontSize: 13, color: "var(--flat-text-muted)" }}>
          {product.inStock ? "В наличии" : "Под заказ"} {product.gost && `• ГОСТ ${product.gost}`}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="flat-product__price" style={{ marginBottom: 8 }}>
          {product.price ? `${product.price.toLocaleString("ru-RU")} ₽` : "По запросу"}
        </div>
        <button className="flat-btn flat-btn-primary flat-btn-sm">В корзину</button>
      </div>
    </div>
  );
}
