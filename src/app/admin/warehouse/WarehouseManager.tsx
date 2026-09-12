"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2, Save, PackageX, CheckCircle2, TrendingUp, ShoppingCart, Trash2, Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface WarehouseProduct {
  id: string;
  name: string;
  type: string;
  unit: string | null;
  stock: number;
  priceRetailBase: string | null;
  priceCost: string | null;
  isOnOrder: boolean;
  image: string | null;
  density: string | null;
}

interface WarehouseGroup {
  id: string;
  name: string;
  products: WarehouseProduct[];
}

interface Sale {
  id: string;
  productId: string;
  qty: number;
  unit: string;
  costPrice: number;
  sellPrice: number;
  totalSell: number;
  profit: number;
  createdAt: string;
  product: { id: string; name: string; unit: string | null };
}

interface DayTotals {
  qty: number;
  totalCost: number;
  totalSell: number;
  profit: number;
}

const GROUP_COLORS: Record<string, string> = {
  "Песок": "bg-amber-500",
  "Керамзит": "bg-orange-600",
  "Щебень": "bg-slate-500",
};

function fmt(n: number) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
}

export function WarehouseManager({ groups }: { groups: WarehouseGroup[] }) {
  const [items, setItems] = useState<
    Record<string, { stock: string; priceCost: string; priceRetail: string }>
  >(() => {
    const init: Record<string, { stock: string; priceCost: string; priceRetail: string }> = {};
    for (const g of groups)
      for (const p of g.products)
        init[p.id] = {
          stock: String(p.stock),
          priceCost: p.priceCost ?? "",
          priceRetail: p.priceRetailBase ?? "",
        };
    return init;
  });

  const [sellQty, setSellQty] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [totals, setTotals] = useState<DayTotals>({ qty: 0, totalCost: 0, totalSell: 0, profit: 0 });
  const [loadingSales, setLoadingSales] = useState(true);

  const loadSales = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/warehouse/sales");
      if (res.ok) {
        const data = await res.json();
        setSales(data.sales);
        setTotals(data.totals);
      }
    } finally {
      setLoadingSales(false);
    }
  }, []);

  useEffect(() => { loadSales(); }, [loadSales]);

  const save = async (p: WarehouseProduct) => {
    const cur = items[p.id];
    if (!cur) return;
    setSavingId(p.id);
    setError(null);
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock: Number(cur.stock) || 0,
          priceCost: cur.priceCost === "" ? null : Number(cur.priceCost),
          priceRetailBase: cur.priceRetail === "" ? null : Number(cur.priceRetail),
        }),
      });
      if (res.ok) {
        setSavedId(p.id);
        setTimeout(() => setSavedId(null), 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Не удалось сохранить");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setSavingId(null);
    }
  };

  const recordSale = async (p: WarehouseProduct) => {
    const qty = Number(sellQty[p.id]);
    if (!qty || qty <= 0) { setError("Укажите количество для продажи"); return; }
    setSellingId(p.id);
    setError(null);
    try {
      const cur = items[p.id];
      const res = await fetch("/api/admin/warehouse/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: p.id, qty, unit: p.unit || "шт",
          costPrice: Number(cur?.priceCost) || 0,
          sellPrice: Number(cur?.priceRetail) || 0,
        }),
      });
      if (res.ok) {
        setSellQty((s) => ({ ...s, [p.id]: "" }));
        setItems((s) => ({
          ...s,
          [p.id]: { ...s[p.id], stock: String(Math.max(0, Number(s[p.id].stock) - Math.round(qty))) },
        }));
        await loadSales();
      } else {
        const data = await res.json();
        setError(data.error || "Не удалось записать продажу");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setSellingId(null);
    }
  };

  const deleteSale = async (sale: Sale) => {
    if (!confirm(`Отменить продажу «${sale.product.name}» ×${sale.qty}?`)) return;
    try {
      const res = await fetch(`/api/admin/warehouse/sales?id=${sale.id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((s) => ({
          ...s,
          [sale.productId]: {
            ...s[sale.productId],
            stock: String(Number(s[sale.productId]?.stock ?? 0) + Math.round(sale.qty)),
          },
        }));
        await loadSales();
      }
    } catch {
      setError("Ошибка сети");
    }
  };

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-16 text-center">
        <PackageX className="h-12 w-12 text-muted-foreground/40" />
        <p className="mt-4 text-lg font-black">Категории склада не найдены</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Создайте категории «Песок», «Керамзит» и «Щебень» в разделе Каталог
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">{error}</p>
      )}

      {/* Дневная статистика */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border-2 bg-card p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <ShoppingCart className="h-3.5 w-3.5" /> Продано сегодня
          </div>
          <p className="mt-2 text-3xl font-black">{fmt(totals.qty)}</p>
          <p className="text-xs font-bold text-muted-foreground">единиц</p>
        </div>
        <div className="rounded-3xl border-2 bg-card p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <Coins className="h-3.5 w-3.5" /> Выручка
          </div>
          <p className="mt-2 text-3xl font-black">{fmt(totals.totalSell)} ₽</p>
          <p className="text-xs font-bold text-muted-foreground">себест. {fmt(totals.totalCost)} ₽</p>
        </div>
        <div className="rounded-3xl border-2 border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
            <TrendingUp className="h-3.5 w-3.5" /> Прибыль
          </div>
          <p className={cn("mt-2 text-3xl font-black", totals.profit >= 0 ? "text-primary" : "text-red-600")}>
            {fmt(totals.profit)} ₽
          </p>
          <p className="text-xs font-bold text-muted-foreground">за сегодня</p>
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.id} className="overflow-hidden rounded-3xl border-2 bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b px-5 py-4">
            <span className={cn("h-3 w-3 rounded-full", GROUP_COLORS[group.name] ?? "bg-primary")} />
            <h2 className="text-lg font-black tracking-tight">{group.name}</h2>
            <span className="ml-auto text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {group.products.length} поз.
            </span>
          </div>

          {group.products.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">Нет товаров в этой категории</p>
          ) : (
            <div className="divide-y">
              {group.products.map((p) => {
                const cur = items[p.id];
                const dirty =
                  cur &&
                  (Number(cur.stock) !== p.stock ||
                    cur.priceCost !== (p.priceCost ?? "") ||
                    cur.priceRetail !== (p.priceRetailBase ?? ""));
                const margin =
                  cur && cur.priceCost && cur.priceRetail
                    ? Number(cur.priceRetail) - Number(cur.priceCost)
                    : null;
                return (
                  <div key={p.id} className="px-5 py-4 transition-colors hover:bg-muted/40">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Фото */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/30">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <PackageX className="h-5 w-5 text-muted-foreground/30" />
                        )}
                      </div>

                      {/* Название */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{p.name}</p>
                        <p className="text-[11px] font-medium text-muted-foreground">
                          {p.unit ?? "шт"}
                          {margin !== null && (
                            <span className={cn("ml-2", margin >= 0 ? "text-green-600" : "text-red-600")}>
                              маржа {fmt(margin)} ₽
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Себестоимость */}
                      <div className="w-28">
                        <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          Себест.
                        </label>
                        <Input
                          type="number"
                          className="h-10 rounded-xl border-2 text-center font-bold"
                          placeholder="0"
                          value={cur?.priceCost ?? ""}
                          onChange={(e) =>
                            setItems((s) => ({
                              ...s,
                              [p.id]: { ...s[p.id], priceCost: e.target.value },
                            }))
                          }
                        />
                      </div>

                      {/* Цена продажи */}
                      <div className="w-28">
                        <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          Цена ₽
                        </label>
                        <Input
                          type="number"
                          className="h-10 rounded-xl border-2 text-center font-bold"
                          placeholder="0"
                          value={cur?.priceRetail ?? ""}
                          onChange={(e) =>
                            setItems((s) => ({
                              ...s,
                              [p.id]: { ...s[p.id], priceRetail: e.target.value },
                            }))
                          }
                        />
                      </div>

                      {/* Остаток */}
                      <div className="w-24">
                        <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          Остаток
                        </label>
                        <Input
                          type="number"
                          className="h-10 rounded-xl border-2 text-center font-bold"
                          value={cur?.stock ?? "0"}
                          onChange={(e) =>
                            setItems((s) => ({
                              ...s,
                              [p.id]: { ...s[p.id], stock: e.target.value },
                            }))
                          }
                        />
                      </div>

                      {/* Сохранить */}
                      <div className="flex items-end pb-0.5">
                        <Button
                          size="sm"
                          className={cn(
                            "h-10 rounded-xl font-black",
                            dirty ? "bg-primary" : "bg-muted text-muted-foreground"
                          )}
                          disabled={!dirty || savingId === p.id}
                          onClick={() => save(p)}
                        >
                          {savingId === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : savedId === p.id ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Строка продажи */}
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                      <ShoppingCart className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground">Продать:</span>
                      <Input
                        type="number"
                        className="h-9 w-24 rounded-lg border-2 text-center font-bold"
                        placeholder="0"
                        value={sellQty[p.id] ?? ""}
                        onChange={(e) =>
                          setSellQty((s) => ({ ...s, [p.id]: e.target.value }))
                        }
                      />
                      <span className="text-xs font-bold text-muted-foreground">{p.unit ?? "шт"}</span>
                      <Button
                        size="sm"
                        className="ml-auto h-9 rounded-lg bg-green-600 px-4 font-black text-white hover:bg-green-700"
                        disabled={sellingId === p.id || !sellQty[p.id]}
                        onClick={() => recordSale(p)}
                      >
                        {sellingId === p.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "ПРОДАТЬ"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ))}

      {/* История продаж за день */}
      <section className="overflow-hidden rounded-3xl border-2 bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-black tracking-tight">Продажи сегодня</h2>
          <span className="ml-auto text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {sales.length} записей
          </span>
        </div>
        {loadingSales ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sales.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">Сегодня продаж ещё не было</p>
        ) : (
          <div className="divide-y">
            {sales.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{s.product.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(s.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    {" · "}{s.qty} {s.unit} × {fmt(s.sellPrice)} ₽
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black">{fmt(s.totalSell)} ₽</p>
                  <p className={cn("text-[11px] font-bold", s.profit >= 0 ? "text-green-600" : "text-red-600")}>
                    +{fmt(s.profit)} ₽
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-lg p-0 text-red-500 hover:bg-red-50"
                  onClick={() => deleteSale(s)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
