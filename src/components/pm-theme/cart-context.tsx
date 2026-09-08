'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  id: string
  title: string
  price: number
  unit: string
  qty: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  total: number
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  updateQty: (id: string, qty: number) => void
  removeItem: (id: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'pm-cart-v1'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i: any) => i && typeof i.id === 'string' && typeof i.title === 'string' && typeof i.price === 'number' && typeof i.qty === 'number'
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Гидратация из localStorage — корзина переживает переходы между страницами
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(loadCart())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // переполнение localStorage — игнорируем
    }
  }, [items, hydrated])

  const addItem = (item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { ...item, qty }]
    })
  }

  const updateQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0),
    )
  }

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))
  const clear = () => setItems([])

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0)
    const total = items.reduce((s, i) => s + i.qty * i.price, 0)
    return { items, count, total, addItem, updateQty, removeItem, clear }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
