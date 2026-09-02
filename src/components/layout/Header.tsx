"use client";

import { useState } from "react";
import Link from "next/link";
import { HardHat, Menu, Phone, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/components/checkout/CartContext";

const NAV_LINKS = [
  { href: "/metall", label: "Металлопрокат" },
  { href: "/pesok-scheben", label: "Песок и щебень" },
  { href: "/catalog", label: "Каталог" },
  { href: "/#calculator", label: "Калькулятор" },
  { href: "/#invoice", label: "Счёт онлайн" },
];

const GEO_LINKS = [
  { name: "Москва", slug: "moscow" },
  { name: "Балашиха", slug: "balashiha" },
  { name: "Подольск", slug: "podolsk" },
  { name: "Митино", slug: "mitino" },
  { name: "Люберцы", slug: "lyubertsy" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { items, setOpen } = useCart();
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HardHat className="h-5 w-5" />
          </span>
          <span className="text-base sm:text-lg">
            pesok<span className="text-primary">-metall</span>.ru
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="tel:+74950000000"
            className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white sm:flex"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>+7 (495) 000-00-00</span>
          </a>

          {/* Кнопка Корзины в шапке */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary px-3.5 py-2 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-sm transition-all hover:brightness-110 active:scale-95"
            aria-label="Корзина"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Корзина</span>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-black text-primary">
              {itemCount}
            </span>
          </button>

          {/* Бургер для мобильных */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {menuOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Доставка по регионам
            </p>
            <div className="flex flex-wrap gap-2 px-3 pb-3">
              {GEO_LINKS.map((zone) => (
                <Link
                  key={zone.slug}
                  href={`/geo/${zone.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {zone.name}
                </Link>
              ))}
            </div>
            <a
              href="tel:+74950000000"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-3 text-base font-semibold text-primary-foreground"
            >
              <Phone className="h-4 w-4" />
              +7 (495) 000-00-00
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
