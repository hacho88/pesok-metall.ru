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
        <FlatHeader products={[]} />
        <div className="flat-container">
          <div className="flat-empty">
            <div className="flat-empty__icon"><ShoppingBag size={32} /></div>
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
        <FlatHeader products={[]} />
        <div className="flat-container">
          <div className="flat-empty">
            <div className="flat-empty__icon" style={{ background: "rgba(33,174,140,0.12)", color: "var(--flat-success)" }}>
              <Check size={32} />
            </div>
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
      <FlatHeader products={[]} />
      <div className="flat-container">
        <FlatBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Корзина", href: "/cart" }, { label: "Оформление" }]} />
        <h1 className="flat-section__title">Оформление заказа</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="flat-card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, margin: "0 0 16px" }}>Контактные данные</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input className="flat-input" placeholder="Имя*" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="flat-input" placeholder="Телефон*" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input className="flat-input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="flat-input" placeholder="Город" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>

            <div className="flat-card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <Truck size={18} style={{ color: "var(--flat-primary)" }} /> Доставка
              </h3>
              <input className="flat-input" placeholder="Адрес доставки" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>

            <div className="flat-card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, margin: "0 0 16px" }}>Способ оплаты</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { v: "card", icon: <CreditCard size={20} />, l: "Картой" },
                  { v: "cash", icon: <Banknote size={20} />, l: "Наличными" },
                  { v: "invoice", icon: <FileText size={20} />, l: "По счёту" },
                ].map((o) => (
                  <button key={o.v} className="flat-btn" style={{
                    border: `2px solid ${form.payment === o.v ? "var(--flat-primary)" : "var(--flat-border)"}`,
                    background: form.payment === o.v ? "var(--flat-primary-light)" : "transparent",
                    color: form.payment === o.v ? "var(--flat-primary)" : "var(--flat-gray-800)",
                    flexDirection: "column", gap: 4, padding: "16px 12px",
                  }} onClick={() => setForm({ ...form, payment: o.v })}>
                    {o.icon} {o.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flat-card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, margin: "0 0 16px" }}>Комментарий</h3>
              <textarea className="flat-input" rows={3} placeholder="Дополнительные пожелания..." value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            </div>
          </div>

          <div className="flat-card" style={{ padding: 20, position: "sticky", top: "calc(var(--flat-header-h) + 16px)" }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, margin: "0 0 16px" }}>Ваш заказ</h3>
            <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 12 }}>
              {store.items.map((item) => (
                <div key={item.productId} style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 8 }}>
                  <span style={{ flex: 1 }}>{item.name} × {item.qty}</span>
                  <span style={{ fontWeight: 600 }}>{formatRub(item.price * item.qty)} ₽</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--flat-border)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontWeight: 700 }}>Итого:</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "var(--flat-primary)" }}>{formatRub(totals.subtotal)} ₽</span>
            </div>
            <button className="flat-btn flat-btn-primary flat-btn-block flat-btn-lg" onClick={submit} disabled={submitting || !form.name || !form.phone}>
              {submitting ? "Оформляем..." : "Оформить заказ"}
            </button>
          </div>
        </div>
      </div>
      <FlatFooter />
    </div>
  );
}
