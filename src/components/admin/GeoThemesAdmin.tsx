"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Save,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GeoZoneRow {
  id: string;
  slug: string;
  name: string;
  isRegion: boolean;
  deliveryTariffMultiplier: number;
  seoTitle: string | null;
  seoDescription: string | null;
  aiDescription: string | null;
  productCount: number;
  postCount: number;
}

interface GeoSeoPayload {
  seoTitle?: string;
  seoDescription?: string;
  aiDescription?: string;
  deliveryTariffMultiplier?: number;
}

export default function GeoThemesAdmin() {
  const [zones, setZones] = useState<GeoZoneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GeoZoneRow | null>(null);
  const [form, setForm] = useState<GeoSeoPayload>({});
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/geo-zones");
        const data = await res.json();
        setZones(data.zones ?? []);
      } catch {
        setError("Не удалось загрузить геозоны");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function selectZone(zone: GeoZoneRow) {
    setSelected(zone);
    setForm({
      seoTitle: zone.seoTitle ?? "",
      seoDescription: zone.seoDescription ?? "",
      aiDescription: zone.aiDescription ?? "",
      deliveryTariffMultiplier: zone.deliveryTariffMultiplier,
    });
    setMessage(null);
    setError(null);
  }

  async function saveZone() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/geo-zones?id=${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");
      setZones((prev) =>
        prev.map((z) => (z.id === selected.id ? { ...z, ...form } : z))
      );
      setSelected((prev) => (prev ? { ...prev, ...form } : prev));
      setMessage("Сохранено. Гео-страница обновится автоматически.");
    } catch (e: any) {
      setError(e.message ?? "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  async function generateSeo() {
    if (!selected) return;
    setGenerating(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/geo-zones/generate?id=${selected.id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка генерации");
      setForm({
        seoTitle: data.seoTitle ?? form.seoTitle,
        seoDescription: data.seoDescription ?? form.seoDescription,
        aiDescription: data.aiDescription ?? form.aiDescription,
        deliveryTariffMultiplier: form.deliveryTariffMultiplier,
      });
      setMessage("ИИ сгенерировал SEO-тексты для этой геозоны. Нажмите «Сохранить».");
    } catch (e: any) {
      setError(e.message ?? "Не удалось сгенерировать");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-jakarta">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/themes"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            К темам
          </Link>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight uppercase">
            <MapPin className="h-8 w-8 text-primary" />
            Геозоны и геотаргетинг
          </h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Для каждой зоны — свой SEO-текст, локальные цены и тариф доставки
          </p>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-2xl border border-green-300 bg-green-50 px-5 py-4 text-sm font-bold text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Список зон */}
        <div className="rounded-3xl border-2 border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Зоны ({zones.length})
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              МСК / МО
            </span>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-h-[70vh] space-y-1 overflow-y-auto pr-1">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => selectZone(zone)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all",
                    selected?.id === zone.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{zone.name}</p>
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      selected?.id === zone.id ? "opacity-70" : "text-muted-foreground"
                    )}>
                      {zone.productCount} товаров · {zone.postCount} статей
                    </p>
                  </div>
                  <span className={cn(
                    "ml-3 shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest",
                    selected?.id === zone.id ? "bg-white/20" : "bg-muted text-muted-foreground"
                  )}>
                    {zone.isRegion ? "МО" : "МСК"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Редактор зоны */}
        <div className="rounded-3xl border-2 border-border bg-card p-8">
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <MapPin className="mb-4 h-14 w-14 text-muted-foreground/20" />
              <p className="text-lg font-black uppercase tracking-tight">Выберите геозону</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Слева список районов Москвы и городов МО. Для каждой зоны свой SEO-текст,
                локальные цены и коэффициент доставки.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{selected.name}</h2>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    /geo/{selected.slug} · {selected.isRegion ? "город МО" : "район Москвы"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateSeo}
                  disabled={generating}
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-primary/30 bg-primary/10 px-5 py-3 text-sm font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white active:scale-95 disabled:opacity-60"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Сгенерировать ИИ
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    SEO Title (заголовок страницы)
                  </label>
                  <input
                    value={form.seoTitle ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                    placeholder="Металлопрокат, песок и щебень в Балашихе — доставка в день заказа"
                    className="h-13 w-full rounded-2xl border-2 border-border bg-background px-5 py-3.5 font-bold outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    SEO Description (описание для поисковиков)
                  </label>
                  <textarea
                    value={form.seoDescription ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                    rows={3}
                    placeholder="Купить металлопрокат, песок и щебень с доставкой в Балашиху в день заказа..."
                    className="w-full rounded-2xl border-2 border-border bg-background px-5 py-3.5 font-bold outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    SEO-текст для гео-страницы (виден на /geo/{selected.slug})
                  </label>
                  <textarea
                    value={form.aiDescription ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, aiDescription: e.target.value }))}
                    rows={8}
                    placeholder="Уникальный локализованный текст про доставку и стройматериалы в этом городе..."
                    className="w-full rounded-2xl border-2 border-border bg-background px-5 py-3.5 font-bold leading-relaxed outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Коэффициент доставки (геотаргетинг)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="3"
                      value={form.deliveryTariffMultiplier ?? 1}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, deliveryTariffMultiplier: Number(e.target.value) }))
                      }
                      className="h-13 w-full rounded-2xl border-2 border-border bg-background px-5 py-3.5 font-bold outline-none transition-colors focus:border-primary"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      ×{form.deliveryTariffMultiplier ?? 1} к базовому тарифу. Локальные цены
                      товаров пересчитываются автоматически.
                    </p>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="rounded-2xl border-2 border-dashed border-border p-5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Геотаргетинг
                      </p>
                      <p className="mt-2 text-sm font-bold">
                        {selected.productCount} товаров с локальными ценами
                      </p>
                      <p className="text-sm font-bold">
                        {selected.postCount} статей для этой зоны
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={saveZone}
                  disabled={saving}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-black uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Сохранить для {selected.name}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
