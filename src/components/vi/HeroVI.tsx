"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    id: 1,
    badge: "Акция недели",
    title: "Мешки песка 30 кг",
    highlight: "от 89 ₽/мешок",
    text: "Песок речной и карьерный в мешках — удобно для дачи и мелкого ремонта.",
    cta: "К сыпучим материалам",
    href: "/pesok-scheben",
    bg: "from-orange-500 to-amber-600",
  },
  {
    id: 2,
    badge: "Хит продаж",
    title: "Арматура А500С",
    highlight: "от 62 ₽/метр",
    text: "Диаметры 6–25 мм со склада в Москве. Резка в размер — бесплатно.",
    cta: "В каталог металла",
    href: "/metall",
    bg: "from-slate-800 to-slate-900",
  },
  {
    id: 3,
    badge: "Для бизнеса",
    title: "Биг-беги щебня 1 т",
    highlight: "от 1 450 ₽/биг-бег",
    text: "Гранитный и известняковый щебень 5-20, 20-40. Доставка манипулятором.",
    cta: "Заказать оптом",
    href: "/#b2b",
    bg: "from-gray-600 to-gray-800",
  },
];

export function HeroVI() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  function go(dir: -1 | 1) {
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);
  }

  return (
    <section className="relative overflow-hidden bg-gray-100">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={cn("relative flex min-h-[320px] flex-col justify-center bg-gradient-to-br p-8 text-white sm:min-h-[380px] sm:p-14")}
              style={{ backgroundImage: `linear-gradient(to bottom right, ${slide.bg.split(" ")[0].replace("from-", "")}, ${slide.bg.split(" ")[1].replace("to-", "")})` }}
            >
              {/* Decorative circles */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-white/5" />

              <div className="relative z-10 max-w-xl">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur">
                  {slide.badge}
                </span>
                <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                  {slide.title}
                </h1>
                <p className="mt-3 text-2xl font-black text-amber-300 sm:text-4xl">{slide.highlight}</p>
                <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-white/85 sm:text-base">
                  {slide.text}
                </p>
                <Link
                  href={slide.href}
                  className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-black uppercase tracking-widest text-gray-900 shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  {slide.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg backdrop-blur transition-all hover:scale-110 active:scale-95"
            aria-label="Предыдущий слайд"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg backdrop-blur transition-all hover:scale-110 active:scale-95"
            aria-label="Следующий слайд"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === index ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
                )}
                aria-label={`Слайд ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Truck, label: "Доставка в день заказа" },
            { icon: "⚖️", label: "Фасовка 30 кг и 1 т" },
            { icon: "📄", label: "Счёт и накладные" },
            { icon: "⭐", label: "4.8 из 5 — 2 400 отзывов" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg text-[#FF6B00]">
                {typeof item.icon === "string" ? item.icon : <item.icon className="h-5 w-5" />}
              </span>
              <span className="text-xs font-bold leading-tight text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
