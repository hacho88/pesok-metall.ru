"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Loader2,
  MapPin,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { THEME_OPTIONS } from "@/lib/block-schemas";
import { cn } from "@/lib/utils";

interface CustomTheme {
  id: string;
  slug: string;
  name: string;
  isCustom: boolean;
  palette: Record<string, string | number>;
}

const DEFAULT_PALETTE = {
  background: "#0f1420",
  foreground: "#f1f5f9",
  card: "#151c2c",
  primary: "#f5a623",
  secondary: "#1c2436",
  muted: "#1c2436",
  mutedForeground: "#94a3b8",
  border: "#2a3550",
  radius: 12,
};

// Все готовые темы системы (из THEME_OPTIONS)
const BUILTIN_THEMES = THEME_OPTIONS;

export default function ThemesAdminPage() {
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>("industrial-orange");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Конструктор
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [themeName, setThemeName] = useState("");
  const [palette, setPalette] = useState(DEFAULT_PALETTE);

  useEffect(() => {
    (async () => {
      try {
        const [themesRes, homeRes] = await Promise.all([
          fetch("/api/themes"),
          fetch("/api/page-config?slug=home"),
        ]);
        const themesData = await themesRes.json();
        setCustomThemes(themesData.themes ?? []);
        if (homeRes.ok) {
          const home = await homeRes.json();
          if (home?.config?.theme) setActiveTheme(home.config.theme);
        }
      } catch {
        // БД недоступна
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function applyTheme(slug: string) {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/page-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: "home", theme: slug }),
      });
      if (!res.ok) throw new Error("Ошибка применения");
      setActiveTheme(slug);
      setMessage(`Тема применена к главной странице. Откройте / чтобы увидеть.`);
    } catch {
      setError("Не удалось применить тему");
    } finally {
      setSaving(false);
    }
  }

  async function createTheme() {
    if (!themeName.trim()) {
      setError("Укажите название темы");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: themeName, palette }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");
      setCustomThemes((prev) => [...prev, data.theme]);
      setCreatorOpen(false);
      setThemeName("");
      setPalette(DEFAULT_PALETTE);
      setMessage(`Тема «${data.theme.name}» создана. Примените её, чтобы увидеть на сайте.`);
    } catch (e: any) {
      setError(e.message ?? "Не удалось создать тему");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTheme(id: string) {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/themes?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Ошибка");
      }
      setCustomThemes((prev) => prev.filter((t) => t.id !== id));
      setMessage("Тема удалена");
    } catch (e: any) {
      setError(e.message ?? "Не удалось удалить тему");
    }
  }

  const paletteFields: { key: keyof typeof DEFAULT_PALETTE; label: string }[] = [
    { key: "background", label: "Фон страницы" },
    { key: "foreground", label: "Текст" },
    { key: "card", label: "Карточки" },
    { key: "primary", label: "Акцент (кнопки)" },
    { key: "secondary", label: "Вторичный" },
    { key: "muted", label: "Приглушённый" },
    { key: "mutedForeground", label: "Приглушённый текст" },
    { key: "border", label: "Границы" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10 font-jakarta">
      {/* Заголовок */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight uppercase">
            <Palette className="h-8 w-8 text-primary" />
            Темы оформления
          </h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Готовые темы + конструктор своих · применяются к главной странице
          </p>
        </div>
        <Link
          href="/admin/themes/geo"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-primary/30 bg-primary/10 px-5 py-3 text-sm font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white active:scale-95"
        >
          <MapPin className="h-4 w-4" />
          Геозоны и SEO
        </Link>
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

      {/* Готовые темы */}
      <section>
        <h2 className="mb-5 flex items-center gap-2 text-xl font-black uppercase tracking-tight">
          <Sparkles className="h-5 w-5 text-primary" />
          Готовые темы
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {BUILTIN_THEMES.map((theme) => {
            const isActive = activeTheme === theme.value;
            return (
              <div
                key={theme.value}
                className={cn(
                  "group overflow-hidden rounded-3xl border-2 bg-card transition-all hover:shadow-xl",
                  isActive ? "border-primary shadow-lg shadow-primary/10" : "border-border"
                )}
              >
                {/* Превью палитры */}
                <div className="relative h-36 overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{ background: theme.swatch[0] }}
                  >
                    <div className="absolute left-6 top-6 h-3 w-24 rounded-full" style={{ background: theme.swatch[2], opacity: 0.8 }} />
                    <div className="absolute left-6 top-14 h-2 w-32 rounded-full" style={{ background: theme.swatch[2], opacity: 0.3 }} />
                    <div className="absolute bottom-6 left-6 flex gap-2">
                      <span className="h-10 w-10 rounded-xl shadow-lg" style={{ background: theme.swatch[1] }} />
                      <span className="h-10 w-10 rounded-xl shadow-lg" style={{ background: theme.swatch[2], opacity: 0.15 }} />
                      <span className="h-10 w-10 rounded-xl shadow-lg" style={{ background: theme.swatch[2], opacity: 0.3 }} />
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
                      <Check className="h-5 w-5" strokeWidth={4} />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-black tracking-tight">{theme.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{theme.description}</p>
                  <button
                    type="button"
                    onClick={() => applyTheme(theme.value)}
                    disabled={saving || isActive}
                    className={cn(
                      "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50",
                      isActive
                        ? "bg-green-500 text-white"
                        : "bg-primary text-primary-foreground hover:brightness-110"
                    )}
                  >
                    {isActive ? (
                      <>
                        <Check className="h-4 w-4" /> Применена
                      </>
                    ) : (
                      <>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        Применить
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Свои темы */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
            <Wand2 className="h-5 w-5 text-primary" />
            Мои темы
          </h2>
          <button
            type="button"
            onClick={() => setCreatorOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Создать тему
          </button>
        </div>

        {/* Конструктор */}
        {creatorOpen && (
          <div className="mb-8 rounded-3xl border-2 border-primary/30 bg-card p-8">
            <h3 className="text-lg font-black uppercase tracking-tight">Конструктор темы</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Выберите цвета — тема применится ко всем блокам главной страницы.
            </p>

            <div className="mt-6">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Название темы
              </label>
              <input
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="Например: Мой складской стиль"
                className="h-13 w-full rounded-2xl border-2 border-border bg-background px-5 py-3.5 font-bold outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {paletteFields.map((field) => (
                <div key={field.key}>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {field.label}
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-border bg-background p-2">
                    <input
                      type="color"
                      value={String(palette[field.key])}
                      onChange={(e) => setPalette((p) => ({ ...p, [field.key]: e.target.value }))}
                      className="h-10 w-10 cursor-pointer rounded-xl border-0 bg-transparent"
                    />
                    <input
                      value={String(palette[field.key])}
                      onChange={(e) => setPalette((p) => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full bg-transparent font-mono text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              ))}
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Радиус скругления
                </label>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={Number(palette.radius)}
                  onChange={(e) => setPalette((p) => ({ ...p, radius: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
                <span className="text-xs font-bold text-muted-foreground">{palette.radius}px</span>
              </div>
            </div>

            {/* Превью */}
            <div className="mt-8">
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Предпросмотр
              </p>
              <div
                className="overflow-hidden rounded-3xl border-2 p-8"
                style={{
                  background: String(palette.background),
                  color: String(palette.foreground),
                  borderRadius: `${palette.radius}px`,
                  borderColor: String(palette.border),
                }}
              >
                <div
                  className="mb-4 inline-flex rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest"
                  style={{ background: String(palette.primary), color: String(palette.background) }}
                >
                  ВИНСОВХОЗ
                </div>
                <h4 className="text-2xl font-black tracking-tight">Заголовок блока</h4>
                <p className="mt-2 text-sm" style={{ color: String(palette.mutedForeground) }}>
                  Текст описания с приглушённым цветом для читаемости.
                </p>
                <div className="mt-5 flex gap-3">
                  <span
                    className="rounded-full px-6 py-2.5 text-sm font-black"
                    style={{ background: String(palette.primary), color: String(palette.background) }}
                  >
                    Кнопка
                  </span>
                  <span
                    className="rounded-full border-2 px-6 py-2.5 text-sm font-black"
                    style={{ borderColor: String(palette.border) }}
                  >
                    Вторая
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={createTheme}
                disabled={saving}
                className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Сохранить тему
              </button>
              <button
                type="button"
                onClick={() => setCreatorOpen(false)}
                className="rounded-2xl border-2 border-border px-6 py-4 text-sm font-black uppercase tracking-widest transition-colors hover:bg-muted"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Список своих тем */}
        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border-2 border-dashed border-border py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : customThemes.length === 0 && !creatorOpen ? (
          <div className="rounded-3xl border-2 border-dashed border-border py-16 text-center">
            <Wand2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-black uppercase tracking-tight">Своих тем пока нет</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Создайте тему по своему вкусу — она появится здесь
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customThemes.map((theme) => {
              const isActive = activeTheme === theme.slug;
              return (
                <div
                  key={theme.id}
                  className={cn(
                    "flex items-center gap-4 rounded-3xl border-2 bg-card p-5 transition-all",
                    isActive ? "border-primary shadow-lg shadow-primary/10" : "border-border"
                  )}
                >
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-lg"
                    style={{
                      background: String(theme.palette.primary ?? "#f5a623"),
                      color: String(theme.palette.background ?? "#0f1420"),
                    }}
                  >
                    <Palette className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-black tracking-tight">{theme.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {theme.slug}
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      {["background", "primary", "foreground"].map((k) => (
                        <span
                          key={k}
                          className="h-4 w-4 rounded-full border border-black/10"
                          style={{ background: String(theme.palette[k] ?? "#000") }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => applyTheme(theme.slug)}
                      disabled={saving || isActive}
                      className={cn(
                        "rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50",
                        isActive ? "bg-green-500 text-white" : "bg-primary text-primary-foreground hover:brightness-110"
                      )}
                    >
                      {isActive ? "Активна" : "Применить"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTheme(theme.id)}
                      className="flex items-center justify-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
