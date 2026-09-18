import { MapPin, Warehouse } from 'lucide-react'
import Link from 'next/link'
import { inZone } from '@/lib/geo-declensions'

interface GeographyProps {
  cities: { name: string; slug: string }[]
  warehouse?: { address: string; lat: number; lng: number }
}

export function Geography({ cities, warehouse }: GeographyProps) {
  const mapSrc = warehouse
    ? `https://yandex.ru/map-widget/v1/?ll=${warehouse.lng}%2C${warehouse.lat}&z=10&pt=${warehouse.lng}%2C${warehouse.lat}%2Cpm2rdm`
    : null

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 p-6 text-white shadow-xl shadow-slate-900/15 sm:p-8">
      {/* Декоративные круги */}
      <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/30 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-28 right-1/3 size-72 rounded-full bg-cyan-400/15 blur-3xl" />

      <div className="relative flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <MapPin className="size-5" />
        </span>
        <h2 className="text-xl font-bold tracking-tight text-balance">
          Доставляем по всей Москве и Московской области
        </h2>
      </div>

      <div className="relative mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-wrap content-start gap-2.5">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/geo/${city.slug}`}
              className="h-fit rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:border-white/40 hover:bg-white/20"
            >
              {inZone(city.name)}
            </Link>
          ))}
        </div>

        {/* Карта со складом */}
        {mapSrc && (
          <div className="relative overflow-hidden rounded-2xl ring-2 ring-white/20">
            <iframe
              src={mapSrc}
              title="Наш склад на карте"
              className="h-56 w-full lg:h-full lg:min-h-56"
              loading="lazy"
              allowFullScreen
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-slate-900/90 to-transparent px-3 pb-2.5 pt-8">
              <Warehouse className="size-4 shrink-0 text-white" />
              <span className="truncate text-xs font-semibold text-white">
                Наш склад: {warehouse!.address}
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="relative mt-5 text-sm leading-relaxed text-white/70">
        Не нашли свой район? Спросите нашего ИИ-менеджера — мы доставляем по всей Московской области.
      </p>
    </section>
  )
}
