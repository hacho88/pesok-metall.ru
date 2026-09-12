import Link from 'next/link'
import { Clock, Headset, Phone } from 'lucide-react'
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from '@/components/pm-theme/ui/Accordion'

const faqs = [
  {
    q: 'Сколько мешков песка нужно на стяжку 20 м² толщиной 5 см?',
    a: 'Объем: 20 м² × 0,05 м = 1 м³. При плотности 1,6 т/м³ это 1600 кг — 54 мешка по 30 кг или 2 биг-бега по 1 т. Точный расчёт сделает ИИ-калькулятор на странице.',
  },
  {
    q: 'Чем мешки 30 кг отличаются от биг-бегов 1 т?',
    a: 'Мешки по 30 кг идеальны для ручного подъема на этаж и небольших работ. Биг-беги по 1 тонне выгоднее для крупных объектов, они разгружаются краном-манипулятором.',
  },
  {
    q: 'Можно ли заказать металлопрокат в розницу?',
    a: 'Да, мы продаем металлопрокат в розницу от 1 хлыста или метра. Режем металл в размер под ваши потребности прямо на складе.',
  },
  {
    q: 'Как быстро привезут заказ?',
    a: 'Собственный автопарк позволяет осуществлять доставку в день заказа по Москве и Московской области при оформлении заявки в первой половине дня.',
  },
]

export function Faq({ phone, workHours }: { phone?: string; workHours?: string }) {
  const phoneDisplay = phone || '+7 (495) 000-00-00'
  const phoneHref = `tel:${phoneDisplay.replace(/[^+\d]/g, '')}`
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Частые вопросы</h2>
        <Accordion>
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={i}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionPanel>{item.a}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* CTA-карточка */}
      <aside className="relative flex h-fit flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 p-6 text-white shadow-xl shadow-slate-900/15">
        <span aria-hidden className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/30 blur-2xl" />
        <span className="relative flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Headset className="size-5" />
        </span>
        <h3 className="relative mt-4 text-lg font-bold leading-snug">
          Не нашли ответ? Позвоните — подберём за минуту
        </h3>
        <p className="relative mt-2 text-sm leading-relaxed text-white/75">
          Поможем с расчётом количества, подберём машину и оформим доставку на сегодня.
        </p>
        <Link
          href={phoneHref}
          className="relative mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-[15px] font-bold text-primary shadow-lg shadow-blue-900/20 transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Phone className="size-4" />
          {phoneDisplay}
        </Link>
        {workHours && (
          <span className="relative mt-3 inline-flex items-center justify-center gap-1.5 text-xs text-white/70">
            <Clock className="size-3.5" />
            {workHours}
          </span>
        )}
      </aside>
    </section>
  )
}
