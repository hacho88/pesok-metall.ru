"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingBag, User, ChevronDown, Heart, Phone } from "lucide-react";
import { useCartStore } from "@/components/atlas/checkout/cart-store";

export function FlatHeader() {
  const [search, setSearch] = useState("");
  const cartCount = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));

  return (
    <header className="flat-header">
      {/* Top bar */}
      <div className="flat-header__top">
        Бесплатная доставка при заказе от 50 000 ₽ · <a href="tel:+74950000000">+7 (495) 000-00-00</a>
      </div>

      {/* Main header */}
      <div className="flat-container">
        <div className="flat-header__main">
          <Link href="/" className="flat-logo">Flat<span>Store</span></Link>

          <nav className="flat-nav">
            <div className="flat-nav__item">
              <Link href="/" className="flat-nav__link">Главная</Link>
            </div>
            <div className="flat-nav__item">
              <span className="flat-nav__link">Каталог <ChevronDown size={14} /></span>
              <div className="flat-nav__submenu">
                <Link href="/shop" className="flat-nav__sublink">Все товары</Link>
                <Link href="/shop?cat=Металлопрокат" className="flat-nav__sublink">Металлопрокат</Link>
                <Link href="/shop?cat=Сыпучие материалы" className="flat-nav__sublink">Сыпучие материалы</Link>
                <Link href="/shop?cat=Дополнительные материалы" className="flat-nav__sublink">Доп. материалы</Link>
              </div>
            </div>
            <div className="flat-nav__item">
              <span className="flat-nav__link">Страницы <ChevronDown size={14} /></span>
              <div className="flat-nav__submenu">
                <Link href="/cart" className="flat-nav__sublink">Корзина</Link>
                <Link href="/checkout" className="flat-nav__sublink">Оформление</Link>
                <Link href="/about" className="flat-nav__sublink">О нас</Link>
                <Link href="/contacts" className="flat-nav__sublink">Контакты</Link>
              </div>
            </div>
            <div className="flat-nav__item">
              <Link href="/about" className="flat-nav__link">О нас</Link>
            </div>
          </nav>

          <div className="flat-header__actions">
            <Link href="/shop" className="flat-icon-btn" title="Поиск"><Search size={20} /></Link>
            <button className="flat-icon-btn" title="Избранное"><Heart size={20} /></button>
            <button className="flat-icon-btn" title="Аккаунт"><User size={20} /></button>
            <Link href="/cart" className="flat-icon-btn" title="Корзина">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="flat-cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export function FlatFooter() {
  return (
    <footer className="flat-footer">
      <div className="flat-container">
        <div className="flat-footer__top">
          <div>
            <div className="flat-footer__brand">Flat<span>Store</span></div>
            <p className="flat-footer__desc">
              Интернет-магазин строительных материалов. Металлопрокат и сыпучие материалы
              с доставкой по Москве и области. Гарантия ГОСТ качества.
            </p>
          </div>
          <div>
            <h4 className="flat-footer__title">Компания</h4>
            <Link href="/about" className="flat-footer__link">О нас</Link>
            <Link href="/contacts" className="flat-footer__link">Контакты</Link>
            <Link href="/delivery" className="flat-footer__link">Доставка</Link>
            <Link href="/faq" className="flat-footer__link">FAQ</Link>
          </div>
          <div>
            <h4 className="flat-footer__title">Мой аккаунт</h4>
            <Link href="/cart" className="flat-footer__link">Корзина</Link>
            <Link href="/checkout" className="flat-footer__link">Оформление</Link>
            <Link href="/shop" className="flat-footer__link">Каталог</Link>
          </div>
          <div>
            <h4 className="flat-footer__title">Поддержка</h4>
            <a href="tel:+74950000000" className="flat-footer__link">+7 (495) 000-00-00</a>
            <a href="mailto:info@flatstore.ru" className="flat-footer__link">info@flatstore.ru</a>
            <span className="flat-footer__link" style={{ cursor: "default" }}>Москва, склад</span>
            <span className="flat-footer__link" style={{ cursor: "default" }}>Пн–Сб: 9:00–20:00</span>
          </div>
        </div>
        <div className="flat-footer__bottom">
          © 2026 FlatStore. Все права защищены.
        </div>
      </div>
    </footer>
  );
}

export function FlatBreadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="flat-breadcrumbs">
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span className="flat-breadcrumbs__current">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="flat-breadcrumbs__sep">/</span>}
        </span>
      ))}
    </div>
  );
}
