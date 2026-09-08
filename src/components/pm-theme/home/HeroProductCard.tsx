'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, Heart, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/components/pm-theme/cart-context'
import { useFavorites } from '@/components/pm-theme/favorites-context'
import type { Product } from '@/lib/pm-catalog'

export function HeroProductCard({ product: p }: { product: Product }) {
  const { addItem } = useCart()
  const { has, toggle } = useFavorites()
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)
  const price = p.pricePerUnit || p.pricePerTon || p.pricePerMeter
  const imgSrc = p.imageLocal || p.imageUrl
  const isFav = has(p.id)

  const fav = () =>
    toggle({
      id: p.id,
      title: p.title,
      price: price ?? null,
      unit: p.unitLabel,
      slug: p.slug,
      image: imgSrc,
      subcategory: p.subcategory,
    })

  const buy = () => {
    if (!price) return
    addItem({ id: p.id, title: p.title, price, unit: p.unitLabel }, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70">
      <Link
        href={`/metall/${p.slug}`}
        className="relative block aspect-square overflow-hidden bg-secondary"
      >
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={p.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100 text-3xl font-black text-stone-300">
            {p.title.slice(0, 1)}
          </span>
        )}
        {p.inStock && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-emerald-600 shadow-sm backdrop-blur">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            В наличии
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            fav()
          }}
          aria-label={isFav ? 'Убрать из избранного' : 'В избранное'}
          title={isFav ? 'Убрать из избранного' : 'В избранное'}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all hover:scale-110 active:scale-90"
        >
          <Heart
            className={isFav ? 'size-4 text-rose-500' : 'size-4 text-slate-400 transition-colors hover:text-rose-500'}
            fill={isFav ? 'currentColor' : 'none'}
          />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/metall/${p.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors hover:text-primary"
        >
          {p.title}
        </Link>

        <div className="mt-auto flex flex-col gap-2.5 pt-3">
          {price ? (
            <span className="text-base font-bold text-slate-900">
              {price.toLocaleString('ru-RU')} ₽
              <span className="ml-1 text-xs font-medium text-muted-foreground">
                /{p.unitLabel}
              </span>
            </span>
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">Цена по запросу</span>
          )}
          {price ? (
            <div className="flex items-stretch gap-2">
              <div className="flex items-center rounded-xl border border-border bg-secondary/50">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-primary active:scale-90"
                  aria-label="Уменьшить"
                >
                  <Minus className="size-3.5" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={qty}
                  onChange={(e) => {
                    const n = parseInt(e.target.value.replace(/\D/g, '')) || 1
                    setQty(Math.max(1, n))
                  }}
                  className="h-9 w-10 border-x border-border bg-transparent text-center text-sm font-bold text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(9999, q + 1))}
                  className="flex h-9 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-primary active:scale-90"
                  aria-label="Увеличить"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={buy}
                className={
                  added
                    ? 'flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-sm font-semibold text-white transition-all'
                    : 'flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95'
                }
              >
                {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
                {added ? 'В корзине' : 'Купить'}
              </button>
            </div>
          ) : (
            <Link
              href={`/metall/${p.slug}`}
              className="flex h-9 w-full items-center justify-center rounded-xl border border-border text-sm font-semibold text-slate-900 transition-colors hover:border-primary hover:text-primary"
            >
              Запросить цену
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
