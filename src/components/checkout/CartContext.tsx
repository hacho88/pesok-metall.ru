"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Scale } from "lucide-react";
import FastCheckout, { type CheckoutVariant } from "./FastCheckout";
import type { CheckoutCartItem } from "@/types/checkout";
import type { ProductCardData } from "@/components/blocks/ProductGridCards";

/** Нормализация единицы измерения классической витрины → SKU-единица */
function normalizeUnit(unit: string): string {
  const u = unit.toLowerCase();
  if (u.includes("метр")) return "м";
  if (u.includes("тонн")) return "т";
  if (u.includes("мешок")) return "мешок";
  if (u.includes("лист")) return "лист";
  if (u.includes("биг")) return "биг-бэг";
  return "ед.";
}

/** Преобразование товара классической витрины (ProductCardData) в позицию корзины */
export function productCardToCartItem(p: ProductCardData): CheckoutCartItem {
  const gostAttr = p.attributes?.find((a) => /гост|gost/i.test(a.key));
  const weightKg = p.weightKg ?? 0;
  return {
    productId: p.id,
    sku: p.id,
    name: p.name,
    gost: gostAttr?.value ?? null,
    unit: normalizeUnit(p.unit),
    quantity: 1,
    weightKg,
    weightTons: Math.round((weightKg / 1000) * 1000) / 1000,
    pricePerUnit: p.price,
    lineTotal: p.price,
  };
}

/** Контекст корзины: единый источник для классической витрины и STRIKER.Engine */
interface CartContextValue {
  items: CheckoutCartItem[];
  addItem: (item: CheckoutCartItem) => void;
  removeItem: (sku: string) => void;
  clearCart: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  totalWeight: number;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  variant = "vi",
  showFloatingButton = true,
}: {
  children: ReactNode;
  variant?: CheckoutVariant;
  showFloatingButton?: boolean;
}) {
  const [items, setItems] = useState<CheckoutCartItem[]>([]);
  const [open, setOpen] = useState(false);

  const addItem = useCallback((item: CheckoutCartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.sku === item.sku);
      if (existing) {
        return prev.map((i) =>
          i.sku === item.sku
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                weightTons: Math.round((i.weightTons + item.weightTons) * 1000) / 1000,
                lineTotal:
                  i.lineTotal != null && item.lineTotal != null
                    ? i.lineTotal + item.lineTotal
                    : null,
              }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((sku: string) => {
    setItems((prev) => prev.filter((i) => i.sku !== sku));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalWeight = useMemo(
    () => items.reduce((sum, i) => sum + i.weightTons, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, removeItem, clearCart, open, setOpen, totalWeight }),
    [items, addItem, removeItem, clearCart, open, totalWeight]
  );

  return (
    <CartContext.Provider value={value}>
      {children}

      {/* Плавающая кнопка корзины — опциональна (шапка уже содержит кнопку корзины) */}
      {showFloatingButton && (
        <div className="fixed bottom-5 right-5 z-[60]">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2.5 rounded-full bg-primary px-5 py-3 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
            aria-label="Открыть корзину"
          >
            <Package className="h-4 w-4" />
            <span>Корзина</span>
            <span className="rounded-full bg-background/20 px-2 py-0.5 text-[10px] font-black">
              {items.length} поз.
            </span>
            {items.length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-background/20 px-2 py-0.5 text-[10px] font-black">
                <Scale className="h-3 w-3" />
                {totalWeight.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} т
              </span>
            )}
          </button>
        </div>
      )}

      {/* Модальное окно FastCheckout */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="w-full max-w-lg"
            >
              <FastCheckout
                variant={variant}
                cartItems={items}
                onRemoveItem={removeItem}
                onClose={() => setOpen(false)}
                onSuccess={clearCart}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      clearCart: () => {},
      open: false,
      setOpen: () => {},
      totalWeight: 0,
    };
  }
  return ctx;
}
