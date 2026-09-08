"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, CheckCircle2, Minus, Plus, Ruler, Scale, ShoppingCart, Truck } from "lucide-react";
import { productImageSrc } from "@/lib/product-image";
import { calcLineWeightKg, getUnitInfo, kgToTons } from "@/lib/product-units";
import { useCart } from "@/components/checkout/CartContext";
import { cn } from "@/lib/utils";

export interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  type: string;
  price: number | null;
  isOnOrder: boolean;
  unit: string | null;
  weightKg: number;
  inStock: boolean;
  imageUrl: string | null;
  imageLocal: string | null;
  groupName: string | null;
  length: string | null;
  weightLabel: string | null;
  attributes: { key: string; value: string }[];
}

const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

export function ProductDetail({
  product: p,
  related,
}: {
  product: ProductDetailData;
  related: ProductDetailData[];
}) {
  const { addItem, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [qtyMode, setQtyMode] = useState<"unit" | "ton">("unit");
  const [added, setAdded] = useState(false);
  const img = productImageSrc(p.imageLocal, p.imageUrl);
  const info = getUnitInfo(p.unit, p.weightKg, p.price, p.type, p.name);
  const available = !p.isOnOrder && p.price != null;

  // Количество в основных единицах (м/шт/кг) — при вводе в тоннах пересчитываем
  const qtyUnits = qtyMode === "ton" && info.isLinear && p.weightKg > 0
    ? Math.max(1, Math.round(((qty * 1000) / p.weightKg) * 10) / 10)
    : qty;
  const qtyTons = info.isLinear && p.weightKg > 0
    ? Math.round(((p.weightKg * qtyUnits) / 1000) * 1000) / 1000
    : null;

  // Точный вес строки и сумма
  const lineWeightKg = calcLineWeightKg(p.unit, p.weightKg, qtyUnits, p.type);
  const lineTotal = p.price != null ? Math.round(p.price * qtyUnits * 100) / 100 : null;

  function addToCart() {
    if (!available) return;
    addItem({
      productId: p.id,
      sku: p.slug,
      name: p.groupName || p.name,
      gost: p.attributes.find((a) => /гост|gost/i.test(a.key))?.value ?? null,
      unit: info.unit,
      quantity: qtyUnits,
      weightKg: p.weightKg,
      weightTons: kgToTons(lineWeightKg),
      pricePerUnit: p.price,
      lineTotal,
    });
    setAdded(true);
    setTimeout(() => setOpen(true), 350);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-primary">Главная</Link>
        <span>/</span>
        <Link href="/catalog" className="transition-colors hover:text-primary">Каталог</Link>
        <span>/</span>
        <Link href={`/metall/${p.categorySlug}`} className="transition-colors hover:text-primary">{p.categoryName}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Фото */}
        <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border bg-card">
          {img ? (
            <Image src={img} alt={p.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-8" />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl font-black text-muted-foreground/15">
              {p.categoryName.slice(0, 1)}
            </div>
          )}
          {p.inStock && available && (
            <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-green-500 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
              <Check className="h-3.5 w-3.5" strokeWidth={4} />
              В наличии
            </span>
          )}
        </div>

        {/* Информация */}
        <div className="flex flex-col">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{p.categoryName}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{p.groupName || p.name}</h1>
          <p className="mt-2 text-xs font-bold text-muted-foreground">
            Код товара: <span className="font-black text-foreground">{p.id.slice(-8).toUpperCase()}</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {info.weightLabel && (
              <span className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold">
                <Scale className="h-4 w-4 text-muted-foreground" />
                {info.weightLabel}
              </span>
            )}
            {p.length && (
              <span className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                {p.length}
              </span>
            )}
          </div>

          {p.attributes.length > 0 && (
            <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {p.attributes.map((a) => (
                <div key={a.key} className="rounded-2xl border border-border bg-card px-4 py-3">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{a.key}</dt>
                  <dd className="mt-0.5 text-sm font-bold">{a.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Цена и покупка */}
          <div className="mt-8 rounded-[2rem] border border-border bg-card p-6">
            {available ? (
              <>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <p className="text-4xl font-black tracking-tight">{fmt(p.price!)} ₽</p>
                    <p className="mt-1 text-sm font-bold text-muted-foreground">{info.priceLabel}</p>
                    {info.isLinear && info.pricePerTon != null && (
                      <p className="mt-2 text-sm font-black text-primary">
                        {fmt(info.pricePerTon)} ₽ <span className="text-xs font-bold text-muted-foreground">за тонну</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {/* Переключатель единиц ввода для линейного проката: м / т */}
                    {info.isLinear && (
                      <div className="flex overflow-hidden rounded-xl border-2 border-border bg-background text-xs font-black uppercase">
                        <button
                          type="button"
                          onClick={() => { setQtyMode("unit"); }}
                          className={cn("px-4 py-2 transition-colors", qtyMode === "unit" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
                        >
                          метры
                        </button>
                        <button
                          type="button"
                          onClick={() => { setQtyMode("ton"); }}
                          className={cn("px-4 py-2 transition-colors", qtyMode === "ton" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
                        >
                          тонны
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center overflow-hidden rounded-2xl border-2 border-border bg-background">
                        <button
                          type="button"
                          onClick={() => setQty((v) => Math.max(qtyMode === "ton" ? 0.1 : 1, Math.round((v - (qtyMode === "ton" ? 0.1 : 1)) * 10) / 10))}
                          className="p-3 transition-colors hover:bg-muted"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          min={qtyMode === "ton" ? 0.1 : 1}
                          step={qtyMode === "ton" ? 0.1 : 1}
                          value={qty}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setQty(isNaN(v) ? 1 : Math.max(qtyMode === "ton" ? 0.1 : 1, v));
                          }}
                          className="w-20 border-x-2 border-border bg-transparent text-center text-lg font-black outline-none"
                        />
                        <button type="button" onClick={() => setQty((v) => Math.round((v + (qtyMode === "ton" ? 0.1 : 1)) * 10) / 10)} className="p-3 transition-colors hover:bg-muted">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={addToCart}
                        className={cn(
                          "flex h-14 items-center gap-2 rounded-2xl px-6 text-sm font-black uppercase tracking-widest transition-all active:scale-95",
                          added ? "bg-green-500 text-white shadow-lg shadow-green-500/25" : "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110"
                        )}
                      >
                        {added ? <CheckCircle2 className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                        {added ? "В корзине" : "В корзину"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Итог строки: точный вес и сумма — как швейцарские часы */}
                <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-muted/60 p-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Вес заказа</p>
                    <p className="mt-0.5 text-lg font-black tabular-nums">
                      {lineWeightKg.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} кг
                      {qtyTons != null && <span className="ml-1.5 text-xs font-bold text-muted-foreground">({qtyTons.toLocaleString("ru-RU", { maximumFractionDigits: 3 })} т)</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Сумма</p>
                    <p className="mt-0.5 text-lg font-black tabular-nums">{lineTotal != null ? `${fmt(lineTotal)} ₽` : "—"}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-xl font-black uppercase tracking-widest text-muted-foreground">Под заказ</p>
                <p className="text-sm text-muted-foreground">Уточните наличие и цену — перезвоним за 5 минут</p>
              </div>
            )}
            <p className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs font-bold text-muted-foreground">
              <Truck className="h-4 w-4" />
              Доставка по Москве и МО в день заказа. Резка в размер — по запросу.
            </p>
          </div>
        </div>
      </div>

      {/* Похожие товары */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-black tracking-tight">Похожие товары</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((r) => {
              const rInfo = getUnitInfo(r.unit, r.weightKg, r.price, r.type, r.name);
              const rImg = productImageSrc(r.imageLocal, r.imageUrl);
              return (
                <Link
                  key={r.id}
                  href={`/metall/${r.slug}`}
                  className="group overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                >
                  <div className="relative aspect-square overflow-hidden bg-background">
                    {rImg ? (
                      <Image src={rImg} alt={r.name} fill sizes="(max-width: 768px) 50vw, 300px" className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl font-black text-muted-foreground/15">
                        {r.categoryName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 text-sm font-bold leading-snug">{r.groupName || r.name}</p>
                    {r.price != null && !r.isOnOrder ? (
                      <p className="mt-2 text-lg font-black">
                        {fmt(r.price)} ₽ <span className="text-[10px] font-bold text-muted-foreground">{rInfo.priceLabel}</span>
                      </p>
                    ) : (
                      <p className="mt-2 text-xs font-black uppercase tracking-widest text-muted-foreground">Под заказ</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
