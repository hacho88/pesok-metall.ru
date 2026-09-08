'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, Heart, HeartOff, ShoppingCart } from 'lucide-react'
import { useCart } from '@/components/pm-theme/cart-context'
import { useFavorites } from '@/components/pm-theme/favorites-context'

export function FavoritesView() {
  const { items, hydrated, remove, clear } = useFavorites()
  const { addItem } = useCart()
  const [added, setAdded] = useState<Record<string, boolean>>({})

  const buy = (id: string, title: string, price: number, unit: string) => {
    addItem({ id, title, price, unit })
    setAdded((a) => ({ ...a, [id]: true }))
    setTimeout(() => setAdded((a) => ({ ...a, [id]: false })), 1500)
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-secondary">
          <Heart className="size-7 text-muted-foreground/50" />
        </span>
        <h1 className="text-2xl font-bold text-slate-900">В избранном пока пусто</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Нажимайте на сердечко на карточках товаров — они сохранятся здесь, чтобы вернуться к ним позже.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex h-11 items-center rounded-2xl bg-primary px-6 text-[15px] font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
        >
          Перейти в каталог
        </Link>
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Избранное</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'товар' : items.length < 5 ? 'товара' : 'товаров'} — добавляйте в корзину прямо отсюда.
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-rose-300 hover:text-rose-500"
        >
          <HeartOff className="size-4" />
          Очистить всё
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => {
          const isAdded = added[p.id]
          return (
            <div
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm shadow-slate-200/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70"
            >
              <Link href={`/metall/${p.slug}`} className="relative block aspect-square overflow-hidden bg-secondary">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100 text-3xl font-black text-stone-300">
                    {p.title.slice(0, 1)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    remove(p.id)
                  }}
                  aria-label="Убрать из избранного"
                  title="Убрать из избранного"
                  className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all hover:scale-110 active:scale-90"
                >
                  <Heart className="size-4 text-rose-500" fill="currentColor" />
                </button>
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <Link
                  href={`/metall/${p.slug}`}
                  className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors hover:text-primary"
                >
                  {p.title}
                </Link>
                {p.subcategory && <p className="mt-1 text-xs text-muted-foreground">{p.subcategory}</p>}

                <div className="mt-auto flex flex-col gap-2.5 pt-3">
                  {p.price ? (
                    <span className="text-base font-bold text-slate-900">
                      {p.price.toLocaleString('ru-RU')} ₽
                      <span className="ml-1 text-xs font-medium text-muted-foreground">/{p.unit}</span>
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">Цена по запросу</span>
                  )}
                  {p.price && (
                    <button
                      type="button"
                      onClick={() => buy(p.id, p.title, p.price!, p.unit)}
                      className={
                        isAdded
                          ? 'flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-white transition-colors'
                          : 'flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95'
                      }
                    >
                      {isAdded ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
                      {isAdded ? 'Добавлено' : 'В корзину'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
