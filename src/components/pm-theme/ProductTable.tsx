'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Check, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/components/pm-theme/cart-context'
import { Button } from '@/components/pm-theme/ui/Button'
import type { Category, Product } from '@/lib/pm-catalog'
import { cn } from '@/lib/pm-utils'

type UnitMode = 'm' | 't'

/** Цена по выбранной единице: для проката с двумя ценами — селект м/т */
function priceInfo(p: Product, mode: UnitMode) {
  if (p.pricePerMeter > 0 && p.pricePerTon > 0) {
    return mode === 'm'
      ? { value: p.pricePerMeter, unit: 'м', alt: p.pricePerTon, altUnit: 'т' }
      : { value: p.pricePerTon, unit: 'т', alt: p.pricePerMeter, altUnit: 'м' }
  }
  if (p.pricePerMeter > 0) return { value: p.pricePerMeter, unit: 'м', alt: 0, altUnit: '' }
  if (p.pricePerTon > 0) return { value: p.pricePerTon, unit: 'т', alt: 0, altUnit: '' }
  if (p.pricePerUnit > 0) {
    const u = p.unit === 'шт' ? 'шт' : p.unit === 'лист' ? 'лист' : p.unit === 'кг' ? 'кг' : p.unit === 'уп' ? 'уп' : p.unit
    return { value: p.pricePerUnit, unit: u, alt: 0, altUnit: '' }
  }
  return { value: 0, unit: 'шт', alt: 0, altUnit: '' }
}

export function ProductTable({ category }: { category: Category }) {
  const { addItem } = useCart()
  const [activeSub, setActiveSub] = useState<string>('all')
  const [qty, setQty] = useState<Record<string, number>>({})
  const [unitMode, setUnitMode] = useState<Record<string, UnitMode>>({})
  const [added, setAdded] = useState<string | null>(null)

  const allProducts = useMemo(() => category.products, [category])

  const products = useMemo(() => {
    if (activeSub === 'all') return allProducts
    return allProducts.filter((p) =>
      p.subcategory ? p.subcategory === activeSub : true
    )
  }, [allProducts, activeSub])

  const getQty = (id: string) => qty[id] ?? 1
  // В режиме «за тонну» — десятичный шаг 0,1 т (как на city-met: «12 метров или 2,5 тонны»)
  const setProductQty = (id: string, next: number, mode: UnitMode) =>
    setQty((prev) => ({
      ...prev,
      [id]: mode === 't' ? Math.max(0.1, Math.round(next * 10) / 10) : Math.max(1, Math.round(next)),
    }))

  const getUnitMode = (p: Product, id: string): UnitMode =>
    unitMode[id] ?? (p.pricePerMeter > 0 ? 'm' : 't')
  const setProductUnit = (id: string, mode: UnitMode) =>
    setUnitMode((prev) => ({ ...prev, [id]: mode }))

  const handleAdd = (p: Product) => {
    const id = `${category.slug}:${p.id}`
    const info = priceInfo(p, getUnitMode(p, id))
    addItem(
      { id, title: p.title, price: info.value, unit: info.unit },
      getQty(id),
    )
    setAdded(id)
    setTimeout(() => setAdded((cur) => (cur === id ? null : cur)), 1500)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Фильтр подкатегорий */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveSub('all')}
          className={cn(
            'rounded-2xl px-4 py-2 text-sm font-medium transition-colors',
            activeSub === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
              : 'bg-secondary text-foreground hover:bg-accent hover:text-primary',
          )}
        >
          Все ({allProducts.length})
        </button>
        {category.subcategories.map((sub) => {
          const count = allProducts.filter((p) => p.subcategory === sub).length
          if (count === 0) return null
          return (
            <button
              key={sub}
              type="button"
              onClick={() => setActiveSub(sub)}
              className={cn(
                'rounded-2xl px-4 py-2 text-sm font-medium transition-colors',
                activeSub === sub
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                  : 'bg-secondary text-foreground hover:bg-accent hover:text-primary',
              )}
            >
              {sub} ({count})
            </button>
          )
        })}
      </div>

      {/* Счётчик */}
      <p className="text-sm text-muted-foreground">
        Показано {products.length} {products.length === 1 ? 'товар' : products.length < 5 ? 'товара' : 'товаров'}
      </p>

      {/* Таблица товаров с фото */}
      <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm shadow-slate-200/50">
        <div className="hidden items-center gap-4 border-b border-border/70 bg-secondary/60 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:grid lg:grid-cols-[96px_2fr_0.7fr_0.9fr_1.3fr_auto]">
          <span></span>
          <span>Наименование</span>
          <span>Длина</span>
          <span>Вес</span>
          <span>Цена</span>
          <span className="text-right">В корзину</span>
        </div>

        <ul className="divide-y divide-border/70">
          {products.map((p) => {
            const id = `${category.slug}:${p.id}`
            const hasBoth = p.pricePerMeter > 0 && p.pricePerTon > 0
            const mode = getUnitMode(p, id)
            const info = priceInfo(p, mode)
            const isAdded = added === id
            const imgSrc = p.imageLocal || p.imageUrl
            return (
              <li
                key={p.id}
                className="grid grid-cols-1 gap-3 px-5 py-4 lg:grid-cols-[96px_2fr_0.7fr_0.9fr_1.3fr_auto] lg:items-center lg:gap-4"
              >
                {/* Фото товара */}
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-secondary lg:size-20">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={p.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                      нет фото
                    </div>
                  )}
                </div>

                {/* Название */}
                <div className="min-w-0">
                  <span className="font-medium text-slate-900 text-pretty">{p.title}</span>
                  {p.gost && (
                    <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">{p.gost}</span>
                  )}
                </div>

                {/* Длина */}
                <span className="text-sm text-muted-foreground">
                  <span className="lg:hidden">Длина: </span>
                  {p.length}
                </span>

                {/* Вес */}
                <span className="text-sm text-muted-foreground">
                  <span className="lg:hidden">Вес: </span>
                  {p.weight}
                </span>

                {/* Цена: селект м/т для проката с двумя ценами (как на city-met) */}
                <div className="min-w-0">
                  {info.value > 0 ? (
                    <>
                      {hasBoth && (
                        <div className="mb-1.5 inline-flex rounded-lg bg-secondary p-0.5">
                          <button
                            type="button"
                            onClick={() => setProductUnit(id, 'm')}
                            className={cn(
                              'rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors',
                              mode === 'm'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-primary',
                            )}
                          >
                            за метр
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductUnit(id, 't')}
                            className={cn(
                              'rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors',
                              mode === 't'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-primary'
                            )}
                          >
                            за тонну
                          </button>
                        </div>
                      )}
                      <span className="font-semibold text-slate-900">
                        {info.value.toLocaleString('ru-RU')}{' '}
                        <span className="text-xs font-normal text-muted-foreground">₽/{info.unit}</span>
                      </span>
                      {info.alt > 0 && (
                        <span className="block text-xs font-medium text-muted-foreground">
                          ≈ {info.alt.toLocaleString('ru-RU')} ₽/{info.altUnit}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm font-normal text-muted-foreground">по запросу</span>
                  )}
                </div>

                {/* Количество + корзина */}
                <div className="flex items-center justify-between gap-2 lg:justify-end">
                  <div className="inline-flex items-center rounded-2xl bg-secondary p-1">
                    <button
                      type="button"
                      aria-label="Уменьшить количество"
                      onClick={() => setProductQty(id, getQty(id) - (mode === 't' ? 0.1 : 1), mode)}
                      className="flex size-8 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-card"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold tabular-nums">
                      {mode === 't'
                        ? getQty(id).toLocaleString('ru-RU', { maximumFractionDigits: 1 })
                        : getQty(id)}
                    </span>
                    <button
                      type="button"
                      aria-label="Увеличить количество"
                      onClick={() => setProductQty(id, getQty(id) + (mode === 't' ? 0.1 : 1), mode)}
                      className="flex size-8 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-card"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <Button
                    onClick={() => handleAdd(p)}
                    size="lg"
                    className="h-10 gap-1.5 rounded-2xl px-4"
                  >
                    {isAdded ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
                    <span className="hidden sm:inline">{isAdded ? 'Добавлено' : 'В корзину'}</span>
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
