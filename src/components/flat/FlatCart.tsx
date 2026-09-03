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
        <FlatHeader />
        <div className="flat-container">
          <FlatBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Корзина" }]} />
          <div className="flat-empty">
            <div className="flat-empty__icon"><ShoppingBag size={36} /></div>
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
      <FlatHeader />
      <div className="flat-container">
        <FlatBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Корзина" }]} />
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--flat-dark)", marginBottom: 32 }}>Корзина ({totals.itemsCount})</h1>

        <div className="flat-cart">
          <table className="flat-cart-table">
            <thead>
              <tr><th>Товар</th><th>Цена</th><th>Кол-во</th><th>Сумма</th><th></th></tr>
            </thead>
            <tbody>
              {store.items.map((item) => (
                <tr key={item.productId}>
                  <td>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ width: 64, height: 64, background: "var(--flat-bg-light)", borderRadius: "var(--flat-radius)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {item.imageLocal ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageLocal} alt={item.name} style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }} />
                        ) : <span style={{ fontSize: 24 }}>📦</span>}
                      </div>
                      <div>
                        <Link href={`/product/${item.slug}`} style={{ fontWeight: 600, color: "var(--flat-dark)" }}>{item.name}</Link>
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
                  <td style={{ fontWeight: 700, color: "var(--flat-primary)", fontSize: 16 }}>{formatRub(item.price * item.qty)} ₽</td>
                  <td>
                    <button className="flat-icon-btn" onClick={() => store.remove(item.productId)} style={{ color: "var(--flat-danger)" }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="flat-summary">
            <h3 className="flat-summary__title">Сумма заказа</h3>
            <div className="flat-summary__row">
              <span>Товары ({totals.itemsCount})</span>
              <span>{formatRub(totals.subtotal)} ₽</span>
            </div>
            <div className="flat-summary__row">
              <span>Доставка</span>
              <span style={{ color: "var(--flat-success)" }}>Рассчитает менеджер</span>
            </div>
            <div className="flat-summary__total">
              <span className="flat-summary__total-label">Итого:</span>
              <span className="flat-summary__total-val">{formatRub(totals.subtotal)} ₽</span>
            </div>
            <Link href="/checkout" className="flat-btn flat-btn-primary flat-btn-block flat-btn-lg" style={{ marginTop: 20 }}>
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
