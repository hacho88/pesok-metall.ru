"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Phone, ShoppingCart, Menu, X, ChevronDown, Grid3x3, Clock, Mail } from "lucide-react";
import type { AtlasConfig } from "@/lib/atlas/config-schema";
import { useCartStore } from "../checkout/cart-store";
import { AtlasSearch } from "./AtlasSearch";
import { AtlasCityPicker } from "./AtlasCityPicker";
import { AtlasMobileDrawer } from "./AtlasMobileDrawer";
import { formatRub } from "@/lib/atlas/pricing";

export function AtlasHeader({
  config,
  zones,
  currentZone,
}: {
  config: AtlasConfig;
  zones: { slug: string; name: string }[];
  currentZone: { slug: string; name: string } | null;
}) {
  const h = config.header;
  const cartStore = useCartStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const cartTotals = cartStore.totals();

  return (
    <>
      <header className="sticky top-0 z-40" style={{ background: "var(--atlas-surface)" }}>
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

          {/* Catalog button */}
          <a href="/catalog" className="hidden md:flex atlas-btn atlas-btn-primary atlas-btn-sm">
            <Grid3x3 size={18} />
            Каталог
          </a>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-[560px]">
            <AtlasSearch placeholder={h.searchPlaceholder} />
          </div>

          {/* Phone */}
          <div className="hidden lg:flex flex-col items-end shrink-0">
            <a href={`tel:${h.phones[0]?.replace(/[^+\d]/g, "")}`} className="font-bold text-base flex items-center gap-1"
              style={{ color: "var(--atlas-text)" }}>
              <Phone size={16} style={{ color: "var(--atlas-primary)" }} />
              {h.phones[0]}
            </a>
            <a href="/catalog" className="text-xs hover:text-[var(--atlas-primary)]" style={{ color: "var(--atlas-text-muted)" }}>
              Заказать звонок
            </a>
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
                <a key={i} href={item.href} className="hover:text-[var(--atlas-primary)] transition-colors flex items-center gap-1"
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
          <a href="/catalog" className="atlas-btn atlas-btn-primary w-full">
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
    </>
  );
}
