"use client";

import { X, ShoppingBag, Trash2, Minus, Plus } from "lucide-react";
import { useCartStore } from "../checkout/cart-store";
import { formatRub } from "@/lib/atlas/pricing";

export function AtlasCartDrawer() {
  const store = useCartStore();
  const totals = store.totals();

  if (!store.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.4)" }} onClick={store.close}>
      <div
        className="w-full max-w-[420px] h-full overflow-y-auto atlas-scroll"
        style={{ background: "var(--atlas-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 z-10" style={{ borderColor: "var(--atlas-border)", background: "var(--atlas-surface)" }}>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <ShoppingBag size={20} style={{ color: "var(--atlas-primary)" }} />
            Корзина ({totals.itemsCount})
          </h3>
          <button onClick={store.close} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--atlas-surface-2)]">
            <X size={20} />
          </button>
        </div>

        {store.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <ShoppingBag size={48} style={{ color: "var(--atlas-text-muted)", opacity: 0.3 }} />
            <p className="mt-4 text-sm" style={{ color: "var(--atlas-text-muted)" }}>
              Корзина пуста
            </p>
            <a href="/catalog" className="atlas-btn atlas-btn-primary mt-4" onClick={store.close}>
              Перейти в каталог
            </a>
          </div>
        ) : (
          <>
            <div className="p-4 space-y-3">
              {store.items.map((item) => (
                <div key={item.productId} className="flex gap-3 p-3 rounded-lg" style={{ border: "1px solid var(--atlas-border)" }}>
                  <div className="w-16 h-16 shrink-0 atlas-photo-canvas flex items-center justify-center">
                    {item.imageLocal ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageLocal} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <ShoppingBag size={20} style={{ color: "var(--atlas-text-muted)" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={`/product/${item.slug}`} className="text-sm font-medium line-clamp-2 hover:text-[var(--atlas-primary)]">
                      {item.name}
                    </a>
                    <div className="text-xs mt-0.5" style={{ color: "var(--atlas-text-muted)" }}>
                      {formatRub(item.price)} ₽{item.unit ? `/${item.unit}` : ""}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center" style={{ border: "1px solid var(--atlas-border)", borderRadius: "var(--atlas-radius-sm)" }}>
                        <button
                          className="w-8 h-8 flex items-center justify-center hover:bg-[var(--atlas-surface-2)]"
                          onClick={() => store.updateQty(item.productId, item.qty - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.qty}</span>
                        <button
                          className="w-8 h-8 flex items-center justify-center hover:bg-[var(--atlas-surface-2)]"
                          onClick={() => store.updateQty(item.productId, item.qty + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-bold text-sm ml-auto">
                        {formatRub(item.price * item.qty)} ₽
                      </span>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--atlas-surface-2)]"
                        style={{ color: "var(--atlas-danger)" }}
                        onClick={() => store.remove(item.productId)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t sticky bottom-0" style={{ borderColor: "var(--atlas-border)", background: "var(--atlas-surface)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ color: "var(--atlas-text-muted)" }}>Итого:</span>
                <span className="font-bold text-xl">{formatRub(totals.subtotal)} ₽</span>
              </div>
              <a href="/checkout" className="atlas-btn atlas-btn-primary w-full" onClick={store.close}>
                Оформить заказ
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
