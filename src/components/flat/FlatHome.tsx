"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Truck, ShieldCheck, Headphones, Package } from "lucide-react";
import "@/components/flat/flat.css";
import { FlatHeader, FlatFooter } from "./FlatChrome";
import { FlatProductCard } from "./FlatProductCard";
import type { StorefrontProduct } from "@/lib/theme-storefront";

const SLIDES = [
  {
    label: "Новая коллекция",
    title: "Стройматериалы\nот производителя",
    text: "Более 800 позиций в каталоге. Металлопрокат и сыпучие материалы с доставкой в день заказа.",
    icon: "🏗️",
    bg: "linear-gradient(135deg, #f0e6df 0%, #e8d9cd 100%)",
  },
  {
    label: "Хит сезона",
    title: "Металлопрокат\nпо ГОСТ",
    text: "Арматура, трубы, уголок, швеллер, лист. Сертифицированная продукция с гарантией качества.",
    icon: "⚙️",
    bg: "linear-gradient(135deg, #e8e0d5 0%, #ddd0c0 100%)",
  },
  {
    label: "Спецпредложение",
    title: "Сыпучие материалы\nс быстрой доставкой",
    text: "Песок, щебень, керамзит. Доставка самосвалами по Москве и области в день заказа.",
    icon: "🚛",
    bg: "linear-gradient(135deg, #f5e8de 0%, #ecd9c8 100%)",
  },
];

export function FlatHome({ products }: { products: StorefrontProduct[] }) {
  const [slide, setSlide] = useState(0);
  const featured = products.slice(0, 8);
  const popular = products.slice(8, 16);
  const categories = Array.from(new Set(products.map((p) => p.categoryName))).slice(0, 3);

  // Auto-rotate slides
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const catIcons: Record<string, string> = { "Металлопрокат": "⚙️", "Сыпучие материалы": "🏔️", "Дополнительные материалы": "📦" };

  return (
    <div className="flat-theme">
      <FlatHeader />

      {/* ===== HERO SLIDER ===== */}
      <section className="flat-hero">
        <div className="flat-container">
          <div className="flat-hero__slide" key={slide}>
            <div className="flat-hero__content flat-fade-in">
              <div className="flat-hero__label">{SLIDES[slide].label}</div>
              <h1 className="flat-hero__title">
                {SLIDES[slide].title.split("\n").map((line, i) => (
                  <span key={i}>{i === 1 ? <span>{line}</span> : <>{line}<br /></>}</span>
                ))}
              </h1>
              <p className="flat-hero__text">{SLIDES[slide].text}</p>
              <Link href="/shop" className="flat-btn flat-btn-primary flat-btn-lg">
                В каталог <ArrowRight size={18} />
              </Link>
            </div>
            <div className="flat-hero__image" style={{ background: SLIDES[slide].bg }}>
              <div className="flat-hero__image-inner">{SLIDES[slide].icon}</div>
            </div>
          </div>

          {/* Slide dots */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", paddingBottom: 32 }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                style={{
                  width: i === slide ? 32 : 10,
                  height: 10,
                  borderRadius: 5,
                  border: "none",
                  background: i === slide ? "var(--flat-primary)" : "var(--flat-gray-300)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== INFO STRIP ===== */}
      <div className="flat-container">
        <div className="flat-info">
          <div className="flat-info__item">
            <div className="flat-info__icon"><Truck size={24} /></div>
            <div>
              <div className="flat-info__title">Бесплатная доставка</div>
              <div className="flat-info__text">При заказе от 50 000 ₽</div>
            </div>
          </div>
          <div className="flat-info__item">
            <div className="flat-info__icon"><ShieldCheck size={24} /></div>
            <div>
              <div className="flat-info__title">Гарантия ГОСТ</div>
              <div className="flat-info__text">Сертифицированные материалы</div>
            </div>
          </div>
          <div className="flat-info__item">
            <div className="flat-info__icon"><Headphones size={24} /></div>
            <div>
              <div className="flat-info__title">Поддержка 24/7</div>
              <div className="flat-info__text">Помощь в любое время</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CATEGORIES ===== */}
      <section className="flat-section">
        <div className="flat-container">
          <div className="flat-section__head">
            <div className="flat-section__label">Каталог</div>
            <h2 className="flat-section__title">Категории товаров</h2>
          </div>
          <div className="flat-cats">
            {categories.map((cat, i) => {
              const count = products.filter((p) => p.categoryName === cat).length;
              return (
                <Link key={cat} href={`/shop?cat=${encodeURIComponent(cat)}`} className="flat-cat flat-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flat-cat__overlay" />
                  <div className="flat-cat__icon">{catIcons[cat] ?? "📦"}</div>
                  <div className="flat-cat__body">
                    <div className="flat-cat__name">{cat}</div>
                    <div className="flat-cat__count">{count} товаров →</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="flat-section flat-section--gray">
        <div className="flat-container">
          <div className="flat-section__head">
            <div className="flat-section__label">Новинки</div>
            <h2 className="flat-section__title">Новые поступления</h2>
            <p className="flat-section__sub">Свежие товары в нашем каталоге — качественные стройматериалы от проверенных поставщиков</p>
          </div>
          <div className="flat-products">
            {featured.map((p) => <FlatProductCard key={p.id} product={p} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/shop" className="flat-btn flat-btn-outline">Смотреть все <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ===== PROMO BANNERS ===== */}
      <section className="flat-section">
        <div className="flat-container">
          <div className="flat-banners">
            <div className="flat-banner flat-banner--large flat-banner--primary">
              <div className="flat-banner__label">Спецпредложение</div>
              <div className="flat-banner__title">Скидка до 30% на металлопрокат</div>
              <div className="flat-banner__text">При заказе от 100 000 ₽ — скидка на весь ассортимент металлопроката. Арматура, трубы, уголок и многое другое.</div>
              <Link href="/shop?cat=Металлопрокат" className="flat-btn flat-btn-white">Купить сейчас</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== POPULAR ===== */}
      <section className="flat-section flat-section--gray">
        <div className="flat-container">
          <div className="flat-section__head">
            <div className="flat-section__label">Хиты продаж</div>
            <h2 className="flat-section__title">Популярные товары</h2>
            <p className="flat-section__sub">Самые покупаемые товары наших клиентов — проверены временем и качеством</p>
          </div>
          <div className="flat-products">
            {popular.map((p) => <FlatProductCard key={p.id} product={p} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/shop" className="flat-btn flat-btn-outline">Все товары <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ===== PROMO BANNERS 2 ===== */}
      <section className="flat-section">
        <div className="flat-container">
          <div className="flat-banners">
            <div className="flat-banner flat-banner--dark">
              <div className="flat-banner__label">Онлайн-эксклюзив</div>
              <div className="flat-banner__title">Доставка в день заказа</div>
              <div className="flat-banner__text">При оформлении до 14:00 — доставка по Москве в тот же день. По Московской области — на следующий день.</div>
              <Link href="/delivery" className="flat-btn flat-btn-white">Подробнее</Link>
            </div>
            <div className="flat-banner flat-banner--warm">
              <div className="flat-banner__label">Распродажа</div>
              <div className="flat-banner__title">Сыпучие материалы со скидкой</div>
              <div className="flat-banner__text">Песок, щебень, керамзит — скидки до 20% при заказе от 20 тонн.</div>
              <Link href="/shop?cat=Сыпучие материалы" className="flat-btn flat-btn-dark">Заказать</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="flat-newsletter">
        <div className="flat-container">
          <h2 className="flat-newsletter__title">Подпишитесь на рассылку</h2>
          <p className="flat-newsletter__text">Получайте эксклюзивные предложения и промокоды. Подписка — скидка 10% на первый заказ.</p>
          <form className="flat-newsletter__form" onSubmit={(e) => e.preventDefault()}>
            <input className="flat-newsletter__input" type="email" placeholder="Ваш email" />
            <button type="submit" className="flat-btn flat-btn-primary">Подписаться</button>
          </form>
        </div>
      </section>

      <FlatFooter />
    </div>
  );
}
