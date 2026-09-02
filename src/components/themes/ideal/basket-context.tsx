"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface BasketItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number | null;
  unit: string;
  quantity: number;
  weightKg?: number;
}

interface IdealBasketContextValue {
  items: BasketItem[];
  addItem: (item: Omit<BasketItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearBasket: () => void;
  count: number;
  totalPrice: number;
  totalWeightTons: number;
}

const IdealBasketContext = createContext<IdealBasketContextValue | null>(null);

export function IdealBasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ideal_basket");
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const save = (next: BasketItem[]) => {
    setItems(next);
    try {
      localStorage.setItem("ideal_basket", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const addItem = (item: Omit<BasketItem, "quantity">, qty = 1) => {
    const existing = items.find((x) => x.id === item.id);
    if (existing) {
      save(items.map((x) => (x.id === item.id ? { ...x, quantity: x.quantity + qty } : x)));
    } else {
      save([...items, { ...item, quantity: qty }]);
    }
  };

  const removeItem = (id: string) => {
    save(items.filter((x) => x.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) removeItem(id);
    else save(items.map((x) => (x.id === id ? { ...x, quantity: qty } : x)));
  };

  const clearBasket = () => {
    save([]);
  };

  const count = items.reduce((acc, x) => acc + x.quantity, 0);
  const totalPrice = items.reduce((acc, x) => acc + (x.price ?? 0) * x.quantity, 0);
  const totalWeightTons = items.reduce((acc, x) => acc + ((x.weightKg ?? 0) * x.quantity) / 1000, 0);

  return (
    <IdealBasketContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearBasket,
        count,
        totalPrice,
        totalWeightTons,
      }}
    >
      {children}
    </IdealBasketContext.Provider>
  );
}

export function useIdealBasket() {
  const ctx = useContext(IdealBasketContext);
  if (!ctx) throw new Error("useIdealBasket must be used inside IdealBasketProvider");
  return ctx;
}
