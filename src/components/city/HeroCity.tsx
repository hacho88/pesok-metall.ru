"use client";

import Link from "next/link";
import { ArrowRight, Phone, Truck } from "lucide-react";

export function HeroCity() {
  return (
    <section className="relative overflow-hidden border-b border-[#3A4454] bg-[#1B2129] text-[#F5F7FA]">
      {/* Steel texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 4px), repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0 1px, transparent 1px 5px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8 lg:py-24">
        <div>
          <span className="mb-6 inline-flex items-center gap-2 border border-[#FF3B1F] bg-[#FF3B1F]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#FF3B1F]">
            <Truck className="h-3.5 w-3.5" />
            Прямые поставки со склада · Москва
          </span>
          <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
            Metal &amp; Bulk
            <span className="block text-[#FF3B1F]">Direct from</span>
            <span className="block">Warehouse</span>
          </h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-[#9AA5B5]">
            Арматура, трубы, лист, сетка + песок, щебень и грунт. Отгрузка в день
            заказа, наличный и безналичный расчёт, закрывающие документы.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/#price"
              className="group flex items-center gap-3 bg-[#FF3B1F] px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-[#e02f15] active:scale-95"
            >
              Смотреть прайс
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="tel:+74950000000"
              className="flex items-center gap-3 border border-[#3A4454] bg-[#232B36] px-8 py-4 text-sm font-black uppercase tracking-widest text-[#F5F7FA] transition-all hover:border-[#FF3B1F] hover:text-[#FF3B1F] active:scale-95"
            >
              <Phone className="h-4 w-4" />
              Заказать по телефону
            </a>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-px border border-[#3A4454] bg-[#3A4454]">
            {[
              { value: "1 200+", label: "позиций на складе" },
              { value: "24 ч", label: "отгрузка заказа" },
              { value: "4 машины", label: "собственный автопарк" },
            ].map((s) => (
              <div key={s.label} className="bg-[#1B2129] p-4">
                <p className="text-xl font-black text-[#FF3B1F]">{s.value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#9AA5B5]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick quote panel */}
        <div className="flex flex-col border border-[#3A4454] bg-[#232B36] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FF3B1F]">
            Быстрый запрос цены
          </p>
          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              placeholder="Название позиции / артикул"
              className="h-12 w-full border border-[#3A4454] bg-[#1B2129] px-4 font-mono text-sm font-semibold text-[#F5F7FA] placeholder:text-[#9AA5B5]/50 focus:border-[#FF3B1F] focus:outline-none"
            />
            <input
              placeholder="Количество (м / т / шт)"
              className="h-12 w-full border border-[#3A4454] bg-[#1B2129] px-4 font-mono text-sm font-semibold text-[#F5F7FA] placeholder:text-[#9AA5B5]/50 focus:border-[#FF3B1F] focus:outline-none"
            />
            <input
              placeholder="Телефон"
              type="tel"
              className="h-12 w-full border border-[#3A4454] bg-[#1B2129] px-4 font-mono text-sm font-semibold text-[#F5F7FA] placeholder:text-[#9AA5B5]/50 focus:border-[#FF3B1F] focus:outline-none"
            />
            <button
              type="submit"
              className="h-12 w-full bg-[#FF3B1F] text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#e02f15]"
            >
              Получить цену за 15 минут
            </button>
          </form>
          <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-[#9AA5B5]/60">
            Отвечаем в рабочее время склада
          </p>
        </div>
      </div>
    </section>
  );
}
