"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import "@/components/flat/flat.css";
import { FlatHeader, FlatFooter, FlatBreadcrumbs } from "../../components/flat/FlatChrome";
import { useCartStore } from "@/components/atlas/checkout/cart-store";
import { formatRub } from "@/lib/atlas/pricing";

export function FlatCart() {
  const store = useCartStore();
  const totals = store.totals();

  if (store.items.length === 0) {
    return (
      <div className="flat-theme">
        <FlatHeader products={[]} />
        <div className="flat-container">
          <FlatBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Корзина" }]} />
          <div className="flat-empty">
            <div className="flat-empty__icon"><ShoppingBag size={32} /></div>
            <div className="flat-empty__title">Корзина пуста</div>
            <div className="flat-empty__text">Добавьте товары, чтобы оформить заказ</div>
            <Link href="/shop" className="flat-btn flat-btn-primary">Перейти в каталог</Link>
          </div>
        </div>
        <FlatFooter />
      </div>
    );
  }

  return (
    <div className="flat-theme">
      <FlatHeader products={[]} />
      <div className="flat-container">
        <FlatBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Корзина" }]} />
        <h1 className="flat-section__title">Корзина ({totals.itemsCount})</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
          <div className="flat-card" style={{ overflow: "hidden" }}>
            <table className="flat-cart-table">
              <thead>
                <tr><th>Товар</th><th>Цена</th><th>Кол-во</th><th>Сумма</th><th></th></tr>
              </thead>
              <tbody>
                {store.items.map((item) => (
                  <tr key={item.productId}>
                    <td>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ width: 56, height: 56, background: "var(--flat-gray-100)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {item.imageLocal ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageLocal} alt={item.name} style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }} />
                          ) : <span>📦</span>}
                        </div>
                        <div>
                          <Link href={`/product/${item.slug}`} style={{ fontWeight: 600, color: "var(--flat-text)" }}>{item.name}</Link>
                          {item.unit && <div style={{ fontSize: 12, color: "var(--flat-text-muted)" }}>/{item.unit}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatRub(item.price)} ₽</td>
                    <td>
                      <div className="flat-qty">
                        <button className="flat-qty__btn" onClick={() => store.updateQty(item.productId, Math.max(1, item.qty - 1))}><Minus size={14} /></button>
                        <input className="flat-qty__val" value={item.qty} readOnly />
                        <button className="flat-qty__btn" onClick={() => store.updateQty(item.productId, item.qty + 1)}><Plus size={14} /></button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--flat-primary)" }}>{formatRub(item.price * item.qty)} ₽</td>
                    <td>
                      <button className="flat-icon-btn" onClick={() => store.remove(item.productId)} style={{ color: "var(--flat-danger)" }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flat-card" style={{ padding: 20, position: "sticky", top: "calc(var(--flat-header-h) + 16px)" }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, margin: "0 0 16px" }}>Сумма заказа</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: "var(--flat-text-muted)" }}>Товары ({totals.itemsCount})</span>
              <span style={{ fontWeight: 600 }}>{formatRub(totals.subtotal)} ₽</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: "var(--flat-text-muted)" }}>Доставка</span>
              <span style={{ color: "var(--flat-success)", fontWeight: 600 }}>Рассчитает менеджер</span>
            </div>
            <div style={{ borderTop: "1px solid var(--flat-border)", margin: "12px 0", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700 }}>Итого:</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: "var(--flat-primary)" }}>{formatRub(totals.subtotal)} ₽</span>
            </div>
            <Link href="/checkout" className="flat-btn flat-btn-primary flat-btn-block flat-btn-lg">
              Оформить заказ <ArrowRight size={18} />
            </Link>
            <Link href="/shop" className="flat-btn flat-btn-outline flat-btn-block" style={{ marginTop: 8 }}>
              Продолжить покупки
            </Link>
          </div>
        </div>
      </div>
      <FlatFooter />
    </div>
  );
}
