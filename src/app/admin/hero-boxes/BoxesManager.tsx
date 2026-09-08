"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Info,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface BoxProduct {
  id: string;
  name: string;
  priceRetailBase: number | null;
  unit: string | null;
  type: string;
  imageUrl: string | null;
  imageLocal: string | null;
  categoryName: string;
}

const unitLabel = (p: BoxProduct) =>
  p.type === "BAG_30KG" ? "мешок" : p.type === "BIG_BAG_1TON" ? "биг-бег" : (p.unit ?? "шт");

function Thumb({ p }: { p: BoxProduct }) {
  const src = p.imageLocal || p.imageUrl;
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={p.name} className="h-12 w-12 shrink-0 rounded-xl border-2 object-cover" />
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-[10px] font-black text-muted-foreground/40">
      нет фото
    </div>
  );
}

export function BoxesManager({
  initialSelected,
  allProducts,
}: {
  initialSelected: BoxProduct[];
  allProducts: BoxProduct[];
}) {
  const [selected, setSelected] = useState<BoxProduct[]>(initialSelected);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedIds = useMemo(() => new Set(selected.map((p) => p.id)), [selected]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allProducts
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q))
      .slice(0, 12);
  }, [allProducts, query]);

  const add = (p: BoxProduct) => {
    if (selectedIds.has(p.id) || selected.length >= 16) return;
    setSelected((s) => [...s, p]);
    setSaved(false);
  };

  const remove = (id: string) => {
    setSelected((s) => s.filter((p) => p.id !== id));
    setSaved(false);
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...selected];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSelected(next);
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/hero-boxes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selected.map((p) => p.id) }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json();
        setError(data.error || "Не удалось сохранить");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      {/* Поиск и добавление */}
      <div className="flex max-h-[70vh] flex-col rounded-3xl border-2 bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Добавить товар</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
            {selected.length}/16
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            className="h-11 rounded-xl border-2 pl-9 font-bold"
            placeholder="Поиск товара…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
          {results.map((p) => {
            const added = selectedIds.has(p.id);
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border-2 border-transparent p-2 transition-colors hover:border-primary/20 hover:bg-accent/50"
              >
                <Thumb p={p} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    {p.categoryName}
                    {p.priceRetailBase != null ? ` · ${p.priceRetailBase} ₽/${unitLabel(p)}` : " · под заказ"}
                  </p>
                </div>
                <button
                  disabled={added || selected.length >= 16}
                  title={added ? "Уже добавлен" : "Добавить в боксы"}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-all hover:scale-110 disabled:opacity-25 disabled:hover:scale-100"
                  onClick={() => add(p)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          {results.length === 0 && (
            <p className="py-8 text-center text-sm font-bold text-muted-foreground/40">Ничего не найдено</p>
          )}
        </div>
      </div>

      {/* Выбранные боксы */}
      <div className="flex max-h-[70vh] flex-col rounded-3xl border-2 bg-card p-5">
        <div className="flex items-center justify-between gap-3 border-b pb-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Порядок боксов ({selected.length})
          </h2>
          <Button
            className="h-10 rounded-xl bg-primary px-6 font-black shadow-lg shadow-primary/20"
            onClick={save}
            disabled={saving}
          >
            {saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saved ? "СОХРАНЕНО" : saving ? "СОХРАНЕНИЕ…" : "СОХРАНИТЬ"}
          </Button>
        </div>

        {selected.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
            <Info className="h-6 w-6 text-muted-foreground/40" />
            <p className="text-sm font-bold text-muted-foreground">
              Список пуст — на главной автоматически показываются товары из «Сыпучих материалов»
            </p>
            <p className="text-xs text-muted-foreground/70">
              Добавьте товары слева, чтобы закрепить их в боксах вручную
            </p>
          </div>
        ) : (
          <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
            {selected.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border-2 p-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">
                  {i + 1}
                </span>
                <Thumb p={p} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    {p.categoryName}
                    {p.priceRetailBase != null ? ` · ${p.priceRetailBase} ₽/${unitLabel(p)}` : " · под заказ"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    disabled={i === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-accent disabled:opacity-20"
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={i === selected.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-accent disabled:opacity-25"
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    title="Убрать из боксов"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                    onClick={() => remove(p.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">{error}</p>
        )}
      </div>
    </div>
  );
}
