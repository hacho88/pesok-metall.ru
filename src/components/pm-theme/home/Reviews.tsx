import { Quote, Star } from 'lucide-react'

const reviews = [
  {
    text: 'Заказывал песок и щебень биг-бегами. ИИ-калькулятор сразу подобрал манипулятор — привезли в тот же день, разгрузили точно по адресу.',
    name: 'Андрей, прораб',
    role: 'Строительная бригада, Балашиха',
  },
  {
    text: 'Для фундамента взяла арматуру А500С и мешки песка. Цены ниже, чем в соседних магазинах, а счёт оформили онлайн за пару минут.',
    name: 'Марина',
    role: 'Частный застройщик, Подольск',
  },
  {
    text: 'Работаем оптом уже год: стабильное наличие, честные цены и доставка по графику. Рекомендую как надёжного поставщика.',
    name: 'Дмитрий',
    role: 'Директор строительной компании',
  },
]

export function Reviews() {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Отзывы клиентов</h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
        {reviews.map((r) => (
          <figure
            key={r.name}
            className="group relative flex min-w-[85%] snap-start flex-col rounded-3xl border border-border/70 bg-card p-5 shadow-sm shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70 sm:min-w-[70%] md:min-w-0"
          >
            <Quote
              aria-hidden
              className="pointer-events-none absolute -right-2 -top-3 size-16 rotate-12 text-primary/10"
            />
            <div className="relative flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-primary/10 text-sm font-black text-primary">
                {r.name.slice(0, 1)}
              </span>
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
            </div>
            <blockquote className="relative mt-4 flex-1 text-sm leading-relaxed text-foreground text-pretty">
              {r.text}
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3 border-t border-border/70 pt-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-400 text-xs font-black text-white">
                {r.name.slice(0, 1)}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-slate-900">{r.name}</span>
                <span className="text-xs text-muted-foreground">{r.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
