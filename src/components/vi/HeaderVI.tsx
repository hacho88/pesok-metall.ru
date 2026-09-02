"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/checkout/CartContext";

const POPULAR_TAGS = ["Арматура", "Труба профильная", "Песок речной", "Щебень 20-40", "Сетка сварная"];

const CATALOG_MENU = [
  { name: "Металлопрокат", href: "/metall" },
  { name: "Песок и щебень", href: "/pesok-scheben" },
  { name: "Калькулятор", href: "/#calculator" },
  { name: "Для бизнеса", href: "/#b2b" },
  { name: "Блог", href: "/blog" },
];

export function HeaderVI() {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { items, setOpen } = useCart();
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      {/* Top strip */}
      <div className="bg-[#FF6B00] text-white">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-center gap-6 px-4 text-[11px] font-bold uppercase tracking-widest sm:justify-between sm:px-6 lg:px-8">
          <span className="hidden sm:block">Доставка в день заказа по Москве и МО</span>
          <span>Скидка 5% на первый заказ онлайн</span>
          <span className="hidden md:block">Счёт для юр. лиц с НДС 20%</span>
        </div>
      </div>

      {/* Main row */}
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 lg:px-8">
        {/* Burger catalog */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setCatalogOpen((v) => !v)}
            className={cn(
              "flex h-12 items-center gap-2 rounded-lg px-4 text-sm font-black uppercase tracking-widest text-white transition-colors",
              catalogOpen ? "bg-[#e05a00]" : "bg-[#FF6B00] hover:bg-[#e05a00]"
            )}
          >
            <Menu className="h-5 w-5" />
            Каталог
            <ChevronDown className={cn("h-4 w-4 transition-transform", catalogOpen && "rotate-180")} />
          </button>
          {catalogOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-2xl">
              {CATALOG_MENU.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setCatalogOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-orange-50 hover:text-[#FF6B00]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6B00] text-lg font-black text-white">
            В
          </span>
          <span className="hidden flex-col leading-none md:flex">
            <span className="text-base font-black tracking-tight text-gray-900">ВИ</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
              Стройматериалы
            </span>
          </span>
        </Link>

        {/* Omni-search */}
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex items-center rounded-full border-2 border-gray-200 bg-gray-50 transition-colors focus-within:border-[#FF6B00]">
            <Search className="ml-4 h-4 w-4 shrink-0 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск: арматура, труба, песок, щебень..."
              className="h-12 w-full bg-transparent px-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="button"
              className="mr-1.5 h-10 shrink-0 rounded-full bg-[#FF6B00] px-6 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#e05a00]"
            >
              Найти
            </button>
          </div>
          <div className="mt-2 hidden flex-wrap gap-1.5 lg:flex">
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-500 transition-colors hover:bg-orange-100 hover:text-[#FF6B00]"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Profile + cart */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="flex h-11 w-11 flex-col items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#FF6B00]"
            aria-label="Избранное"
          >
            <Heart className="h-5 w-5" />
            <span className="text-[9px] font-bold">Избранное</span>
          </button>
          <button
            type="button"
            className="flex h-11 w-11 flex-col items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#FF6B00]"
            aria-label="Профиль"
          >
            <User className="h-5 w-5" />
            <span className="text-[9px] font-bold">Войти</span>
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative flex h-11 w-11 flex-col items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#FF6B00]"
            aria-label="Корзина"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-[9px] font-bold">Корзина</span>
            <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B00] text-[9px] font-black text-white">
              {itemCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t border-gray-100 px-4 py-2 lg:hidden">
        <div className="flex items-center rounded-full border-2 border-gray-200 bg-gray-50">
          <Search className="ml-4 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск товаров..."
            className="h-11 w-full bg-transparent px-3 text-sm font-medium focus:outline-none"
          />
        </div>
      </div>

      {/* Mobile catalog drawer */}
      {catalogOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCatalogOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-widest">Каталог</span>
              <button type="button" onClick={() => setCatalogOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {CATALOG_MENU.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setCatalogOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-orange-50 hover:text-[#FF6B00]"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
