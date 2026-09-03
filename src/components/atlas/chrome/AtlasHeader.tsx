"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Phone, ShoppingCart, Menu, X, ChevronDown, Grid3x3, Clock, Mail, PhoneCall } from "lucide-react";
import type { AtlasConfig } from "@/lib/atlas/config-schema";
import type { AtlasCategoryNode } from "@/lib/atlas/catalog";
import { useCartStore } from "../checkout/cart-store";
import { AtlasSearch } from "./AtlasSearch";
import { AtlasCityPicker } from "./AtlasCityPicker";
import { AtlasMobileDrawer } from "./AtlasMobileDrawer";
import { formatRub } from "@/lib/atlas/pricing";

export function AtlasHeader({
  config,
  zones,
  currentZone,
  tree,
}: {
  config: AtlasConfig;
  zones: { slug: string; name: string }[];
  currentZone: { slug: string; name: string } | null;
  tree?: AtlasCategoryNode[];
}) {
  const h = config.header;
  const cartStore = useCartStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartTotals = cartStore.totals();
  const megaMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const topCats = tree?.filter((n) => !n.parentId).slice(0, 8) ?? [];

  return (
    <>
      <header className="sticky top-0 z-40" style={{ background: "var(--atlas-surface)", boxShadow: scrolled ? "var(--atlas-shadow-sm)" : "none", transition: "box-shadow 0.2s ease" }}>
        {/* Top strip */}
        {h.topStrip.enabled && (
          <div className="hidden md:block" style={{ background: "var(--atlas-surface-2)", height: 36 }}>
            <div className="atlas-container flex items-center justify-between h-full text-xs" style={{ color: "var(--atlas-text-muted)" }}>
              <div className="flex items-center gap-4">
                {h.showCitySelector && (
                  <button
                    className="flex items-center gap-1 font-medium hover:text-[var(--atlas-primary)] transition-colors"
                    onClick={() => setCityPickerOpen(true)}
                  >
                    <MapPin size={14} />
                    Ваш город: {currentZone?.name || "Москва"}
                    <ChevronDown size={12} />
                  </button>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {h.workHours}
                </span>
                <a href={`mailto:${h.email}`} className="flex items-center gap-1 hover:text-[var(--atlas-primary)]">
                  <Mail size={14} />
                  {h.email}
                </a>
              </div>
              <nav className="flex items-center gap-4">
                {h.topStrip.links.map((link, i) => (
                  <a key={i} href={link.href} className="hover:text-[var(--atlas-primary)] transition-colors">
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main row */}
        <div className="atlas-container flex items-center gap-4 py-3" style={{ borderBottom: "1px solid var(--atlas-border)" }}>
          {/* Mobile burger */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ border: "1px solid var(--atlas-border)" }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Меню"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-lg"
              style={{ background: "var(--atlas-primary)" }}>
              ПМ
            </div>
            <span className="hidden sm:block font-bold text-lg" style={{ fontFamily: "var(--atlas-font-heading)" }}>
              {h.logoText}
            </span>
          </a>

          {/* Catalog button with mega-menu */}
          <div className="relative hidden md:block" ref={megaMenuRef}>
            <button
              className="atlas-btn atlas-btn-primary atlas-btn-sm"
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
            >
              <Grid3x3 size={18} />
              Каталог
              <ChevronDown size={14} className={`transition-transform ${megaMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mega menu */}
            {megaMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-[600px] rounded-xl p-5 atlas-fade-in" style={{ background: "var(--atlas-surface)", boxShadow: "var(--atlas-shadow-lg)", border: "1px solid var(--atlas-border)", zIndex: 50 }}>
                <div className="grid grid-cols-3 gap-3">
                  {topCats.map((cat) => (
                    <div key={cat.id} className="space-y-1">
                      <a
                        href={`/shop/${encodeURIComponent(cat.slug)}`}
                        className="block font-semibold text-sm hover:text-[var(--atlas-primary)] transition-colors pb-1"
                        style={{ borderBottom: "1px solid var(--atlas-border)" }}
                        onClick={() => setMegaMenuOpen(false)}
                      >
                        {cat.name}
                      </a>
                      {cat.children.slice(0, 5).map((sub) => (
                        <a
                          key={sub.id}
                          href={`/shop/${encodeURIComponent(sub.slug)}`}
                          className="block text-xs py-1 hover:text-[var(--atlas-primary)] transition-colors"
                          style={{ color: "var(--atlas-text-muted)" }}
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          {sub.name}
                          <span className="ml-1" style={{ color: "var(--atlas-text-muted)", opacity: 0.6 }}>({sub.totalProductCount})</span>
                        </a>
                      ))}
                      {cat.children.length > 5 && (
                        <a href={`/shop/${encodeURIComponent(cat.slug)}`} className="block text-xs font-medium pt-1 hover:text-[var(--atlas-primary)]" style={{ color: "var(--atlas-primary)" }}>
                          Все категории →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--atlas-border)" }}>
                  <a href="/shop" className="text-sm font-medium atlas-link-hover" style={{ color: "var(--atlas-primary)" }}>
                    Весь каталог →
                  </a>
                  <span className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>
                    {tree?.reduce((sum, c) => sum + c.totalProductCount, 0) ?? 0} товаров в наличии
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-[560px]">
            <AtlasSearch placeholder={h.searchPlaceholder} />
          </div>

          {/* Phone + callback */}
          <div className="hidden lg:flex flex-col items-end shrink-0">
            <a href={`tel:${h.phones[0]?.replace(/[^+\d]/g, "")}`} className="font-bold text-base flex items-center gap-1"
              style={{ color: "var(--atlas-text)" }}>
              <Phone size={16} style={{ color: "var(--atlas-primary)" }} />
              {h.phones[0]}
            </a>
            <button onClick={() => setCallbackOpen(true)} className="text-xs hover:text-[var(--atlas-primary)] transition-colors flex items-center gap-1" style={{ color: "var(--atlas-text-muted)" }}>
              <PhoneCall size={12} />
              Заказать звонок
            </button>
          </div>

          {/* Mobile search icon */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ border: "1px solid var(--atlas-border)" }}
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Поиск"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Cart */}
          {h.showCart && (
            <button
              className="flex items-center gap-2 px-3 h-10 rounded-lg shrink-0 transition-all hover:shadow-md relative"
              style={{ border: "1px solid var(--atlas-border)", background: "var(--atlas-surface)" }}
              onClick={() => cartStore.open()}
            >
              <div className="relative">
                <ShoppingCart size={20} style={{ color: "var(--atlas-primary)" }} />
                {cartTotals.itemsCount > 0 && (
                  <span
                    key={cartTotals.itemsCount}
                    className="atlas-bounce absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1"
                    style={{ background: "var(--atlas-primary)", color: "var(--atlas-primary-fg)" }}
                  >
                    {cartTotals.itemsCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:flex flex-col items-start leading-tight">
                {cartTotals.itemsCount > 0 ? (
                  <>
                    <span className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>
                      {cartTotals.itemsCount} тов.
                    </span>
                    <span className="font-bold text-sm atlas-price-main">
                      {formatRub(cartTotals.subtotal)} ₽
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-medium" style={{ color: "var(--atlas-text-muted)" }}>
                    Корзина
                  </span>
                )}
              </span>
            </button>
          )}
        </div>

        {/* Mobile search */}
        {mobileSearchOpen && (
          <div className="md:hidden px-6 pb-3">
            <AtlasSearch placeholder={h.searchPlaceholder} />
          </div>
        )}

        {/* Menu row */}
        {h.menu.length > 0 && (
          <div className="hidden md:block" style={{ borderTop: "1px solid var(--atlas-border)" }}>
            <nav className="atlas-container flex items-center gap-6 h-11 text-sm font-medium">
              {h.menu.map((item, i) => (
                <a key={i} href={item.href} className="hover:text-[var(--atlas-primary)] transition-colors flex items-center gap-1 atlas-link-hover"
                  style={{ color: "var(--atlas-text)" }}>
                  {item.label}
                  {item.children.length > 0 && <ChevronDown size={14} />}
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* Mobile catalog button */}
        <div className="md:hidden px-6 pb-3">
          <a href="/shop" className="atlas-btn atlas-btn-primary w-full">
            <Grid3x3 size={18} />
            Каталог
          </a>
        </div>
      </header>

      {/* Drawers and pickers */}
      <AtlasMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} config={h} zones={zones} />
      <AtlasCityPicker
        open={cityPickerOpen}
        onClose={() => setCityPickerOpen(false)}
        zones={zones}
        currentSlug={currentZone?.slug ?? null}
      />
      {callbackOpen && <CallbackModal phones={h.phones} onClose={() => setCallbackOpen(false)} />}
    </>
  );
}

function CallbackModal({ phones, onClose }: { phones: string[]; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!phone.trim()) return;
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Заказ звонка", phone, source: "callback" }),
      });
    } catch {}
    setSent(true);
    setTimeout(onClose, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 atlas-overlay-enter" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-xl p-6 atlas-fade-in" style={{ background: "var(--atlas-surface)" }} onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "color-mix(in srgb, var(--atlas-success) 12%, transparent)" }}>
              <PhoneCall size={32} style={{ color: "var(--atlas-success)" }} />
            </div>
            <p className="text-lg font-bold">Заявка принята!</p>
            <p className="text-sm mt-1" style={{ color: "var(--atlas-text-muted)" }}>Перезвоним в течение 15 минут</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-2">Заказать звонок</h3>
            <p className="text-sm mb-4" style={{ color: "var(--atlas-text-muted)" }}>
              Перезвоним в течение 15 минут в рабочее время
            </p>
            <div className="space-y-3">
              <input className="atlas-input" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="atlas-input" placeholder="+7 (___) ___-__-__" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <button className="atlas-btn atlas-btn-primary w-full atlas-btn-lg" onClick={submit} disabled={!phone.trim()}>
                <PhoneCall size={18} /> Жду звонка
              </button>
              <p className="text-xs text-center" style={{ color: "var(--atlas-text-muted)" }}>
                Или позвоните сами: <a href={`tel:${phones[0]?.replace(/[^+\d]/g, "")}`} className="font-medium" style={{ color: "var(--atlas-primary)" }}>{phones[0]}</a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
