"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Crosshair, Flame, Radar, Zap } from "lucide-react";
import type { ProductCardData } from "@/components/blocks/ProductGridCards";
import { formatRubles } from "@/lib/calculator";
import { productImageSrc } from "@/lib/product-image";
import { cn } from "@/lib/utils";

/**
 * Концепция «Arena»: Market Board / LIVE SUPPLY BOARD.
 * Товары выводятся как «арена-карточки» с номером позиции, статусом
 * READY / ON REQUEST, ценой-табло и микро-атрибутами (ГОСТ/вес/длина).
 * Используются только реальные товары из БД (ProductCardData).
 */
type ArenaFilter = "all" | "metal" | "bulk" | "in" | "order";

const FILTERS: { id: ArenaFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "metal", label: "Металл" },
  { id: "bulk", label: "Песок / Щебень" },
  { id: "in", label: "В наличии" },
  { id: "order", label: "Под заказ" },
];

function isBulk(p: ProductCardData): boolean {
  return p.type === "BAG_30KG" || p.type === "BIG_BAG_1TON" || /песок|щебень|керамзит|грунт/i.test(`${p.name} ${p.categoryName}`);
}

export function ArenaProductGrid({ products }: { products: ProductCardData[] }) {
  const [filter, setFilter] = useState<ArenaFilter>("all");

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (filter === "metal" && isBulk(p)) return false;
        if (filter === "bulk" && !isBulk(p)) return false;
        if (filter === "in" && p.isOnOrder) return false;
        if (filter === "order" && !p.isOnOrder) return false;
        return true;
      }),
    [products, filter]
  );

  if (products.length === 0) return null;

  return (
    <div className="arena-market">
      {/* LIVE SUPPLY BOARD — верхняя панель */}
      <div className="arena-board mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0c1017]/90">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-500">
              <Radar className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black uppercase tracking-[0.2em] text-white text-sm">
                  LIVE SUPPLY BOARD
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-lime-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Обновляется в реальном времени · {filtered.length} позиций на табло
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all",
                  filter === f.id
                    ? "border-orange-500 bg-orange-500 text-black shadow-lg shadow-orange-500/30"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Arena cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((p, i) => {
          const priceTon =
            p.price && p.weightKg && p.weightKg > 0 ? (p.price / p.weightKg) * 1000 : null;
          const gostAttr = p.attributes.find((a) => /гост|gost/i.test(a.key));
          const weightAttr = p.attributes.find((a) => /вес/i.test(a.key));
          const lengthAttr = p.attributes.find((a) => /длина/i.test(a.key));
          const microAttrs = [gostAttr, weightAttr, lengthAttr].filter(Boolean) as {
            key: string;
            value: string;
          }[];

          return (
            <article
              key={p.id}
              className="arena-card group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0e131b]/95 p-4 transition-all hover:-translate-y-1 hover:border-orange-500/60 hover:shadow-[0_0_40px_rgba(255,106,0,0.15)]"
            >
              {/* Верхняя линия: номер позиции + статус */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <Crosshair className="h-3 w-3 text-cyan-400" />
                  #{String(i + 1).padStart(3, "0")}
                </span>
                {p.isOnOrder ? (
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-300">
                    On Request
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-lime-400">
                    <span className="h-1 w-1 rounded-full bg-lime-400" />
                    Ready
                  </span>
                )}
              </div>

              {/* Фото в тёмной рамке */}
              <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-xl border border-white/5 bg-[#080b10]">
                {productImageSrc(p.imageLocal, p.imageUrl) ? (
                  <Image
                    src={productImageSrc(p.imageLocal, p.imageUrl)!}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-5xl font-black text-white/10">{p.categoryName.slice(0, 1)}</span>
                  </div>
                )}
                {!p.isOnOrder && (
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-orange-500 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-black shadow-lg shadow-orange-500/40">
                    <Flame className="h-2.5 w-2.5" />
                    Hit
                  </span>
                )}
              </div>

              {/* Название и категория */}
              <div className="flex flex-1 flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/80">
                  {p.categoryName}
                </span>
                <h4 className="mt-1 text-sm font-bold leading-snug text-white transition-colors group-hover:text-orange-400">
                  {p.name}
                </h4>

                {/* Микро-атрибуты */}
                {microAttrs.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {microAttrs.slice(0, 3).map((a) => (
                      <span
                        key={a.key}
                        className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-slate-400"
                      >
                        {a.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Цена-табло + CTA */}
              <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/10 pt-3">
                <div>
                  {p.isOnOrder ? (
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                      Цена по запросу
                    </span>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-xl font-black tabular-nums text-white">
                          {p.price ? formatRubles(p.price) : "—"}
                        </span>
                        <span className="text-[9px] font-black uppercase text-slate-500">{p.unit}</span>
                      </div>
                      {priceTon && (
                        <div className="font-mono text-[11px] font-bold tabular-nums text-cyan-400">
                          {formatRubles(priceTon)}/т
                        </div>
                      )}
                    </>
                  )}
                </div>
                <button
                  type="button"
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 text-[11px] font-black uppercase tracking-wider text-black shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:brightness-110 active:scale-95"
                >
                  <Zap className="h-3.5 w-3.5" />
                  В заказ
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
          <p className="text-sm font-bold text-white">На табло нет позиций по выбранному фильтру</p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-3 rounded-xl border border-orange-500/50 px-4 py-2 text-xs font-black uppercase tracking-wider text-orange-400 hover:bg-orange-500 hover:text-black"
          >
            Сбросить фильтр
          </button>
        </div>
      )}
    </div>
  );
}
