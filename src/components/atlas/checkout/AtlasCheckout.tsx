"use client";

import { useState } from "react";
import { Check, Truck, CreditCard, Banknote, FileText, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "./cart-store";
import { formatRub } from "@/lib/atlas/pricing";
import { AtlasBreadcrumbs } from "../catalog/AtlasBreadcrumbs";

export function AtlasCheckout({
  zones,
  currentZone,
}: {
  zones: { slug: string; name: string }[];
  currentZone: { slug: string; name: string } | null;
}) {
  const store = useCartStore();
  const totals = store.totals();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: currentZone?.name ?? "Москва",
    address: "",
    deliveryDate: "",
    comment: "",
    payment: "card",
    legalType: "person" as "person" | "company",
    companyName: "",
    inn: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  if (store.items.length === 0 && !orderId) {
    return (
      <div>
        <AtlasBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Оформление заказа" }]} />
        <div className="text-center py-20">
          <ShoppingBag size={48} style={{ color: "var(--atlas-text-muted)", opacity: 0.3, margin: "0 auto" }} />
          <h1 className="text-2xl font-bold mt-4 mb-2">Корзина пуста</h1>
          <p className="text-sm mb-4" style={{ color: "var(--atlas-text-muted)" }}>Добавьте товары в корзину, чтобы оформить заказ</p>
          <a href="/shop" className="atlas-btn atlas-btn-primary">Перейти в каталог</a>
        </div>
      </div>
    );
  }

  const submit = async () => {
    if (!form.phone.trim() || !form.name.trim()) {
      setError("Заполните имя и телефон");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const resp = await fetch("/api/atlas/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: store.items,
          customer: form,
          totals,
          zoneSlug: currentZone?.slug ?? null,
        }),
      });
      if (!resp.ok) throw new Error("Failed to create order");
      const data = await resp.json();
      setOrderId(data.orderId);
      store.clear();
    } catch (e) {
      setError("Ошибка при оформлении заказа. Попробуйте ещё раз или позвоните нам.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderId) {
    return (
      <div>
        <AtlasBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Заказ оформлен" }]} />
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "color-mix(in srgb, var(--atlas-success) 12%, transparent)" }}>
            <Check size={32} style={{ color: "var(--atlas-success)" }} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Заказ оформлен!</h1>
          <p className="text-sm mb-1" style={{ color: "var(--atlas-text-muted)" }}>Номер заказа:</p>
          <p className="text-xl font-bold mb-4" style={{ color: "var(--atlas-primary)" }}>#{orderId.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm mb-6" style={{ color: "var(--atlas-text-muted)" }}>
            Менеджер свяжется с вами в течение 15 минут для подтверждения заказа.
          </p>
          <a href="/shop" className="atlas-btn atlas-btn-primary">Продолжить покупки</a>
        </div>
      </div>
    );
  }

  return (
    <div className="atlas-fade-in">
      <AtlasBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Оформление заказа" }]} />

      {/* Progress steps */}
      <div className="flex items-center gap-2 mt-4 mb-6 text-sm">
        <StepBadge num={1} label="Корзина" active={false} done={true} />
        <div className="flex-1 h-0.5 max-w-[60px]" style={{ background: "var(--atlas-primary)" }} />
        <StepBadge num={2} label="Оформление" active={true} done={false} />
        <div className="flex-1 h-0.5 max-w-[60px]" style={{ background: "var(--atlas-border)" }} />
        <StepBadge num={3} label="Подтверждение" active={false} done={false} />
      </div>

      <h1 className="text-2xl font-bold mb-6 atlas-heading-accent" style={{ fontFamily: "var(--atlas-font-heading)" }}>Оформление заказа</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact info */}
          <div className="atlas-card p-5">
            <h2 className="font-bold text-lg mb-4">Контактные данные</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Имя*" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Иван Иванов" />
              <Field label="Телефон*" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+7 (___) ___-__-__" type="tel" />
              <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="ivan@example.com" type="email" />
              <div>
                <label className="text-sm font-medium block mb-1">Тип покупателя</label>
                <div className="flex gap-2">
                  <button className={`atlas-btn atlas-btn-sm ${form.legalType === "person" ? "atlas-btn-primary" : "atlas-btn-secondary"}`} onClick={() => setForm({ ...form, legalType: "person" })}>Физлицо</button>
                  <button className={`atlas-btn atlas-btn-sm ${form.legalType === "company" ? "atlas-btn-primary" : "atlas-btn-secondary"}`} onClick={() => setForm({ ...form, legalType: "company" })}>Юрлицо</button>
                </div>
              </div>
              {form.legalType === "company" && (
                <>
                  <Field label="Название компании" value={form.companyName} onChange={(v) => setForm({ ...form, companyName: v })} placeholder="ООО Ромашка" />
                  <Field label="ИНН" value={form.inn} onChange={(v) => setForm({ ...form, inn: v })} placeholder="7701234567" />
                </>
              )}
            </div>
          </div>

          {/* Delivery */}
          <div className="atlas-card p-5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Truck size={20} style={{ color: "var(--atlas-primary)" }} /> Доставка
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">Город</label>
                <select className="atlas-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                  {zones.map((z) => <option key={z.slug} value={z.name}>{z.name}</option>)}
                </select>
              </div>
              <Field label="Адрес доставки" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="ул. Ленина, д. 1" />
              <Field label="Дата доставки" value={form.deliveryDate} onChange={(v) => setForm({ ...form, deliveryDate: v })} placeholder="2026-09-05" type="date" />
            </div>
          </div>

          {/* Payment */}
          <div className="atlas-card p-5">
            <h2 className="font-bold text-lg mb-4">Способ оплаты</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <PaymentOption icon={<CreditCard size={20} />} label="Картой при получении" value="card" current={form.payment} onSelect={(v) => setForm({ ...form, payment: v })} />
              <PaymentOption icon={<Banknote size={20} />} label="Наличными водителю" value="cash" current={form.payment} onSelect={(v) => setForm({ ...form, payment: v })} />
              <PaymentOption icon={<FileText size={20} />} label="По счёту (юрлица)" value="invoice" current={form.payment} onSelect={(v) => setForm({ ...form, payment: v })} />
            </div>
          </div>

          {/* Comment */}
          <div className="atlas-card p-5">
            <h2 className="font-bold text-lg mb-4">Комментарий к заказу</h2>
            <textarea
              className="atlas-input"
              rows={3}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Дополнительные пожелания к заказу..."
            />
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="atlas-card atlas-card-elevated p-5 sticky" style={{ top: "calc(var(--atlas-header-h, 152px) + 16px)" }}>
            <h2 className="font-bold text-lg mb-4">Ваш заказ</h2>
            <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto atlas-scroll">
              {store.items.map((item) => (
                <div key={item.productId} className="flex gap-2 text-sm">
                  <div className="w-12 h-12 shrink-0 atlas-photo-canvas">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {item.imageLocal && <img src={item.imageLocal} alt={item.name} className="w-full h-full object-contain" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium line-clamp-1">{item.name}</div>
                    <div className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>{item.qty} × {formatRub(item.price)} ₽</div>
                  </div>
                  <div className="font-bold whitespace-nowrap">{formatRub(item.price * item.qty)} ₽</div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 py-3" style={{ borderTop: "1px solid var(--atlas-border)", borderBottom: "1px solid var(--atlas-border)" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--atlas-text-muted)" }}>Товары ({totals.itemsCount})</span>
                <span className="font-medium">{formatRub(totals.subtotal)} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--atlas-text-muted)" }}>Доставка</span>
                <span className="font-medium" style={{ color: "var(--atlas-success)" }}>Рассчитает менеджер</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="font-bold">Итого:</span>
              <span className="text-2xl font-bold" style={{ color: "var(--atlas-primary)" }}>{formatRub(totals.subtotal)} ₽</span>
            </div>
            {/* Promo code */}
            <div className="mb-3">
              <div className="flex gap-2">
                <input className="atlas-input" placeholder="Промокод" value={promo} onChange={(e) => setPromo(e.target.value)} style={{ height: 40 }} />
                <button className="atlas-btn atlas-btn-secondary atlas-btn-sm" onClick={() => setPromoApplied(promo === "PESOK2026")}>
                  Применить
                </button>
              </div>
              {promoApplied && <div className="text-xs mt-1.5" style={{ color: "var(--atlas-success)" }}>✓ Промокод применён: скидка 5%</div>}
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm mb-3" style={{ background: "color-mix(in srgb, var(--atlas-danger) 8%, transparent)", color: "var(--atlas-danger)" }}>{error}</div>
            )}
            <button className="atlas-btn atlas-btn-primary w-full atlas-btn-lg" onClick={submit} disabled={submitting}>
              {submitting ? "Оформляем..." : "Оформить заказ"}
            </button>
            <a href="/shop" className="atlas-btn atlas-btn-secondary w-full mt-2">
              <ArrowLeft size={16} /> Продолжить покупки
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium block mb-1">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="atlas-input" />
    </label>
  );
}

function PaymentOption({ icon, label, value, current, onSelect }: { icon: React.ReactNode; label: string; value: string; current: string; onSelect: (v: string) => void }) {
  return (
    <button
      className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors text-left"
      style={{
        border: `2px solid ${current === value ? "var(--atlas-primary)" : "var(--atlas-border)"}`,
        background: current === value ? "color-mix(in srgb, var(--atlas-primary) 5%, transparent)" : "transparent",
      }}
      onClick={() => onSelect(value)}
    >
      <span style={{ color: current === value ? "var(--atlas-primary)" : "var(--atlas-text-muted)" }}>{icon}</span>
      {label}
    </button>
  );
}

function StepBadge({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
        style={{
          background: done ? "var(--atlas-success)" : active ? "var(--atlas-primary)" : "var(--atlas-surface-2)",
          color: done || active ? "#fff" : "var(--atlas-text-muted)",
        }}
      >
        {done ? <Check size={16} /> : num}
      </div>
      <span className="hidden sm:inline font-medium" style={{ color: active ? "var(--atlas-text)" : "var(--atlas-text-muted)" }}>{label}</span>
    </div>
  );
}
