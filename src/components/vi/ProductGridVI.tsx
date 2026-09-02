"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { productImageSrc } from "@/lib/product-image";
import { pricePerTon, type StorefrontProduct } from "@/lib/theme-storefront";
import { cn } from "@/lib/utils";

const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

// Детерминированный псевдо-рейтинг по id товара
function ratingOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return 4.2 + (h % 8) / 10; // 4.2 – 4.9
}

export function ProductGridVI({ products }: { products: StorefrontProduct[] }) {
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 12);
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q)).slice(0, 12);
  }, [products, query]);

  const cartCount = Object.values(cart).reduce((s, n) => s + n, 0);

  function addToCart(p: StorefrontProduct) {
    if (p.price == null || p.isOnOrder) return;
    const n = qty[p.id] ?? 1;
    setCart((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + n }));
  }

  return (
    <section id="catalog" className="bg-gray-50 py-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-flex items-center rounded-full bg-orange-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#FF6B00]">
              Хиты продаж
            </span>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Популярные товары
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по каталогу..."
              className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#FF6B00] focus:outline-none sm:w-72"
            />
            <span className="hidden shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black text-gray-500 shadow-sm sm:block">
              {filtered.length} товаров
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => {
            const perTon = pricePerTon(p);
            const n = qty[p.id] ?? 1;
            const inCart = (cart[p.id] ?? 0) > 0;
            const img = productImageSrc(p.imageLocal, p.imageUrl);
            const rating = ratingOf(p.id);
            const available = p.price != null && !p.isOnOrder;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  {img ? (
                    <Image
                      src={img}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 300px"
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl font-black text-gray-200">
                      {p.categoryName.slice(0, 1)}
                    </div>
                  )}
                  {p.inStock && available && (
                    <span className="absolute left-3 top-3 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                      В наличии
                    </span>
                  )}
                  {!available && (
                    <span className="absolute left-3 top-3 rounded-full bg-gray-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                      Под заказ
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{p.categoryName}</p>
                  <Link href={`/metall/${p.slug}`} className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors hover:text-[#FF6B00]">
                    {p.name}
                  </Link>

                  {/* Rating */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "h-3.5 w-3.5",
                            s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-500">{rating.toFixed(1)}</span>
                    <span className="text-[10px] font-bold text-gray-400">· {100 + (ratingOf(p.id) * 37) % 900} отзывов</span>
                  </div>

                  <div className="mt-auto pt-4">
                    {available ? (
                      <p className="text-xl font-black tracking-tight text-gray-900">
                        {fmt(p.price!)} ₽
                        <span className="text-xs font-bold text-gray-400"> / {p.unit ?? "ед."}</span>
                      </p>
                    ) : (
                      <p className="text-sm font-black uppercase tracking-widest text-gray-400">Цена по запросу</p>
                    )}
                    {perTon != null && (
                      <p className="mt-0.5 text-[11px] font-bold text-[#FF6B00]">{fmt(perTon)} ₽/тонна</p>
                    )}

                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center rounded-xl border-2 border-gray-200 bg-white">
                        <button
                          type="button"
                          onClick={() => setQty((q) => ({ ...q, [p.id]: Math.max(1, n - 1) }))}
                          disabled={!available}
                          className="p-2.5 text-gray-400 transition-colors hover:text-[#FF6B00] disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-9 text-center text-sm font-black text-gray-900">{n}</span>
                        <button
                          type="button"
                          onClick={() => setQty((q) => ({ ...q, [p.id]: n + 1 }))}
                          disabled={!available}
                          className="p-2.5 text-gray-400 transition-colors hover:text-[#FF6B00] disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(p)}
                        disabled={!available}
                        className={cn(
                          "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40",
                          inCart ? "bg-green-500 text-white" : "bg-[#FF6B00] text-white hover:bg-[#e05a00]"
                        )}
                      >
                        {inCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                        {inCart ? `В корзине ${cart[p.id]}` : "В корзину"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-3xl border-4 border-dashed border-gray-200 py-20 text-center">
            <p className="text-lg font-black tracking-tight text-gray-700">Ничего не найдено</p>
            <p className="mt-2 text-sm text-gray-400">Попробуйте другой запрос</p>
          </div>
        )}

        {cartCount > 0 && (
          <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
            <button
              type="button"
              className="flex items-center gap-4 rounded-full bg-gray-900 p-2 pr-8 text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6B00] font-black">
                {cartCount}
              </span>
              <span className="text-sm font-black uppercase tracking-widest">Оформить заказ</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
