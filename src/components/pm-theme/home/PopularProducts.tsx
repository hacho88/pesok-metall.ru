'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Check, Heart, Plus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/components/pm-theme/cart-context'
import { useFavorites } from '@/components/pm-theme/favorites-context'
import type { Product } from '@/lib/pm-catalog'

export function PopularProducts({ products }: { products: Product[] }) {
  const { addItem } = useCart()
  const { has, toggle } = useFavorites()
  const [added, setAdded] = useState<Record<string, boolean>>({})

  const add = (p: Product) => {
    const price = p.pricePerUnit || p.pricePerMeter || p.pricePerTon
    if (!price) return
    addItem({ id: p.id, title: p.title, price, unit: p.unit })
    setAdded((a) => ({ ...a, [p.id]: true }))
    setTimeout(() => setAdded((a) => ({ ...a, [p.id]: false })), 1500)
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Популярные товары</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Хиты продаж с актуальными ценами — добавляйте в корзину прямо отсюда.
          </p>
        </div>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4">
        {products.map((p) => {
          const price = p.pricePerUnit || p.pricePerMeter || p.pricePerTon
          const imgSrc = p.imageLocal || p.imageUrl
          const isAdded = added[p.id]
          const isFav = has(p.id)
          return (
            <div
              key={p.id}
              className="group flex min-w-[75%] flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm shadow-slate-200/50 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70 sm:min-w-[45%] md:min-w-0"
            >
              <Link href={`/metall/${p.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-secondary">
                {imgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc}
                    alt={p.title}
                    className="size-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-3xl font-black text-muted-foreground/20">
                    {p.title.slice(0, 1)}
                  </span>
                )}
                {p.inStock && (
                  <span className="absolute left-3 top-3 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    В наличии
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    toggle({
                      id: p.id,
                      title: p.title,
                      price: price ?? null,
                      unit: p.unit,
                      slug: p.slug,
                      image: imgSrc,
                      subcategory: p.subcategory,
                    })
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
                <p className="mt-1 text-xs text-muted-foreground">{p.subcategory}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(() => {
                    const dia = p.attributes.find((a) => /диаметр|diameter/i.test(a.key))?.value
                    const gost = p.attributes.find((a) => /гост|gost/i.test(a.key))?.value
                    const steel = p.attributes.find((a) => /марка|сталь|класс прочности/i.test(a.key))?.value
                    return (
                      <>
                        {dia && (
                          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                            ⌀ {dia}
                          </span>
                        )}
                        {steel && (
                          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                            {steel}
                          </span>
                        )}
                        {gost && (
                          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            ГОСТ {gost}
                          </span>
                        )}
                      </>
                    )
                  })()}
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                  {price ? (
                    <span className="text-base font-bold text-slate-900">
                      {price.toLocaleString('ru-RU')} ₽
                      <span className="ml-1 text-xs font-medium text-muted-foreground">/{p.unit}</span>
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">Под заказ</span>
                  )}
                  {price && (
                    <button
                      type="button"
                      onClick={() => add(p)}
                      className={
                        isAdded
                          ? 'flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-white transition-colors'
                          : 'flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95'
                      }
                      aria-label="Добавить в корзину"
                    >
                      {isAdded ? <Check className="size-4" /> : <Plus className="size-4" />}
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
