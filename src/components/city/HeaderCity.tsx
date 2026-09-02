"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Phone, Search, ShoppingCart, Warehouse } from "lucide-react";
import { useCart } from "@/components/checkout/CartContext";

export function HeaderCity() {
  const [query, setQuery] = useState("");
  const { items, setOpen } = useCart();
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className="border-b border-[#3A4454] bg-[#1B2129] text-[#F5F7FA]">
      {/* Top strip: hours + geo */}
      <div className="border-b border-[#3A4454]/60">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between px-4 text-[11px] font-bold uppercase tracking-widest text-[#9AA5B5] sm:px-6 lg:px-8">
          <span className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[#FF3B1F]" />
            Склад: Пн–Сб 8:00–20:00, Вс 9:00–18:00
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <MapPin className="h-3.5 w-3.5 text-[#FF3B1F]" />
            Москва, Каширское ш., 61, стр. 3
          </span>
          <span className="flex items-center gap-2 text-[#FF3B1F]">
            <Warehouse className="h-3.5 w-3.5" />
            Отгрузка в день заказа
          </span>
        </div>
      </div>

      {/* Main row */}
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center border-2 border-[#FF3B1F] bg-[#232B36] text-xl font-black text-[#FF3B1F]">
            С
          </span>
          <span className="hidden flex-col leading-none md:flex">
            <span className="text-lg font-black uppercase tracking-tight">СИТИ<span className="text-[#FF3B1F]">!</span></span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#9AA5B5]">
              Металл-депо · Москва
            </span>
          </span>
        </Link>

        {/* SKU search */}
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex items-center border border-[#3A4454] bg-[#232B36] transition-colors focus-within:border-[#FF3B1F]">
            <Search className="ml-4 h-4 w-4 shrink-0 text-[#9AA5B5]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по артикулу / SKU: А500С-12, ТР-50х3, ПЕС-Р..."
              className="h-12 w-full bg-transparent px-3 font-mono text-sm font-semibold text-[#F5F7FA] placeholder:text-[#9AA5B5]/50 focus:outline-none"
            />
            <button
              type="button"
              className="h-12 shrink-0 bg-[#FF3B1F] px-6 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#e02f15]"
            >
              Найти
            </button>
          </div>
        </div>

        {/* Multi-line phones */}
        <div className="hidden shrink-0 flex-col items-end gap-1 lg:flex">
          <a href="tel:+74950000000" className="text-lg font-black tracking-tight transition-colors hover:text-[#FF3B1F]">
            +7 (495) 000-00-00
          </a>
          <a href="tel:+79260000000" className="text-sm font-bold text-[#9AA5B5] transition-colors hover:text-[#FF3B1F]">
            +7 (926) 000-00-00
          </a>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF3B1F]">
            Менеджер на связи
          </span>
        </div>

        {/* Корзина */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex shrink-0 items-center gap-2 border border-[#3A4454] bg-[#232B36] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-[#F5F7FA] transition-colors hover:border-[#FF3B1F] hover:text-[#FF3B1F]"
          aria-label="Корзина"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Корзина</span>
          <span className="flex h-5 min-w-[20px] items-center justify-center bg-[#FF3B1F] px-1.5 text-[10px] font-black text-white">
            {itemCount}
          </span>
        </button>
      </div>

      {/* Nav strip */}
      <div className="border-t border-[#3A4454]/60">
        <div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-4 py-2.5 text-xs font-black uppercase tracking-widest text-[#9AA5B5] sm:px-6 lg:px-8">
          <Link href="/metall" className="shrink-0 transition-colors hover:text-[#FF3B1F]">Металлопрокат</Link>
          <Link href="/pesok-scheben" className="shrink-0 transition-colors hover:text-[#FF3B1F]">Песок и щебень</Link>
          <Link href="/#calculator" className="shrink-0 transition-colors hover:text-[#FF3B1F]">Калькулятор</Link>
          <Link href="/#price" className="shrink-0 transition-colors hover:text-[#FF3B1F]">Прайс-лист</Link>
          <Link href="/blog" className="shrink-0 transition-colors hover:text-[#FF3B1F]">Блог</Link>
          <span className="ml-auto hidden shrink-0 text-[#FF3B1F] md:block">ГОСТ 5781-82 · ГОСТ 8732-78</span>
        </div>
      </div>
    </header>
  );
}
