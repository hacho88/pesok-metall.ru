"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutTemplate,
  Menu,
  Package,
  Truck,
  Users,
  X,
  PenTool,
  FolderTree,
  BarChart3,
  ChevronRight,
  MapPin,
  Megaphone,
  Gavel,
  ShoppingCart,
  Home,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    title: "Управление",
    items: [
      { href: "/", label: "Дашборд", icon: Home },
      { href: "/categories", label: "Категории", icon: FolderTree },
      { href: "/products", label: "Товары", icon: Package },
      { href: "/orders", label: "Заказы", icon: ShoppingCart },
    ],
  },
  {
    title: "Контент",
    items: [
      { href: "/editor/home", label: "Конструктор", icon: LayoutTemplate },
      { href: "/blog", label: "AI Блог", icon: PenTool },
      { href: "/settings", label: "Баннеры и настройки", icon: Settings },
    ],
  },
  {
    title: "CRM и логистика",
    items: [
      { href: "/leads", label: "Клиенты", icon: Users },
      { href: "/fleet", label: "Автопарк", icon: Truck },
      { href: "/map-leads", label: "Лиды с карт", icon: MapPin },
    ],
  },
  {
    title: "Маркетинг",
    items: [
      { href: "/marketing", label: "Маркетинг", icon: BarChart3 },
      { href: "/advertising", label: "Реклама", icon: Megaphone },
      { href: "/tenders", label: "Тендеры", icon: Gavel },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="mb-4">
          <div className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            {section.title}
          </div>
          <div className="flex flex-col gap-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 font-bold",
                    active
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground hover:pl-5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

export function AdminNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Десктопный сайдбар */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 text-lg font-black tracking-tighter">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <Package className="h-6 w-6" />
            </div>
            <span>PESOK<span className="text-primary">.METALL</span></span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="p-4 border-t">
          <a
            href={SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between rounded-xl bg-muted/50 p-4 text-xs font-bold transition-all hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span>На сайт</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100" />
          </a>
        </div>
      </aside>

      {/* Мобильная шапка */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tighter">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Package className="h-5 w-5" />
          </div>
          <span>PESOK<span className="text-primary">.METALL</span></span>
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 text-muted-foreground"
          aria-label="Открыть меню"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Мобильный drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="flex h-full w-72 flex-col border-r bg-card shadow-2xl animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-6">
              <span className="text-lg font-black tracking-tighter">МЕНЮ</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-accent border-2"
                aria-label="Закрыть меню"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
              <NavLinks pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
            </nav>
            <div className="p-4 border-t">
              <a
                href={SITE_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl bg-muted/50 p-4 text-xs font-bold"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Открыть витрину</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
