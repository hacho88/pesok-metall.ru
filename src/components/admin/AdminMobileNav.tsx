"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/app/admin/nav-items";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-md lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-jakarta text-xl font-black text-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">П</span>
          <span className="text-sm">ПЕСОК-МЕТАЛЛ</span>
        </Link>
        <button
          type="button"
          aria-label="Меню"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Шторка */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r bg-card shadow-xl transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b px-4">
            <span className="font-jakarta text-sm font-black uppercase tracking-wider text-muted-foreground">
              Разделы админки
            </span>
            <button
              type="button"
              aria-label="Закрыть"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {adminNavItems.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-95",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
    </>
  );
}
