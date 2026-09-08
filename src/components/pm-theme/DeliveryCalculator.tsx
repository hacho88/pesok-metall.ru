'use client'

import { useEffect, useMemo, useState } from 'react'
import { Package, Sparkles, Truck } from 'lucide-react'
import { cn } from '@/lib/pm-utils'

const materials = [
  { id: 'sand', label: 'Песок', density: 1.6, price: 900 },
  { id: 'gravel', label: 'Щебень', density: 1.4, price: 1600 },
  { id: 'keramzit', label: 'Керамзит', density: 0.4, price: 3200 },
] as const

interface FleetVehicle {
  id: string
  name: string
  maxWeightKg: number
  baseFare: number
  perKmCharge: number
  imageUrl: string | null
  plateNumber: string | null
}

const FALLBACK_FLEET: FleetVehicle[] = [
  { id: 'porter', name: 'Портер (до 2 т)', maxWeightKg: 2000, baseFare: 2500, perKmCharge: 35, imageUrl: null, plateNumber: null },
  { id: 'gazelle', name: 'Газель (до 3 т)', maxWeightKg: 3000, baseFare: 3000, perKmCharge: 40, imageUrl: null, plateNumber: null },
  { id: 'five-ton', name: '5-тонник', maxWeightKg: 5000, baseFare: 5000, perKmCharge: 50, imageUrl: null, plateNumber: null },
  { id: 'ten-ton', name: '10-тонник', maxWeightKg: 10000, baseFare: 5000, perKmCharge: 55, imageUrl: null, plateNumber: null },
]

/** Самая дешёвая машина, вмещающая вес заказа */
function pickVehicle(fleet: FleetVehicle[], kg: number): FleetVehicle | null {
  const fits = fleet.filter((v) => v.maxWeightKg >= kg).sort((a, b) => a.baseFare - b.baseFare)
  return fits[0] ?? null
}

export function DeliveryCalculator() {
  const [material, setMaterial] = useState<(typeof materials)[number]['id']>('sand')
  const [volume, setVolume] = useState('3')
  const [pack, setPack] = useState<'bag' | 'bigbag'>('bigbag')
  const [fleet, setFleet] = useState<FleetVehicle[]>(FALLBACK_FLEET)

  // Автопарк из админки (Интерфейс → Автопарк)
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/fleet')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.fleet) && data.fleet.length > 0) setFleet(data.fleet)
        }
      } catch {
        // остаёмся на fallback
      }
    })()
  }, [])

  const result = useMemo(() => {
    const m = materials.find((x) => x.id === material)!
    const vol = Math.max(0, Number.parseFloat(volume) || 0)
    const tons = vol * m.density
    const kg = tons * 1000
    const bags = Math.ceil(kg / 30)
    const bigbags = Math.ceil(tons)
    const vehicle = pickVehicle(fleet, kg)
    const materialCost = Math.round(tons * m.price)
    const delivery = vehicle ? vehicle.baseFare : 0
    const total = materialCost + delivery
    return { tons, kg, bags, bigbags, vehicle, materialCost, delivery, total, mLabel: m.label }
  }, [material, volume, fleet])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          <Sparkles className="size-3.5" />
          ИИ-калькулятор
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl text-balance">
          ИИ-калькулятор доставки
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Перевод объёма в тару, автоподбор машины и расчёт стоимости в реальном времени.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-card p-6 shadow-sm shadow-slate-200/50">
          <div>
            <label className="text-sm font-semibold text-slate-900">Материал</label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {materials.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMaterial(m.id)}
                  className={cn(
                    'rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors',
                    material === m.id
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                      : 'bg-secondary text-foreground hover:bg-accent hover:text-primary',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="volume" className="text-sm font-semibold text-slate-900">
              Объём, м³
            </label>
            <input
              id="volume"
              type="number"
              min={0}
              step="0.5"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="mt-2.5 h-12 w-full rounded-2xl border border-transparent bg-secondary px-4 text-lg font-semibold text-foreground outline-none transition-colors focus:border-primary/40 focus:bg-card"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-900">Тара</label>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {[
                { id: 'bag', label: 'Мешки 30 кг' },
                { id: 'bigbag', label: 'Биг-беги 1 т' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPack(p.id as 'bag' | 'bigbag')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                    pack === p.id
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                      : 'bg-secondary text-foreground hover:bg-accent hover:text-primary',
                  )}
                >
                  <Package className="size-4" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="flex h-fit flex-col gap-4 rounded-3xl bg-gradient-to-br from-primary to-blue-500 p-6 text-primary-foreground shadow-sm shadow-primary/30">
          <div className="flex items-center gap-2">
            <Truck className="size-5" />
            <h2 className="font-semibold">Результат расчёта</h2>
          </div>

          {result.vehicle?.imageUrl && (
            <div className="relative h-36 overflow-hidden rounded-2xl ring-2 ring-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.vehicle.imageUrl}
                alt={result.vehicle.name}
                className="size-full object-cover"
              />
              <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-primary shadow-sm">
                до {(result.vehicle.maxWeightKg / 1000).toLocaleString('ru-RU')} т
              </span>
            </div>
          )}

          <div className="flex flex-col gap-3 text-sm">
            <Row label={`Масса ${result.mLabel.toLowerCase()}`} value={`${result.tons.toFixed(2)} т`} />
            <Row
              label="Тара"
              value={pack === 'bag' ? `${result.bags} меш. × 30 кг` : `${result.bigbags} биг-бег × 1 т`}
            />
            <Row label="Автоподбор" value={result.vehicle ? result.vehicle.name : '—'} />
            {result.vehicle?.plateNumber && <Row label="Машина" value={result.vehicle.plateNumber} />}
            <Row label="Материал" value={`${result.materialCost.toLocaleString('ru-RU')} ₽`} />
            <Row label="Доставка" value={`${result.delivery.toLocaleString('ru-RU')} ₽`} />
          </div>

          <div className="mt-1 flex items-center justify-between border-t border-white/20 pt-4">
            <span className="text-sm text-primary-foreground/85">Итого</span>
            <span className="text-2xl font-bold tabular-nums">{result.total.toLocaleString('ru-RU')} ₽</span>
          </div>
          <p className="text-xs leading-relaxed text-primary-foreground/75">
            Предварительный расчёт. Точную стоимость подтвердит менеджер при оформлении заказа.
          </p>
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 px-4 py-2.5">
      <span className="text-primary-foreground/80">{label}</span>
      <span className="font-semibold text-right text-pretty">{value}</span>
    </div>
  )
}
