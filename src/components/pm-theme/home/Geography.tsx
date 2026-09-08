import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { inZone } from '@/lib/geo-declensions'

export function Geography({ cities }: { cities: { name: string; slug: string }[] }) {
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

      <div className="relative mt-5 flex flex-wrap gap-2.5">
        {cities.map((city) => (
          <Link
            key={city.slug}
            href={`/geo/${city.slug}`}
            className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:border-white/40 hover:bg-white/20"
          >
            {inZone(city.name)}
          </Link>
        ))}
      </div>

      <p className="relative mt-5 text-sm leading-relaxed text-white/70">
        Не нашли свой район? Спросите нашего ИИ-менеджера — мы доставляем по всей Московской области.
      </p>
    </section>
  )
}
