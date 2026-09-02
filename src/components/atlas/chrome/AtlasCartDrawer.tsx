"use client";

import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight, Truck } from "lucide-react";
import { useCartStore } from "../checkout/cart-store";
import { formatRub } from "@/lib/atlas/pricing";

export function AtlasCartDrawer() {
  const store = useCartStore();
  const totals = store.totals();

  if (!store.isOpen) return null;

  const freeDeliveryThreshold = 50000;
  const remainingForFree = Math.max(0, freeDeliveryThreshold - totals.subtotal);
  const progressPercent = Math.min(100, (totals.subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end atlas-overlay-enter" style={{ background: "rgba(0,0,0,0.5)" }} onClick={store.close}>
      <div
        className="w-full max-w-[420px] h-full overflow-y-auto atlas-scroll atlas-drawer-enter"
        style={{ background: "var(--atlas-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 z-10" style={{ borderColor: "var(--atlas-border)", background: "var(--atlas-surface)" }}>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <ShoppingBag size={20} style={{ color: "var(--atlas-primary)" }} />
            Корзина {totals.itemsCount > 0 && `(${totals.itemsCount})`}
          </h3>
          <button onClick={store.close} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--atlas-surface-2)] transition-colors">
            <X size={20} />
          </button>
        </div>

        {store.items.length === 0 ? (
          /* Empty state */
          <div className="atlas-empty-state">
            <div className="atlas-empty-state-icon">
              <ShoppingBag size={36} style={{ color: "var(--atlas-text-muted)" }} />
            </div>
            <p className="text-lg font-bold mb-2">Корзина пуста</p>
            <p className="text-sm mb-4" style={{ color: "var(--atlas-text-muted)" }}>
              Добавьте товары из каталога, чтобы оформить заказ
            </p>
            <a href="/shop" className="atlas-btn atlas-btn-primary" onClick={store.close}>
              Перейти в каталог
            </a>
          </div>
        ) : (
          <>
            {/* Free delivery progress */}
            {remainingForFree > 0 ? (
              <div className="px-4 py-3 border-b" style={{ borderColor: "var(--atlas-border)", background: "color-mix(in srgb, var(--atlas-primary) 4%, transparent)" }}>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Truck size={16} style={{ color: "var(--atlas-primary)" }} />
                  <span>До бесплатной доставки: <b>{formatRub(remainingForFree)} ₽</b></span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--atlas-surface-2)" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, background: "var(--atlas-primary)" }} />
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 border-b flex items-center gap-2 text-sm" style={{ borderColor: "var(--atlas-border)", background: "color-mix(in srgb, var(--atlas-success) 8%, transparent)", color: "var(--atlas-success)" }}>
                <Truck size={16} />
                <span className="font-medium">Бесплатная доставка включена!</span>
              </div>
            )}

            {/* Items */}
            <div className="p-4 space-y-3">
              {store.items.map((item) => (
                <div key={item.productId} className="flex gap-3 p-3 rounded-lg transition-colors hover:bg-[var(--atlas-surface-2)]" style={{ border: "1px solid var(--atlas-border)" }}>
                  <div className="w-16 h-16 shrink-0 atlas-photo-canvas flex items-center justify-center">
                    {item.imageLocal ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageLocal} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <ShoppingBag size={20} style={{ color: "var(--atlas-text-muted)" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={`/product/${item.slug}`} className="text-sm font-medium line-clamp-2 hover:text-[var(--atlas-primary)] transition-colors">
                      {item.name}
                    </a>
                    <div className="text-xs mt-0.5" style={{ color: "var(--atlas-text-muted)" }}>
                      {formatRub(item.price)} ₽{item.unit ? `/${item.unit}` : ""}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="atlas-qty">
                        <button className="atlas-qty-btn" onClick={() => store.updateQty(item.productId, item.qty - 1)}>
                          <Minus size={14} />
                        </button>
                        <span className="atlas-qty-val">{item.qty}</span>
                        <button className="atlas-qty-btn" onClick={() => store.updateQty(item.productId, item.qty + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-bold text-sm ml-auto atlas-price-main">
                        {formatRub(item.price * item.qty)} ₽
                      </span>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                        style={{ color: "var(--atlas-danger)" }}
                        onClick={() => store.remove(item.productId)}
                        title="Удалить"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t sticky bottom-0" style={{ borderColor: "var(--atlas-border)", background: "var(--atlas-surface)" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm" style={{ color: "var(--atlas-text-muted)" }}>Итого ({totals.itemsCount})</div>
                  <div className="text-2xl font-bold atlas-price-main">{formatRub(totals.subtotal)} ₽</div>
                </div>
              </div>
              <a href="/checkout" className="atlas-btn atlas-btn-primary w-full atlas-btn-lg" onClick={store.close}>
                Оформить заказ <ArrowRight size={18} />
              </a>
              <button
                className="atlas-btn atlas-btn-secondary w-full mt-2"
                onClick={store.close}
              >
                Продолжить покупки
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
