'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Clock, Heart, MapPin, Phone, ShoppingCart, Truck } from 'lucide-react'
import { BrandLogo } from '@/components/pm-theme/BrandLogo'
import { useCart } from '@/components/pm-theme/cart-context'
import { useFavorites } from '@/components/pm-theme/favorites-context'
import { Button } from '@/components/pm-theme/ui/Button'
import { LiveSearch } from '@/components/pm-theme/home/HeroSearch'

type HeaderSettings = {
  phone: string;
  workHours: string;
  logoUrl: string | null;
  siteName: string;
  regionLabel?: string;
}

const TOP_LINKS = [
  { href: '/kalkulyator-metalla', label: 'Калькулятор металла' },
  { href: '/kalkulyator-dostavki', label: 'Калькулятор доставки' },
  { href: '/blog', label: 'Блог' },
]

export function SiteHeader({ settings }: { settings?: HeaderSettings }) {
  const { count } = useCart()
  const { count: favCount } = useFavorites()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const phone = settings?.phone || '+7 (495) 000-00-00'
  const workHours = settings?.workHours || 'Ежедневно 8:00–22:00'
  const regionLabel = settings?.regionLabel || 'Москва и МО'
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, '')}`

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card/90 shadow-sm shadow-slate-900/[0.04] backdrop-blur-xl">
      {/* Верхняя строка: слоган + быстрые ссылки (скрывается при скролле) */}
      <div
        className={`hidden overflow-hidden border-border/50 transition-all duration-300 lg:block ${
          scrolled ? 'max-h-0 border-transparent opacity-0' : 'max-h-12 border-b opacity-100'
        }`}
      >
        <div className="flex h-10 items-center justify-between gap-6 px-4 md:px-6 lg:px-8">
          <p className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
            <Truck className="size-3.5 text-primary" />
            Металлопрокат, песок и щебень — доставка в день заказа
          </p>
          <nav className="flex items-center gap-5">
            {TOP_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
              <Clock className="size-3.5" />
              {workHours}
            </span>
          </nav>
        </div>
      </div>

      {/* Основная строка: лого, поиск, регион, телефон, избранное, корзина */}
      <div
        className={`flex items-center gap-3 px-4 transition-all duration-300 md:px-6 lg:gap-4 lg:px-8 ${
          scrolled ? 'py-2' : 'py-3.5'
        }`}
      >
        <BrandLogo
          logoUrl={settings?.logoUrl}
          siteName={settings?.siteName}
          className="size-12"
          textClassName="text-xl"
        />

        <div className="ml-2 hidden flex-1 items-center gap-3 lg:flex">
          <div className="relative flex-1 max-w-3xl">
            <LiveSearch variant="header" placeholder="Поиск по каталогу: арматура, песок, труба 40×20…" />
          </div>
          <span className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground">
            <MapPin className="size-4" />
            {regionLabel}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          {/* Регион — только на мобильных, в верхней строке */}
          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground lg:hidden">
            <MapPin className="size-3.5" />
            {regionLabel}
          </span>
          <a
            href={phoneHref}
            className="group hidden items-center gap-2.5 rounded-2xl p-1 pr-2 text-[15px] font-semibold text-foreground transition-colors hover:text-primary xl:flex"
          >
            <span className="relative flex size-11 items-center justify-center rounded-2xl bg-accent text-primary transition-transform group-hover:scale-105">
              <Phone className="size-[18px]" />
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
            </span>
            <span className="flex flex-col leading-none">
              <span>{phone}</span>
              <span className="mt-1 text-[11px] font-normal text-muted-foreground">Позвонить нам</span>
            </span>
          </a>

          <Button
            render={<Link href="/izbrannoe" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="hidden h-12 gap-2 rounded-2xl border-border/80 bg-card px-4 text-[15px] shadow-sm transition-all hover:border-rose-200 hover:shadow-md hover:shadow-rose-100 md:inline-flex"
          >
            <Heart
              className={favCount > 0 ? 'size-4 text-rose-500' : 'size-4 text-muted-foreground'}
              fill={favCount > 0 ? 'currentColor' : 'none'}
            />
            Избранное
            {favCount > 0 && (
              <span className="ml-1 inline-flex min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-bold tabular-nums text-white">
                {favCount}
              </span>
            )}
          </Button>

          <Button
            render={<Link href="/korzina" />}
            nativeButton={false}
            size="lg"
            className="hidden h-12 gap-2 rounded-2xl px-5 text-[15px] shadow-md shadow-primary/25 transition-all hover:shadow-lg hover:shadow-primary/30 md:inline-flex"
          >
            <ShoppingCart className="size-4" />
            Корзина
            <span
              className={`ml-1 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums ${
                count > 0 ? 'bg-white text-primary' : 'bg-primary-foreground/20'
              }`}
            >
              {count}
            </span>
          </Button>
        </div>
      </div>

      {/* Мобильная строка: поиск на всю ширину */}
      <div className="px-4 pb-4 lg:hidden">
        <LiveSearch variant="header" placeholder="Поиск по каталогу…" />
      </div>
    </header>
  )
}
