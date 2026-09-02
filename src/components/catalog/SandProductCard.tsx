"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Loader2, ShoppingCart, X } from "lucide-react";
import { productImageSrc } from "@/lib/product-image";

export interface SandProductData {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  price: number | null;
  isOnOrder: boolean;
  unit?: string | null;
  weightKg: number;
  imageUrl?: string | null;
  imageLocal?: string | null;
  attributes: { key: string; value: string }[];
}

const fmt = (n: number) =>
  n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

export function SandProductCard({ product }: { product: SandProductData }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [formError, setFormError] = useState<string | null>(null);

  const packLabel =
    product.weightKg >= 500
      ? "биг-бэг 1 т"
      : product.weightKg >= 25
        ? "мешок 30 кг"
        : product.unit ?? "ед.";

  async function submitOrder() {
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError("Укажите имя и телефон");
      return;
    }
    setSending(true);
    setFormError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          source: "form",
          message: `Заказ с раздела «Песок и щебень»: ${product.name} (${packLabel})`,
        }),
      });
      if (!res.ok) throw new Error("Ошибка отправки");
      setOrderSent(true);
    } catch {
      setFormError("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {productImageSrc(product.imageLocal, product.imageUrl) ? (
            <Image
              src={productImageSrc(product.imageLocal, product.imageUrl)!}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 300px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl font-bold text-primary/30">
              {product.categoryName.slice(0, 1)}
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
            {packLabel}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.categoryName}
          </p>
          <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">
            {product.name}
          </h3>
          {product.attributes.length > 0 && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {product.attributes
                .slice(0, 3)
                .map((a) => `${a.key}: ${a.value}`)
                .join(" · ")}
            </p>
          )}
          <div className="mt-auto flex items-end justify-between gap-2 pt-4">
            <div>
              {product.isOnOrder || product.price == null ? (
                <span className="text-sm font-semibold text-amber-600">
                  Под заказ 1-3 дня
                </span>
              ) : (
                <>
                  <p className="text-xl font-bold">
                    {fmt(product.price)} ₽
                  </p>
                  <p className="text-xs text-muted-foreground">за {packLabel}</p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ShoppingCart className="h-4 w-4" />
              Заказать
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setModalOpen(false);
            setOrderSent(false);
            setForm({ name: "", phone: "" });
            setFormError(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {orderSent ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
                <h3 className="text-lg font-bold">Заявка отправлена!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Менеджер свяжется с вами в ближайшее время.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setOrderSent(false);
                    setForm({ name: "", phone: "" });
                  }}
                  className="mt-5 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Отлично
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">Заказ товара</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.name} — {packLabel}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ваше имя"
                  className="mb-3 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+7 (___) ___-__-__"
                  type="tel"
                  className="mb-3 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
                {formError && (
                  <p className="mb-3 text-sm text-destructive">{formError}</p>
                )}
                <button
                  type="button"
                  onClick={submitOrder}
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Отправить заявку
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
