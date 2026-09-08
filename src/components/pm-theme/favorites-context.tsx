'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type FavoriteItem = {
  id: string
  title: string
  price: number | null
  unit: string
  slug: string
  image: string | null
  subcategory: string | null
}

type FavoritesContextValue = {
  items: FavoriteItem[]
  count: number
  hydrated: boolean
  has: (id: string) => boolean
  toggle: (item: Omit<FavoriteItem, never>) => void
  remove: (id: string) => void
  clear: () => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

const STORAGE_KEY = 'pm-favorites-v1'

function loadFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i: any) => i && typeof i.id === 'string' && typeof i.title === 'string' && typeof i.slug === 'string'
    )
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(loadFavorites())
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

  const has = (id: string) => items.some((i) => i.id === id)

  const toggle = (item: FavoriteItem) => {
    setItems((prev) =>
      prev.some((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [...prev, item]
    )
  }

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))
  const clear = () => setItems([])

  const value = useMemo<FavoritesContextValue>(
    () => ({ items, count: items.length, hydrated, has, toggle, remove, clear }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, hydrated]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
