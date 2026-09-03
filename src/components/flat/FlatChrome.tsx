"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingBag, User, Menu, X, ChevronDown, Phone, MapPin, Truck, Shield, Headphones } from "lucide-react";
import { useCartStore } from "@/components/atlas/checkout/cart-store";
import { formatRub } from "@/lib/atlas/pricing";
import type { StorefrontProduct } from "@/lib/theme-storefront";

export function FlatHeader({ products }: { products: StorefrontProduct[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const cartCount = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));

  const categories = Array.from(new Set(products.map((p) => p.categoryName))).slice(0, 6);

  return (
    <>
      <header className="flat-header">
        <div className="flat-container flat-header__inner">
          <button className="flat-icon-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{ display: "none" }} id="flat-mobile-toggle">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="flat-logo">
            Flat<span>Store</span>
          </Link>

          <nav className="flat-nav">
            <div className="flat-nav__item">
              <Link href="/" className="flat-nav__link">Главная</Link>
            </div>
            <div className="flat-nav__item">
              <span className="flat-nav__link">Каталог <ChevronDown size={14} /></span>
              <div className="flat-nav__submenu">
                <Link href="/shop" className="flat-nav__sublink">Все товары</Link>
                {categories.map((c) => (
                  <Link key={c} href={`/shop?cat=${encodeURIComponent(c)}`} className="flat-nav__sublink">{c}</Link>
                ))}
              </div>
            </div>
            <div className="flat-nav__item">
              <span className="flat-nav__link">Страницы <ChevronDown size={14} /></span>
              <div className="flat-nav__submenu">
                <Link href="/cart" className="flat-nav__sublink">Корзина</Link>
                <Link href="/checkout" className="flat-nav__sublink">Оформление</Link>
                <Link href="/about" className="flat-nav__sublink">О нас</Link>
                <Link href="/contacts" className="flat-nav__sublink">Контакты</Link>
                <Link href="/faq" className="flat-nav__sublink">FAQ</Link>
              </div>
            </div>
            <div className="flat-nav__item">
              <Link href="/about" className="flat-nav__link">О нас</Link>
            </div>
          </nav>

          <div className="flat-header__actions">
            <Link href="/shop" className="flat-icon-btn" title="Поиск">
              <Search size={20} />
            </Link>
            <button className="flat-icon-btn" title="Аккаунт">
              <User size={20} />
            </button>
            <Link href="/cart" className="flat-icon-btn" title="Корзина">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="flat-cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Info strip */}
      <div className="flat-info" style={{ padding: "16px 0", gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="flat-container" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          <div className="flat-info__item">
            <div className="flat-info__icon"><Truck size={20} /></div>
            <div><div className="flat-info__title">Доставка</div><div className="flat-info__text">В день заказа</div></div>
          </div>
          <div className="flat-info__item">
            <div className="flat-info__icon"><Shield size={20} /></div>
            <div><div className="flat-info__title">Гарантия</div><div className="flat-info__text">ГОСТ качество</div></div>
          </div>
          <div className="flat-info__item">
            <div className="flat-info__icon"><Headphones size={20} /></div>
            <div><div className="flat-info__title">Поддержка</div><div className="flat-info__text">24/7 онлайн</div></div>
          </div>
          <div className="flat-info__item">
            <div className="flat-info__icon"><Phone size={20} /></div>
            <div><div className="flat-info__title">+7 (495) 000-00-00</div><div className="flat-info__text">Звоните бесплатно</div></div>
          </div>
        </div>
      </div>
    </>
  );
}

export function FlatFooter() {
  return (
    <footer className="flat-footer">
      <div className="flat-container">
        <div className="flat-footer__grid">
          <div>
            <div className="flat-logo" style={{ color: "#fff", marginBottom: 12 }}>Flat<span>Store</span></div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.6, maxWidth: 280 }}>
              Интернет-магазин строительных материалов. Металлопрокат и сыпучие материалы с доставкой по Москве и области.
            </p>
          </div>
          <div>
            <h4 className="flat-footer__title">Каталог</h4>
            <Link href="/shop" className="flat-footer__link">Все товары</Link>
            <Link href="/shop?cat=Металлопрокат" className="flat-footer__link">Металлопрокат</Link>
            <Link href="/shop?cat=Сыпучие" className="flat-footer__link">Сыпучие материалы</Link>
          </div>
          <div>
            <h4 className="flat-footer__title">Информация</h4>
            <Link href="/about" className="flat-footer__link">О нас</Link>
            <Link href="/contacts" className="flat-footer__link">Контакты</Link>
            <Link href="/faq" className="flat-footer__link">FAQ</Link>
            <Link href="/delivery" className="flat-footer__link">Доставка</Link>
          </div>
          <div>
            <h4 className="flat-footer__title">Контакты</h4>
            <a href="tel:+74950000000" className="flat-footer__link">+7 (495) 000-00-00</a>
            <a href="mailto:info@flatstore.ru" className="flat-footer__link">info@flatstore.ru</a>
            <div className="flat-footer__link" style={{ cursor: "default" }}>
              <MapPin size={12} style={{ display: "inline", marginRight: 4 }} /> Москва, склад
            </div>
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
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
          {i < items.length - 1 && <span className="flat-breadcrumbs__sep">/</span>}
        </span>
      ))}
    </div>
  );
}
