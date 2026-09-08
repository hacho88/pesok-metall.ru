'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Loader2, Package, Search, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/pm-utils'

interface Suggestion {
  id: string
  name: string
  slug: string
  price: number | null
  unit: string
  imageLocal: string | null
  category: string
  attributes: { key: string; value: string }[]
}

const QUICK_QUERIES = ['Арматура', 'Труба профильная', 'Лист', 'Сетка', 'Песок', 'Щебень']

/** Достаёт из атрибутов диаметр, марку стали и ГОСТ */
function pickBadges(attrs: { key: string; value: string }[]) {
  const dia = attrs.find((a) => /диаметр|diameter/i.test(a.key))?.value
  const gost = attrs.find((a) => /гост|gost/i.test(a.key))?.value
  const steel = attrs.find((a) => /марка|сталь|класс прочности/i.test(a.key))?.value
  return { dia, gost, steel }
}

export function LiveSearch({
  variant = 'hero',
  placeholder = 'Поиск: арматура 12 мм, труба 40х20, ГОСТ 34028...',
}: {
  variant?: 'hero' | 'header'
  placeholder?: string
}) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&limit=6`)
        const data = await res.json()
        setItems(data.products ?? [])
        setOpen(true)
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const showDropdown = open && query.trim().length >= 2
  const isHero = variant === 'hero'

  return (
    <div ref={boxRef} className={cn('relative', isHero ? 'w-full max-w-xl' : 'w-full')}>
      <form action="/catalog" className="relative">
        <Search
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-muted-foreground',
            isHero ? 'left-4 size-4.5' : 'left-3.5 size-4',
          )}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          name="q"
          placeholder={placeholder}
          className={cn(
            'w-full rounded-2xl text-sm font-medium outline-none transition-all',
            isHero
              ? 'h-13 border border-border/70 bg-card py-3.5 pl-11 pr-12 shadow-sm shadow-slate-200/50 placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/10'
              : 'h-12 border border-transparent bg-secondary pl-10 pr-10 shadow-sm shadow-slate-200/50 placeholder:text-muted-foreground focus:border-primary/40 focus:bg-card',
          )}
        />
        {loading && (
          <Loader2
            className={cn(
              'absolute top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground',
              isHero ? 'right-4' : 'right-3',
            )}
          />
        )}
      </form>

      {/* Быстрые запросы — только в hero-варианте */}
      {isHero && !showDropdown && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <TrendingUp className="size-3.5 text-muted-foreground" />
          {QUICK_QUERIES.map((q) => (
            <Link
              key={q}
              href={`/catalog?q=${encodeURIComponent(q)}`}
              className="rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              {q}
            </Link>
          ))}
        </div>
      )}

      {/* Живые подсказки */}
      {showDropdown && (
        <div
          className={cn(
            'absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl shadow-slate-300/40',
          )}
        >
          {items.length === 0 && !loading ? (
            <p className="px-4 py-5 text-center text-sm text-muted-foreground">
              Ничего не найдено — уточните запрос
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-1.5">
              {items.map((p) => {
                const { dia, gost, steel } = pickBadges(p.attributes)
                return (
                  <li key={p.id}>
                    <Link
                      href={`/metall/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-accent"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-secondary">
                        {p.imageLocal ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageLocal} alt="" className="size-full object-contain p-0.5" />
                        ) : (
                          <Package className="size-4 text-muted-foreground/50" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">{p.name}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1">
                          <span className="text-[11px] text-muted-foreground">{p.category}</span>
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
                        </span>
                      </span>
                      {p.price != null && (
                        <span className="shrink-0 text-sm font-bold text-primary">
                          {p.price.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          <Link
            href={`/catalog?q=${encodeURIComponent(query.trim())}`}
            onClick={() => setOpen(false)}
            className="block border-t border-border/70 bg-secondary/50 px-4 py-2.5 text-center text-xs font-bold text-primary transition-colors hover:bg-accent"
          >
            Все результаты по «{query.trim()}» →
          </Link>
        </div>
      )}
    </div>
  )
}

/** Псевдоним для совместимости */
export const HeroSearch = LiveSearch

