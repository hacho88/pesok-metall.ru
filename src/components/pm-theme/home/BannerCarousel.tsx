'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { BannerData } from '@/lib/shop-settings'

const AUTO_MS = 6000

function Slide({ banner }: { banner: BannerData }) {
  const inner = (
    <div className="flex min-h-[220px] flex-col gap-6 p-6 sm:p-8 md:min-h-[220px] md:flex-row md:items-center md:gap-8">
      <div className="min-w-0 flex-1">
        <h3 className="text-2xl font-black tracking-tight text-white md:text-3xl">{banner.title}</h3>
        {banner.subtitle && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">{banner.subtitle}</p>
        )}
        {banner.linkLabel && (
          <span className="mt-5 inline-flex h-12 items-center gap-2 self-start rounded-2xl bg-white px-6 text-[15px] font-bold text-primary">
            {banner.linkLabel}
            <ArrowRight className="size-4" />
          </span>
        )}
      </div>
      {banner.imageUrl && (
        <div className="relative h-44 shrink-0 overflow-hidden rounded-2xl md:h-40 md:w-96">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner.imageUrl} alt={banner.title} className="size-full object-cover" loading="lazy" />
        </div>
      )}
    </div>
  )

  return (
    <div className="w-full shrink-0">
      {banner.linkUrl ? (
        <Link href={banner.linkUrl} className="block transition-opacity hover:opacity-95">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  )
}

/** Слайдер баннеров с главной: автопрокрутка, стрелки, точки; пауза при наведении */
export function BannerCarousel({ banners }: { banners: BannerData[] }) {
  const count = banners.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || count < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_MS)
    return () => clearInterval(t)
  }, [paused, count])

  if (count === 0) return null

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count)

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-blue-500 shadow-lg shadow-primary/25"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((b) => (
          <Slide key={b.id} banner={b} />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            aria-label="Предыдущий баннер"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            aria-label="Следующий баннер"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                aria-label={`Баннер ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
