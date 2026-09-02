"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { MOSCOW_DISTRICTS, MO_CITIES } from "@/lib/geo-zones";

export function V4Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="border-t-2 border-[#FF6B00] bg-[#1A1D20] text-[#E6D5BC]">
      {/* Newsletter */}
      <div className="border-b border-[#3A3F44]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-[#F4EBE1]">
              Прайс и акции — <span className="text-[#FF6B00]">на почту</span>
            </h3>
            <p className="mt-2 text-sm font-medium text-[#E6D5BC]/60">
              Еженедельная рассылка: цены на металл и сыпучие, новинки склада.
            </p>
          </div>
          <div className="flex w-full max-w-md items-center gap-2">
            {subscribed ? (
              <div className="flex h-14 flex-1 items-center gap-3 border border-green-500 bg-green-500/10 px-5 text-sm font-bold text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                Вы подписаны! Проверьте почту.
              </div>
            ) : (
              <>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@company.ru"
                  type="email"
                  className="h-14 flex-1 border border-[#3A3F44] bg-[#2B3035] px-5 text-sm font-semibold text-[#F4EBE1] placeholder:text-[#E6D5BC]/40 focus:border-[#FF6B00] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => email.includes("@") && setSubscribed(true)}
                  disabled={!email.includes("@")}
                  className="flex h-14 items-center gap-2 bg-[#FF6B00] px-6 text-xs font-black uppercase tracking-widest text-[#1A1D20] transition-colors hover:bg-[#FF9900] disabled:opacity-40"
                >
                  <Mail className="h-4 w-4" />
                  Подписаться
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand + legal */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center border-2 border-[#FF6B00] bg-[#2B3035] text-lg font-black text-[#FF6B00]">
                P
              </span>
              <span className="text-base font-black uppercase tracking-tight text-[#F4EBE1]">
                PESOK<span className="text-[#FF6B00]">-</span>METALL
              </span>
            </div>
            <p className="mt-5 text-sm font-medium leading-relaxed text-[#E6D5BC]/60">
              Металлопрокат, песок и щебень с доставкой по Москве и Московской
              области в день заказа. Розница и опт.
            </p>
            <div className="mt-6 space-y-1.5 text-xs font-bold text-[#E6D5BC]/40">
              <p>ООО «Песок-Металл»</p>
              <p>ИНН 7723456789 · КПП 772301001</p>
              <p>ОГРН 1237700123456</p>
            </div>
            <div className="mt-6 space-y-2 text-sm font-semibold">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#FF6B00]" />
                <a href="tel:+74950000000" className="hover:text-[#FF6B00]">+7 (495) 000-00-00</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#FF6B00]" />
                <a href="mailto:sale@pesok-metall.ru" className="hover:text-[#FF6B00]">sale@pesok-metall.ru</a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#FF6B00]" />
                Москва, Каширское ш., 61, стр. 3
              </p>
            </div>
          </div>

          {/* Sitemap */}
          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[#FF9900]">
              Каталог
            </h4>
            <nav className="space-y-2.5 text-sm font-semibold">
              <Link href="/metall" className="block transition-colors hover:text-[#FF6B00]">Металлопрокат</Link>
              <Link href="/pesok-scheben" className="block transition-colors hover:text-[#FF6B00]">Песок и щебень</Link>
              <Link href="/#calculator" className="block transition-colors hover:text-[#FF6B00]">Калькулятор</Link>
              <Link href="/#b2b" className="block transition-colors hover:text-[#FF6B00]">Для B2B</Link>
              <Link href="/#fleet" className="block transition-colors hover:text-[#FF6B00]">Автопарк</Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[#FF9900]">
              Компания
            </h4>
            <nav className="space-y-2.5 text-sm font-semibold">
              <Link href="/blog" className="block transition-colors hover:text-[#FF6B00]">Блог и аналитика</Link>
              <Link href="/#certificates" className="block transition-colors hover:text-[#FF6B00]">Сертификаты / ГОСТ</Link>
              <Link href="/admin" className="block transition-colors hover:text-[#FF6B00]">Конструктор</Link>
              <a href="/api/price-list" className="block transition-colors hover:text-[#FF6B00]">Прайс (Excel)</a>
            </nav>
          </div>

          {/* Geo links */}
          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[#FF9900]">
              Доставка по регионам
            </h4>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {[...MOSCOW_DISTRICTS.slice(0, 6), ...MO_CITIES.slice(0, 8)].map((z) => (
                <Link
                  key={z.slug}
                  href={`/geo/${z.slug}`}
                  className="text-sm font-semibold text-[#E6D5BC]/70 transition-colors hover:text-[#FF6B00]"
                >
                  {z.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#3A3F44]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-4 py-5 text-[11px] font-bold text-[#E6D5BC]/40 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} pesok-metall.ru — металлопрокат и сыпучие материалы</p>
          <p className="uppercase tracking-widest">Работаем ежедневно 8:00–22:00</p>
        </div>
      </div>
    </footer>
  );
}
