"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/atlas/cart";
import { calcCartTotals, addToCart as addCart, updateCartQty as updateQty, removeFromCart as removeCart } from "@/lib/atlas/cart";
import type { AtlasProduct } from "@/lib/atlas/catalog";
import { useToastStore } from "../chrome/AtlasToaster";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (product: AtlasProduct, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  totals: () => ReturnType<typeof calcCartTotals>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      add: (product, qty = 1) => {
        set((s) => ({ items: addCart(s.items, product, qty), isOpen: true }));
        useToastStore.getState().show(`«${product.name.slice(0, 30)}${product.name.length > 30 ? "…" : ""}» добавлен в корзину`);
      },
      updateQty: (productId, qty) =>
        set((s) => ({ items: updateQty(s.items, productId, qty) })),
      remove: (productId) =>
        set((s) => ({ items: removeCart(s.items, productId) })),
      clear: () => set({ items: [] }),
      totals: () => calcCartTotals(get().items),
    }),
    {
      name: "atlas-cart",
      partialize: (s) => ({ items: s.items }),
    }
  )
);
