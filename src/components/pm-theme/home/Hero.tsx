import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, PackageCheck, Scissors, TrendingUp, Truck, Warehouse } from 'lucide-react'
import { Button } from '@/components/pm-theme/ui/Button'
import { HeroProductCard } from '@/components/pm-theme/home/HeroProductCard'
import { BannerCarousel } from '@/components/pm-theme/home/BannerCarousel'
import type { Product } from '@/lib/pm-catalog'
import type { BannerData } from '@/lib/shop-settings'

const QUICK_QUERIES = ['Арматура', 'Труба профильная', 'Лист', 'Сетка', 'Песок', 'Щебень']

export type HeroTexts = {
  badge: string;
  title: string;
  subtitle: string;
};

/** Дефолтный промо-баннер — когда в админке нет активных баннеров */
function DefaultPromoBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-blue-500 shadow-xl shadow-primary/25">
      {/* Декоративные круги */}
      <span className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-white/10 blur-2xl" />
      <span className="pointer-events-none absolute -bottom-28 left-1/3 size-72 rounded-full bg-cyan-300/15 blur-3xl" />
      <div className="relative flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:gap-8">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur">
            <Warehouse className="size-3.5" />
            Со склада в Москве
          </span>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
            Металлопрокат ГОСТ — резка в размер
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
            Арматура, трубы, листы, швеллер и балка — режем под ваш размер и привозим в день заказа.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-semibold text-white/90">
            <span className="inline-flex items-center gap-1.5"><BadgeCheck className="size-4" /> 25 лет на рынке</span>
            <span className="inline-flex items-center gap-1.5"><PackageCheck className="size-4" /> 12 000+ заказов</span>
            <span className="inline-flex items-center gap-1.5"><Truck className="size-4" /> 15 машин в автопарке</span>
          </div>
          <Button
            render={<Link href="/shop" />}
            nativeButton={false}
            variant="secondary"
            size="lg"
            className="mt-5 h-12 self-start rounded-2xl bg-white px-6 text-[15px] font-bold text-primary shadow-lg shadow-blue-900/20 hover:bg-white/90"
          >
            Смотреть каталог металлопроката
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="relative h-44 shrink-0 overflow-hidden rounded-2xl ring-4 ring-white/20 md:h-40 md:w-96">
          <Image
            src="/materials/metalloprokat.png"
            alt="Металлопрокат ГОСТ"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-primary shadow-sm">
            ГОСТ 5781-82
          </span>
        </div>
      </div>
    </div>
  )
}

export function Hero({
  bulkProducts = [],
  banners = [],
  texts,
}: {
  bulkProducts?: Product[];
  banners?: BannerData[];
  texts?: Partial<HeroTexts>;
}) {
  const products = bulkProducts.slice(0, 15)
  const badge = texts?.badge ?? 'Доставка в день заказа'
  const title = texts?.title ?? 'Металлопрокат, песок и щебень с доставкой в день заказа'
  const subtitle = texts?.subtitle ?? 'Арматура, трубы, листы и сетка с нашего склада плюс сыпучие материалы.'

  return (
    <section className="relative flex flex-col gap-8">
      {/* Декоративный фон: градиентные пятна + сетка */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[480px] overflow-hidden">
        <span className="absolute -left-32 top-0 size-96 rounded-full bg-primary/10 blur-3xl" />
        <span className="absolute right-0 top-16 size-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      </div>

      <div className="max-w-4xl">
        {badge && (
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-[13px] font-semibold uppercase tracking-wide text-accent-foreground shadow-sm shadow-primary/5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            {badge}
          </span>
        )}
        <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-balance text-slate-900 md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">{subtitle}</p>
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {[
            { icon: BadgeCheck, label: 'Сертификаты ГОСТ' },
            { icon: Scissors, label: 'Резка в размер' },
            { icon: Truck, label: 'Доставка в день заказа' },
          ].map((t) => (
            <span
              key={t.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3.5 py-2 text-[13px] font-semibold text-slate-700 shadow-sm shadow-slate-200/60"
            >
              <t.icon className="size-4 text-primary" />
              {t.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <TrendingUp className="size-3.5 text-muted-foreground" />
        {QUICK_QUERIES.map((q) => (
          <Link
            key={q}
            href={`/catalog?q=${encodeURIComponent(q)}`}
            className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            {q}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <HeroProductCard key={p.id} product={p} />
        ))}
      </div>

      {banners.length > 0 ? <BannerCarousel banners={banners} /> : <DefaultPromoBanner />}
    </section>
  )
}
