"use client";

/**
 * city-met — контекст корзины (basket).
 * Позиции добавляются из таблицы-спредшита с полным payload:
 * единица измерения, пересчитанный вес в тоннах, цена строки.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { CityMetUnit } from "./catalog-data";
import { CITY_MET_UNIT_LABEL } from "./catalog-data";

/** Позиция корзины city-met */
export interface CityMetBasketItem {
  rowId: string;
  name: string;
  gost: string;
  kind: "metal" | "bulk";
  unit: CityMetUnit;
  unitLabel: string;
  quantity: number;
  weightTons: number;
  pricePerUnit: number | null;
  lineTotal: number | null;
}

interface CityMetBasketContextValue {
  items: CityMetBasketItem[];
  count: number;
  totalWeightTons: number;
  totalPrice: number | null;
  addItem: (item: Omit<CityMetBasketItem, "unitLabel">) => void;
  removeItem: (rowId: string) => void;
  clear: () => void;
}

const CityMetBasketContext = createContext<CityMetBasketContextValue | null>(null);

export function CityMetBasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CityMetBasketItem[]>([]);

  const addItem = useCallback((item: Omit<CityMetBasketItem, "unitLabel">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.rowId === item.rowId && i.unit === item.unit);
      if (existing) {
        return prev.map((i) =>
          i.rowId === item.rowId && i.unit === item.unit
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                weightTons: i.weightTons + item.weightTons,
                lineTotal:
                  i.lineTotal != null && item.lineTotal != null
                    ? i.lineTotal + item.lineTotal
                    : null,
              }
            : i
        );
      }
      return [...prev, { ...item, unitLabel: CITY_MET_UNIT_LABEL[item.unit] }];
    });
  }, []);

  const removeItem = useCallback((rowId: string) => {
    setItems((prev) => prev.filter((i) => i.rowId !== rowId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CityMetBasketContextValue>(() => {
    const totalWeightTons = items.reduce((s, i) => s + i.weightTons, 0);
    const totalPrice = items.reduce<number | null>((s, i) => {
      if (s === null || i.lineTotal === null) return null;
      return s + i.lineTotal;
    }, 0);
    return {
      items,
      count: items.length,
      totalWeightTons,
      totalPrice,
      addItem,
      removeItem,
      clear,
    };
  }, [items, addItem, removeItem, clear]);

  return <CityMetBasketContext.Provider value={value}>{children}</CityMetBasketContext.Provider>;
}

export function useCityMetBasket(): CityMetBasketContextValue {
  const ctx = useContext(CityMetBasketContext);
  if (!ctx) throw new Error("useCityMetBasket must be used within CityMetBasketProvider");
  return ctx;
}
