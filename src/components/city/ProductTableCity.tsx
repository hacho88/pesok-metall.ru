"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { productImageSrc } from "@/lib/product-image";
import { pricePerTon, type StorefrontProduct } from "@/lib/theme-storefront";
import { cn } from "@/lib/utils";

const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

export function ProductTableCity({ products }: { products: StorefrontProduct[] }) {
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        (p.gost ?? "").toLowerCase().includes(q)
    );
  }, [products, query]);

  const cartCount = Object.values(cart).reduce((s, n) => s + n, 0);

  function addToCart(p: StorefrontProduct) {
    if (p.price == null || p.isOnOrder) return;
    const n = qty[p.id] ?? 1;
    setCart((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + n }));
  }

  return (
    <section id="price" className="border-b border-[#3A4454] bg-[#14181E] py-16 text-[#F5F7FA]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 border border-[#FF3B1F] bg-[#FF3B1F]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#FF3B1F]">
              Прайс-лист
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
              Каталог со склада
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Фильтр: арматура, труба, ГОСТ..."
              className="h-11 w-full border border-[#3A4454] bg-[#1B2129] px-4 font-mono text-sm font-semibold text-[#F5F7FA] placeholder:text-[#9AA5B5]/50 focus:border-[#FF3B1F] focus:outline-none sm:w-72"
            />
            <span className="hidden shrink-0 text-xs font-black uppercase tracking-widest text-[#9AA5B5] sm:block">
              {filtered.length} поз.
            </span>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto border border-[#3A4454] bg-[#1B2129] md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#3A4454] bg-[#232B36]">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#9AA5B5]">Фото</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#9AA5B5]">Наименование</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#9AA5B5]">ГОСТ</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#9AA5B5]">₽/метр</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#9AA5B5]">₽/тонна</th>
                <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-[#9AA5B5]">Кол-во</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#9AA5B5]">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A4454]/60">
              {filtered.map((p) => {
                const perTon = pricePerTon(p);
                const n = qty[p.id] ?? 1;
                const inCart = (cart[p.id] ?? 0) > 0;
                const img = productImageSrc(p.imageLocal, p.imageUrl);
                return (
                  <tr key={p.id} className="transition-colors hover:bg-[#232B36]/60">
                    <td className="px-4 py-2.5">
                      <div className="relative h-12 w-12 overflow-hidden border border-[#3A4454] bg-[#14181E]">
                        {img ? (
                          <Image src={img} alt={p.name} fill className="object-contain p-1" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-base font-black text-[#9AA5B5]/30">
                            {p.categoryName.slice(0, 1)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-sm font-bold">{p.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA5B5]">{p.categoryName}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-xs font-bold text-[#FF3B1F]">{p.gost ?? "ГОСТ"}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {p.price != null ? (
                        <span className="text-sm font-black">{fmt(p.price)} ₽</span>
                      ) : (
                        <span className="text-xs font-bold text-[#9AA5B5]">под заказ</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {perTon != null ? (
                        <span className="text-sm font-black text-[#FF3B1F]">{fmt(perTon)} ₽</span>
                      ) : (
                        <span className="text-xs text-[#9AA5B5]/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="mx-auto flex w-fit items-center border border-[#3A4454] bg-[#14181E]">
                        <button
                          type="button"
                          onClick={() => setQty((q) => ({ ...q, [p.id]: Math.max(1, n - 1) }))}
                          className="p-2 text-[#9AA5B5] transition-colors hover:text-[#FF3B1F]"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          value={n}
                          onChange={(e) => setQty((q) => ({ ...q, [p.id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                          className="w-12 border-x border-[#3A4454] bg-transparent text-center font-mono text-sm font-bold outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setQty((q) => ({ ...q, [p.id]: n + 1 }))}
                          className="p-2 text-[#9AA5B5] transition-colors hover:text-[#FF3B1F]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => addToCart(p)}
                        disabled={p.isOnOrder || p.price == null}
                        className={cn(
                          "inline-flex h-10 items-center gap-1.5 px-4 text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40",
                          inCart ? "bg-green-600 text-white" : "bg-[#FF3B1F] text-white hover:bg-[#e02f15]"
                        )}
                      >
                        {inCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                        {inCart ? `В заказе: ${cart[p.id]}` : "В заказ"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="grid gap-3 md:hidden">
          {filtered.map((p) => {
            const perTon = pricePerTon(p);
            const n = qty[p.id] ?? 1;
            const inCart = (cart[p.id] ?? 0) > 0;
            const img = productImageSrc(p.imageLocal, p.imageUrl);
            return (
              <div key={p.id} className="border border-[#3A4454] bg-[#1B2129] p-4">
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-[#3A4454] bg-[#14181E]">
                    {img ? (
                      <Image src={img} alt={p.name} fill className="object-contain p-1" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-black text-[#9AA5B5]/30">
                        {p.categoryName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-snug">{p.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] font-bold text-[#FF3B1F]">{p.gost ?? "ГОСТ"}</p>
                    <div className="mt-1.5 flex gap-3 text-xs font-bold">
                      {p.price != null && <span>{fmt(p.price)} ₽/м</span>}
                      {perTon != null && <span className="text-[#FF3B1F]">{fmt(perTon)} ₽/т</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center border border-[#3A4454] bg-[#14181E]">
                    <button type="button" onClick={() => setQty((q) => ({ ...q, [p.id]: Math.max(1, n - 1) }))} className="p-2.5 text-[#9AA5B5]">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono text-sm font-bold">{n}</span>
                    <button type="button" onClick={() => setQty((q) => ({ ...q, [p.id]: n + 1 }))} className="p-2.5 text-[#9AA5B5]">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(p)}
                    disabled={p.isOnOrder || p.price == null}
                    className={cn(
                      "h-11 flex-1 text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-40",
                      inCart ? "bg-green-600 text-white" : "bg-[#FF3B1F] text-white"
                    )}
                  >
                    {inCart ? `В заказе: ${cart[p.id]}` : "В заказ"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="border border-dashed border-[#3A4454] py-16 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#9AA5B5]">
              По запросу «{query}» ничего не найдено
            </p>
          </div>
        )}

        {/* Cart summary */}
        {cartCount > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border border-[#FF3B1F] bg-[#232B36] p-5 sm:flex-row">
            <p className="text-sm font-black uppercase tracking-widest">
              В заказе: <span className="text-[#FF3B1F]">{cartCount} поз.</span>
            </p>
            <a
              href="tel:+74950000000"
              className="h-12 bg-[#FF3B1F] px-8 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#e02f15]"
            >
              Оформить по телефону
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
