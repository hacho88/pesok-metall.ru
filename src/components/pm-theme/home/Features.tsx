import { BadgeCheck, Calculator, Truck, Warehouse } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Доставка в день заказа',
    subtext: 'Собственный автопарк: от Газели до манипулятора и самосвала КАМАЗ.',
  },
  {
    icon: Warehouse,
    title: 'Розница и опт',
    subtext: 'Мешки 30 кг для розницы, биг-беги 1 т и машины целиком для опта.',
  },
  {
    icon: BadgeCheck,
    title: 'Соответствие ГОСТ',
    subtext: 'Сертифицированный металлопрокат и сыпучие материалы с документами.',
  },
  {
    icon: Calculator,
    title: 'ИИ-калькулятор',
    subtext: 'Точный перевод объёма в тару и автоподбор машины за 30 секунд.',
  },
]

const DEFAULT_STATS = [
  { value: '25 лет', label: 'на рынке стройматериалов' },
  { value: '12 000+', label: 'заказов доставлено' },
  { value: '15 машин', label: 'в собственном автопарке' },
  { value: '24/7', label: 'приём заказов онлайн' },
]

export function Features() {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Почему заказывают у нас</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {features.map((f) => {
          const Icon = f.icon
          return (
            <div
              key={f.title}
              className="group flex flex-col rounded-3xl border border-border/70 bg-card p-5 shadow-sm shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">{f.subtext}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function Stats({ items }: { items?: { value: string; label: string }[] }) {
  const stats = items && items.length > 0 ? items : DEFAULT_STATS
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 p-6 shadow-xl shadow-slate-900/15 sm:px-8">
      {/* Декоративные круги */}
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/30 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-24 left-1/4 size-64 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="relative grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col items-center text-center ${
              i > 0 ? 'sm:border-l sm:border-white/10' : ''
            }`}
          >
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-3xl font-black tracking-tight text-transparent md:text-4xl">
              {s.value}
            </span>
            <span className="mt-1.5 text-sm text-white/70 text-balance">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
