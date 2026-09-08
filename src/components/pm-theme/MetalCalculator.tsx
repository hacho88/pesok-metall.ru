'use client'

import { useMemo, useState } from 'react'
import { Calculator, Sparkles } from 'lucide-react'
import type { Category } from '@/lib/pm-catalog'
import { cn } from '@/lib/pm-utils'

// Products that have a per-meter weight (кг/м) and price per ton — good for the metal calculator
function getMetalProducts(catalog: Category[]) {
  return catalog
    .flatMap((c) => c.products.map((p) => ({ ...p, category: c.title })))
    .filter((p) => /кг\/м$/.test(p.weight) && p.pricePerTon > 0)
}

export function MetalCalculator({ catalog }: { catalog: Category[] }) {
  const metalProducts = useMemo(() => getMetalProducts(catalog), [catalog])
  const [selected, setSelected] = useState(metalProducts[0]?.title ?? '')
  const [meters, setMeters] = useState('100')

  const result = useMemo(() => {
    const p = metalProducts.find((x) => x.title === selected) ?? metalProducts[0]
    if (!p) return null
    const m = Math.max(0, Number.parseFloat(meters) || 0)
    const weightPerMeter = Number.parseFloat(p.weight.replace(',', '.')) || 0
    const totalKg = m * weightPerMeter
    const tons = totalKg / 1000
    const costByTon = Math.round(tons * p.pricePerTon)
    const costByMeter = p.pricePerMeter > 0 ? Math.round(m * p.pricePerMeter) : costByTon
    return { p, m, weightPerMeter, totalKg, tons, costByTon, costByMeter }
  }, [selected, meters, metalProducts])

  if (!result) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="size-3.5" />
            ИИ-калькулятор
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl text-balance">
            ИИ-калькулятор металла
          </h1>
        </header>
        <div className="rounded-3xl border border-border/70 bg-card p-12 text-center shadow-sm shadow-slate-200/50">
          <p className="text-muted-foreground">
            Нет товаров с ценой за тонну для расчёта. Добавьте товары с указанием веса (кг/м) и цены за тонну.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          <Sparkles className="size-3.5" />
          ИИ-калькулятор
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl text-balance">
          ИИ-калькулятор металла
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Перевод метров в тонны, подбор сечения и мгновенный расчёт стоимости партии.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-card p-6 shadow-sm shadow-slate-200/50">
          <div>
            <label htmlFor="product" className="text-sm font-semibold text-slate-900">
              Позиция
            </label>
            <select
              id="product"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="mt-2.5 h-12 w-full rounded-2xl border border-transparent bg-secondary px-4 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary/40 focus:bg-card"
            >
              {metalProducts.map((p) => (
                <option key={p.title} value={p.title}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="meters" className="text-sm font-semibold text-slate-900">
              Количество, метров
            </label>
            <input
              id="meters"
              type="number"
              min={0}
              step="1"
              value={meters}
              onChange={(e) => setMeters(e.target.value)}
              className="mt-2.5 h-12 w-full rounded-2xl border border-transparent bg-secondary px-4 text-lg font-semibold text-foreground outline-none transition-colors focus:border-primary/40 focus:bg-card"
            />
          </div>

          <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{result.p.category}</p>
            <p className="mt-1">
              Удельный вес: {result.weightPerMeter.toLocaleString('ru-RU')} кг/м · Цена:{' '}
              {result.p.pricePerTon.toLocaleString('ru-RU')} ₽/т
            </p>
          </div>
        </div>

        <aside className="flex h-fit flex-col gap-4 rounded-3xl border border-border/70 bg-card p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-2 text-primary">
            <Calculator className="size-5" />
            <h2 className="font-semibold text-slate-900">Результат расчёта</h2>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <Row label="Длина партии" value={`${result.m.toLocaleString('ru-RU')} м`} />
            <Row label="Общий вес" value={`${Math.round(result.totalKg).toLocaleString('ru-RU')} кг`} />
            <Row label="В тоннах" value={`${result.tons.toFixed(3)} т`} />
          </div>

          <div className="mt-1 flex items-center justify-between rounded-2xl bg-primary px-4 py-4 text-primary-foreground">
            <span className="text-sm text-primary-foreground/85">Стоимость</span>
            <span className="text-2xl font-bold tabular-nums">
              {result.costByMeter.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Предварительный расчёт по прайсу склада. Резка в размер — бесплатно при заказе.
          </p>
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-secondary px-4 py-2.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-slate-900 text-right text-pretty">{value}</span>
    </div>
  )
}
