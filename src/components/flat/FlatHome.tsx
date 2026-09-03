"use client";

import Link from "next/link";
import { ArrowRight, Truck, Shield, Headphones, Phone, Package } from "lucide-react";
import "@/components/flat/flat.css";
import { FlatHeader, FlatFooter } from "./FlatChrome";
import { FlatProductCard } from "./FlatProductCard";
import type { StorefrontProduct } from "@/lib/theme-storefront";

export function FlatHome({ products }: { products: StorefrontProduct[] }) {
  const featured = products.slice(0, 8);
  const popular = products.slice(8, 16);
  const categories = Array.from(new Set(products.map((p) => p.categoryName))).slice(0, 6);

  return (
    <div className="flat-theme">
      <FlatHeader products={products} />

      {/* Hero */}
      <section className="flat-hero">
        <div className="flat-container flat-hero__grid">
          <div className="flat-fade-in">
            <h1 className="flat-hero__title">
              Стройматериалы <br /><span>с быстрой доставкой</span>
            </h1>
            <p className="flat-hero__text">
              Металлопрокат и сыпучие материалы по ГОСТ. Доставка по Москве и области в день заказа.
              Более 800 позиций в каталоге.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/shop" className="flat-btn flat-btn-primary flat-btn-lg">
                Перейти в каталог <ArrowRight size={18} />
              </Link>
              <Link href="/about" className="flat-btn flat-btn-outline flat-btn-lg">
                О компании
              </Link>
            </div>
          </div>
          <div className="flat-hero__image flat-fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 120, opacity: 0.8 }}>🏗️</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="flat-section">
        <div className="flat-container">
          <div className="flat-section__head">
            <h2 className="flat-section__title">Категории</h2>
            <Link href="/shop" className="flat-section__link">Все категории <ArrowRight size={14} /></Link>
          </div>
          <div className="flat-grid flat-grid-3">
            {categories.map((cat, i) => {
              const count = products.filter((p) => p.categoryName === cat).length;
              return (
                <Link key={cat} href={`/shop?cat=${encodeURIComponent(cat)}`} className="flat-card flat-fade-in" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16, animationDelay: `${i * 0.05}s` }}>
                  <div className="flat-info__icon" style={{ width: 56, height: 56 }}>
                    <Package size={28} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "var(--flat-dark)" }}>{cat}</div>
                    <div style={{ fontSize: 13, color: "var(--flat-text-muted)" }}>{count} товаров</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="flat-section" style={{ background: "var(--flat-bg-light)" }}>
        <div className="flat-container">
          <div className="flat-section__head">
            <h2 className="flat-section__title">Хиты продаж</h2>
            <Link href="/shop" className="flat-section__link">Все товары <ArrowRight size={14} /></Link>
          </div>
          <div className="flat-grid flat-grid-4">
            {featured.map((p) => <FlatProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Info strip */}
      <section className="flat-section">
        <div className="flat-container">
          <div className="flat-info">
            <div className="flat-info__item">
              <div className="flat-info__icon"><Truck size={20} /></div>
              <div><div className="flat-info__title">Быстрая доставка</div><div className="flat-info__text">В день заказа по Москве</div></div>
            </div>
            <div className="flat-info__item">
              <div className="flat-info__icon"><Shield size={20} /></div>
              <div><div className="flat-info__title">Гарантия ГОСТ</div><div className="flat-info__text">Сертифицированные материалы</div></div>
            </div>
            <div className="flat-info__item">
              <div className="flat-info__icon"><Headphones size={20} /></div>
              <div><div className="flat-info__title">Поддержка 24/7</div><div className="flat-info__text">Помощь в любое время</div></div>
            </div>
            <div className="flat-info__item">
              <div className="flat-info__icon"><Phone size={20} /></div>
              <div><div className="flat-info__title">+7 (495) 000-00-00</div><div className="flat-info__text">Бесплатная консультация</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular */}
      <section className="flat-section">
        <div className="flat-container">
          <div className="flat-section__head">
            <h2 className="flat-section__title">Популярные товары</h2>
            <Link href="/shop" className="flat-section__link">Смотреть все <ArrowRight size={14} /></Link>
          </div>
          <div className="flat-grid flat-grid-4">
            {popular.map((p) => <FlatProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="flat-section" style={{ background: "var(--flat-dark)", color: "#fff" }}>
        <div className="flat-container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Нужна консультация?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 24, maxWidth: 500, margin: "0 auto 24px" }}>
            Наши менеджеры помогут подобрать материалы и рассчитают стоимость доставки
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:+74950000000" className="flat-btn flat-btn-primary flat-btn-lg">
              <Phone size={18} /> Позвонить
            </a>
            <Link href="/shop" className="flat-btn flat-btn-outline flat-btn-lg" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
              Перейти в каталог
            </Link>
          </div>
        </div>
      </section>

      <FlatFooter />
    </div>
  );
}
