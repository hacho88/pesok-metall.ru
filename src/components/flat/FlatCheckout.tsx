"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Truck, CreditCard, Banknote, FileText, ShoppingBag } from "lucide-react";
import "@/components/flat/flat.css";
import { FlatHeader, FlatFooter, FlatBreadcrumbs } from "../../components/flat/FlatChrome";
import { useCartStore } from "@/components/atlas/checkout/cart-store";
import { formatRub } from "@/lib/atlas/pricing";

export function FlatCheckout() {
  const store = useCartStore();
  const totals = store.totals();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "Москва", payment: "card", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (store.items.length === 0 && !orderId) {
    return (
      <div className="flat-theme">
        <FlatHeader />
        <div className="flat-container">
          <div className="flat-empty">
            <div className="flat-empty__icon"><ShoppingBag size={36} /></div>
            <div className="flat-empty__title">Корзина пуста</div>
            <Link href="/shop" className="flat-btn flat-btn-primary">В каталог</Link>
          </div>
        </div>
        <FlatFooter />
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="flat-theme">
        <FlatHeader />
        <div className="flat-container">
          <div className="flat-empty">
            <div className="flat-empty__icon" style={{ background: "rgba(33,174,140,0.1)", color: "var(--flat-success)" }}><Check size={36} /></div>
            <div className="flat-empty__title">Заказ оформлен!</div>
            <div className="flat-empty__text">Номер заказа: <strong style={{ color: "var(--flat-primary)" }}>#{orderId.slice(0, 8).toUpperCase()}</strong></div>
            <Link href="/shop" className="flat-btn flat-btn-primary">Продолжить покупки</Link>
          </div>
        </div>
        <FlatFooter />
      </div>
    );
  }

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setSubmitting(true);
    try {
      const resp = await fetch("/api/atlas/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: store.items, customer: form, totals, zoneSlug: null }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setOrderId(data.orderId);
        store.clear();
      }
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="flat-theme">
      <FlatHeader />
      <div className="flat-container">
        <FlatBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Корзина", href: "/cart" }, { label: "Оформление" }]} />
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--flat-dark)", marginBottom: 32 }}>Оформление заказа</h1>

        <div className="flat-cart">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#fff", border: "1px solid var(--flat-border)", borderRadius: "var(--flat-radius-lg)", padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--flat-dark)" }}>Контактные данные</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input className="flat-input" placeholder="Имя*" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="flat-input" placeholder="Телефон*" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input className="flat-input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="flat-input" placeholder="Город" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid var(--flat-border)", borderRadius: "var(--flat-radius-lg)", padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                <Truck size={18} style={{ color: "var(--flat-primary)" }} /> Доставка
              </h3>
              <input className="flat-input" placeholder="Адрес доставки" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>

            <div style={{ background: "#fff", border: "1px solid var(--flat-border)", borderRadius: "var(--flat-radius-lg)", padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>Способ оплаты</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { v: "card", icon: <CreditCard size={22} />, l: "Картой" },
                  { v: "cash", icon: <Banknote size={22} />, l: "Наличными" },
                  { v: "invoice", icon: <FileText size={22} />, l: "По счёту" },
                ].map((o) => (
                  <button key={o.v} className="flat-btn" style={{
                    border: `2px solid ${form.payment === o.v ? "var(--flat-primary)" : "var(--flat-border)"}`,
                    background: form.payment === o.v ? "var(--flat-primary-light)" : "#fff",
                    color: form.payment === o.v ? "var(--flat-primary)" : "var(--flat-gray-800)",
                    flexDirection: "column", gap: 6, padding: "20px 12px",
                  }} onClick={() => setForm({ ...form, payment: o.v })}>
                    {o.icon} {o.l}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid var(--flat-border)", borderRadius: "var(--flat-radius-lg)", padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>Комментарий</h3>
              <textarea className="flat-input" rows={3} placeholder="Дополнительные пожелания..." value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            </div>
          </div>

          <div className="flat-summary">
            <h3 className="flat-summary__title">Ваш заказ</h3>
            <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 16 }}>
              {store.items.map((item) => (
                <div key={item.productId} style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 10 }}>
                  <span style={{ flex: 1 }}>{item.name} × {item.qty}</span>
                  <span style={{ fontWeight: 600 }}>{formatRub(item.price * item.qty)} ₽</span>
                </div>
              ))}
            </div>
            <div className="flat-summary__total">
              <span className="flat-summary__total-label">Итого:</span>
              <span className="flat-summary__total-val">{formatRub(totals.subtotal)} ₽</span>
            </div>
            <button className="flat-btn flat-btn-primary flat-btn-block flat-btn-lg" style={{ marginTop: 20 }} onClick={submit} disabled={submitting || !form.name || !form.phone}>
              {submitting ? "Оформляем..." : "Оформить заказ"}
            </button>
          </div>
        </div>
      </div>
      <FlatFooter />
    </div>
  );
}
