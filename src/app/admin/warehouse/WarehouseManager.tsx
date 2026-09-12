"use client";

import { useState } from "react";
import { Loader2, Save, PackageX, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

const GROUP_COLORS: Record<string, string> = {
  "Песок": "bg-amber-500",
  "Керамзит": "bg-orange-600",
  "Щебень": "bg-slate-500",
};

export function WarehouseManager({ groups }: { groups: WarehouseGroup[] }) {
  const [items, setItems] = useState<Record<string, { stock: string; isOnOrder: boolean }>>(() => {
    const init: Record<string, { stock: string; isOnOrder: boolean }> = {};
    for (const g of groups) {
      for (const p of g.products) {
        init[p.id] = { stock: String(p.stock), isOnOrder: p.isOnOrder };
      }
    }
    return init;
  });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          isOnOrder: cur.isOnOrder,
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
                  cur && (Number(cur.stock) !== p.stock || cur.isOnOrder !== p.isOnOrder);
                return (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                  >
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
                        {p.priceRetailBase ? `${p.priceRetailBase} ₽/${p.unit ?? "шт"}` : "цена не задана"}
                        {p.density ? ` · ${p.density} т/м³` : ""}
                      </p>
                    </div>

                    {/* Остаток */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="h-10 w-24 rounded-xl border-2 text-center font-bold"
                        value={cur?.stock ?? "0"}
                        onChange={(e) =>
                          setItems((s) => ({
                            ...s,
                            [p.id]: { ...s[p.id], stock: e.target.value },
                          }))
                        }
                      />
                      <span className="w-8 text-xs font-bold text-muted-foreground">
                        {p.unit ?? "шт"}
                      </span>
                    </div>

                    {/* Под заказ */}
                    <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <Switch
                        checked={cur?.isOnOrder ?? false}
                        onCheckedChange={(v) =>
                          setItems((s) => ({
                            ...s,
                            [p.id]: { ...s[p.id], isOnOrder: v },
                          }))
                        }
                      />
                      Под заказ
                    </label>

                    {/* Сохранить */}
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
                );
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
