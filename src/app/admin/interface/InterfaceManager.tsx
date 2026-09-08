"use client";

import { useRef, useState, useEffect } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Megaphone,
  Palette,
  Phone,
  Plus,
  Trash2,
  Truck,
  Type,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MainHeroBannerForm } from "./MainHeroBannerForm";

export interface InterfaceSettings {
  siteName: string;
  logoUrl: string | null;
  phone: string;
  email: string;
  workHours: string;
  warehouseAddress: string;
  footerText: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  regionLabel: string;
  whatsappUrl: string | null;
  telegramUrl: string | null;
  vkUrl: string | null;
  maxBotToken: string | null;
  maxChatId: string | null;
  notifyEmail: string | null;
  smtpHost: string | null;
  smtpPort: string;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpFrom: string | null;
}

export interface AdminBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminTariff {
  id: string;
  name: string;
  basePrice: number;
  perKmPrice: number;
  minDistanceKm: number | null;
  maxDistanceKm: number | null;
  freeFromSum: number | null;
  isActive: boolean;
}

export interface AdminVehicle {
  id: string;
  name: string;
  maxWeightKg: string;
  maxLengthMeters: string;
  baseFare: string;
  perKmCharge: string;
  imageUrl: string | null;
  plateNumber: string | null;
  isActive: boolean;
}

const inputCls = "h-11 rounded-xl border-2 font-bold";
const labelCls = "text-[10px] font-black uppercase tracking-widest text-muted-foreground/60";

function SectionCard({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border-2 bg-card p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest">{title}</h2>
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function NotifyRow({ label, value, error }: { label: string; value: boolean | string | undefined; error?: string }) {
  const icon =
    value === true ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : value === "not_configured" ? (
      <XCircle className="h-4 w-4 text-muted-foreground/40" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  const text =
    value === true
      ? "отправлено ✓"
      : value === "not_configured"
        ? "не настроено"
        : value === false
          ? `ошибка${error ? `: ${error}` : ""}`
          : String(value ?? "—");
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}:</span>
      <span className={value === true ? "text-green-600" : value === "not_configured" ? "text-muted-foreground/60" : "text-red-600"}>
        {text}
      </span>
    </div>
  );
}

function SaveButton({ onSave, saved, saving }: { onSave: () => void; saved: boolean; saving: boolean }) {
  return (
    <Button
      className="h-11 rounded-xl bg-primary px-6 font-black shadow-lg shadow-primary/20"
      onClick={onSave}
      disabled={saving}
    >
      {saved ? (
        <CheckCircle2 className="mr-2 h-4 w-4" />
      ) : saving ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      {saved ? "СОХРАНЕНО" : saving ? "СОХРАНЕНИЕ…" : "СОХРАНИТЬ"}
    </Button>
  );
}

/** Загрузка фото через POST /api/atlas/media; onChange получает URL или null */
function ImageUpload({
  value,
  onChange,
  hint,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/atlas/media", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) onChange(data.url);
      else setError(data.error || "Ошибка загрузки");
    } catch {
      setError("Ошибка сети");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className="relative flex h-28 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 transition-colors hover:border-primary/50"
        onClick={() => fileRef.current?.click()}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <span className="px-4 text-center text-xs font-bold text-muted-foreground/60">
            {uploading ? "Загрузка…" : hint || "Нажмите, чтобы загрузить фото"}
          </span>
        )}
        {uploading && value && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-3">
        {value && (
          <button
            className="text-[11px] font-bold text-red-600 hover:underline"
            onClick={() => onChange(null)}
          >
            Убрать фото
          </button>
        )}
        {error && <span className="text-[11px] font-bold text-red-600">{error}</span>}
      </div>
    </div>
  );
}

export function InterfaceManager({
  settings: initialSettings,
  initialBanners,
  homeConfig,
  notify: initialNotify,
  initialTariffs,
}: {
  settings: InterfaceSettings;
  initialBanners: AdminBanner[];
  homeConfig: any;
  notify: {
    maxBotToken: string | null;
    maxChatId: string | null;
    notifyEmail: string | null;
    smtpHost: string | null;
    smtpPort: string;
    smtpUser: string | null;
    smtpPass: string | null;
    smtpFrom: string | null;
  };
  initialTariffs: AdminTariff[];
}) {
  const [settings, setSettings] = useState<InterfaceSettings>({ ...initialSettings, ...initialNotify });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [banners, setBanners] = useState<AdminBanner[]>(initialBanners);
  const [bannersSaved, setBannersSaved] = useState(false);

  const [tariffs, setTariffs] = useState<AdminTariff[]>(initialTariffs);
  const [tariffsSaved, setTariffsSaved] = useState(false);

  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [vehiclesSaved, setVehiclesSaved] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const set = (patch: Partial<InterfaceSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
    setSaved(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          smtpPort: settings.smtpPort ? Number(settings.smtpPort) : null,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  const setBanner = (id: string, patch: Partial<AdminBanner>) => {
    setBanners((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    setBannersSaved(false);
  };

  const putBanner = async (id: string, patch: Partial<AdminBanner>) => {
    await fetch(`/api/admin/banners?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setBannersSaved(true);
    setTimeout(() => setBannersSaved(false), 2500);
  };

  const addBanner = async () => {
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Новый баннер", position: "home_top", sortOrder: banners.length }),
    });
    if (res.ok) {
      const data = await res.json();
      setBanners((bs) => [...bs, data.banner]);
    }
  };

  const deleteBanner = async (id: string) => {
    setBanners((bs) => bs.filter((b) => b.id !== id));
    await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
  };

  const moveBanner = async (index: number, dir: -1 | 1) => {
    const next = [...banners];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBanners(next);
    await fetch("/api/admin/banners/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((b) => b.id) }),
    });
  };

  const setTariff = (id: string, patch: Partial<AdminTariff>) => {
    setTariffs((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    setTariffsSaved(false);
  };

  const putTariff = async (id: string, patch: Partial<AdminTariff>) => {
    await fetch(`/api/admin/tariffs?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setTariffsSaved(true);
    setTimeout(() => setTariffsSaved(false), 2500);
  };

  const addTariff = async () => {
    const res = await fetch("/api/admin/tariffs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Новый тариф", basePrice: 500, perKmPrice: 30 }),
    });
    if (res.ok) {
      const data = await res.json();
      setTariffs((ts) => [...ts, data.tariff]);
    }
  };

  const deleteTariff = async (id: string) => {
    setTariffs((ts) => ts.filter((t) => t.id !== id));
    await fetch(`/api/admin/tariffs?id=${id}`, { method: "DELETE" });
  };

  // Автопарк: типы машин с тарифами и фото
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/fleet");
        if (res.ok) {
          const data = await res.json();
          setVehicles(data.fleet ?? []);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const setVehicle = (id: string, patch: Partial<AdminVehicle>) => {
    setVehicles((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    setVehiclesSaved(false);
  };

  const putVehicle = async (id: string, patch: Partial<AdminVehicle>) => {
    await fetch(`/api/admin/fleet/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setVehiclesSaved(true);
    setTimeout(() => setVehiclesSaved(false), 2500);
  };

  const addVehicle = async () => {
    const res = await fetch("/api/admin/fleet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Новая машина", maxWeightKg: 2000, maxLengthMeters: 4, baseFare: 3000, perKmCharge: 40 }),
    });
    if (res.ok) {
      const data = await res.json();
      setVehicles((vs) => [...vs, { ...data.vehicle, maxWeightKg: String(data.vehicle.maxWeightKg), maxLengthMeters: String(data.vehicle.maxLengthMeters), baseFare: String(data.vehicle.baseFare), perKmCharge: String(data.vehicle.perKmCharge) }]);
    }
  };

  const deleteVehicle = async (id: string) => {
    setVehicles((vs) => vs.filter((v) => v.id !== id));
    await fetch(`/api/admin/fleet/${id}`, { method: "DELETE" });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* Логотип и бренд */}
      <SectionCard icon={<Palette className="h-4 w-4" />} title="Логотип и бренд" hint="Логотип в шапке сайта">
        <div className="flex items-start gap-4">
          <div
            className="flex h-16 w-40 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 transition-colors hover:border-primary/50"
            onClick={() => document.getElementById("logo-file")?.click()}
          >
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoUrl} alt="Логотип" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="px-2 text-center text-[11px] font-bold text-muted-foreground/60">
                Нажмите, чтобы загрузить логотип
              </span>
            )}
          </div>
          <input
            id="logo-file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const fd = new FormData();
              fd.append("file", file);
              const res = await fetch("/api/atlas/media", { method: "POST", body: fd });
              const data = await res.json();
              if (res.ok && data.url) set({ logoUrl: data.url });
            }}
          />
          {settings.logoUrl && (
            <Button variant="outline" className="h-10 rounded-xl border-2 font-bold" onClick={() => set({ logoUrl: null })}>
              Сбросить
            </Button>
          )}
        </div>
        <div className="mt-4 space-y-1.5">
          <Label className={labelCls}>Название магазина</Label>
          <Input className={inputCls} value={settings.siteName} onChange={(e) => set({ siteName: e.target.value })} />
        </div>
        <div className="mt-4">
          <SaveButton onSave={saveSettings} saved={saved} saving={saving} />
        </div>
      </SectionCard>

      {/* Главный экран */}
      <SectionCard
        icon={<Type className="h-4 w-4" />}
        title="Главный экран"
        hint="Плашка, заголовок и подзаголовок над боксами"
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className={labelCls}>Плашка</Label>
            <Input className={inputCls} value={settings.heroBadge} onChange={(e) => set({ heroBadge: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Заголовок (H1)</Label>
            <Textarea
              className="min-h-[70px] rounded-xl border-2 font-bold"
              value={settings.heroTitle}
              onChange={(e) => set({ heroTitle: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Подзаголовок</Label>
            <Textarea
              className="min-h-[60px] rounded-xl border-2 font-medium"
              value={settings.heroSubtitle}
              onChange={(e) => set({ heroSubtitle: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Регион в шапке</Label>
            <Input className={inputCls} value={settings.regionLabel} onChange={(e) => set({ regionLabel: e.target.value })} />
          </div>
          <SaveButton onSave={saveSettings} saved={saved} saving={saving} />
        </div>
      </SectionCard>

      {/* Контакты */}
      <SectionCard icon={<Phone className="h-4 w-4" />} title="Контакты и адрес" hint="Шапка, подвал, соцсети">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className={labelCls}>Телефон</Label>
            <Input className={inputCls} value={settings.phone} onChange={(e) => set({ phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Email</Label>
            <Input className={inputCls} value={settings.email} onChange={(e) => set({ email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Режим работы</Label>
            <Input className={inputCls} value={settings.workHours} onChange={(e) => set({ workHours: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Адрес (склад)</Label>
            <Input className={inputCls} value={settings.warehouseAddress} onChange={(e) => set({ warehouseAddress: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className={labelCls}>Текст в подвале</Label>
            <Textarea
              className="min-h-[60px] rounded-xl border-2 font-medium"
              value={settings.footerText}
              onChange={(e) => set({ footerText: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>WhatsApp</Label>
            <Input className={inputCls} value={settings.whatsappUrl ?? ""} placeholder="https://wa.me/…" onChange={(e) => set({ whatsappUrl: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Telegram</Label>
            <Input className={inputCls} value={settings.telegramUrl ?? ""} placeholder="https://t.me/…" onChange={(e) => set({ telegramUrl: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>ВКонтакте</Label>
            <Input className={inputCls} value={settings.vkUrl ?? ""} placeholder="https://vk.com/…" onChange={(e) => set({ vkUrl: e.target.value })} />
          </div>
        </div>
        <div className="mt-4">
          <SaveButton onSave={saveSettings} saved={saved} saving={saving} />
        </div>
      </SectionCard>

      {/* Баннеры */}
      <SectionCard
        icon={<Megaphone className="h-4 w-4" />}
        title="Баннеры на главной"
        hint="Фото + тексты + кнопка; несколько баннеров листаются слайдером"
      >
        <div className="space-y-3">
          {banners.map((b, i) => (
            <div key={b.id} className="rounded-2xl border-2 p-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-black text-primary">
                    {i + 1}
                  </span>
                  <button
                    disabled={i === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-accent disabled:opacity-20"
                    onClick={() => void moveBanner(i, -1)}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={i === banners.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-accent disabled:opacity-25"
                    onClick={() => void moveBanner(i, 1)}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <Input
                    className={inputCls}
                    value={b.title}
                    placeholder="Заголовок баннера"
                    onChange={(e) => setBanner(b.id, { title: e.target.value })}
                    onBlur={(e) => void putBanner(b.id, { title: e.target.value })}
                  />
                  <Textarea
                    className="min-h-[60px] rounded-xl border-2 font-medium"
                    placeholder="Подзаголовок (необязательно)"
                    value={b.subtitle ?? ""}
                    onChange={(e) => setBanner(b.id, { subtitle: e.target.value })}
                    onBlur={(e) => void putBanner(b.id, { subtitle: e.target.value })}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className={labelCls}>Ссылка (куда ведёт)</Label>
                      <Input
                        className={inputCls}
                        value={b.linkUrl ?? ""}
                        placeholder="/shop"
                        onChange={(e) => setBanner(b.id, { linkUrl: e.target.value })}
                        onBlur={(e) => void putBanner(b.id, { linkUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelCls}>Текст кнопки</Label>
                      <Input
                        className={inputCls}
                        value={b.linkLabel ?? ""}
                        placeholder="Смотреть каталог"
                        onChange={(e) => setBanner(b.id, { linkLabel: e.target.value })}
                        onBlur={(e) => void putBanner(b.id, { linkLabel: e.target.value })}
                      />
                    </div>
                  </div>
                  <ImageUpload
                    value={b.imageUrl}
                    hint="Фото баннера (необязательно)"
                    onChange={(url) => {
                      setBanner(b.id, { imageUrl: url });
                      void putBanner(b.id, { imageUrl: url });
                    }}
                  />
                </div>

                <div className="flex shrink-0 flex-col items-center gap-2">
                  <Switch
                    checked={b.isActive}
                    onCheckedChange={(checked) => {
                      setBanner(b.id, { isActive: checked });
                      void putBanner(b.id, { isActive: checked });
                    }}
                  />
                  <button
                    title="Удалить баннер"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm("Удалить баннер?")) void deleteBanner(b.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="mt-3 h-11 w-full rounded-xl border-2 font-black" onClick={() => void addBanner()}>
          <Plus className="mr-2 h-4 w-4" />
          ДОБАВИТЬ БАННЕР
        </Button>
        {bannersSaved && <p className="text-xs font-bold text-green-600">Баннеры обновлены</p>}
      </SectionCard>

      {/* Главный баннер (конструктор главной) */}
      <SectionCard
        icon={<ImagePlus className="h-4 w-4" />}
        title="Главный баннер"
        hint="Промо-блок конструктора главной страницы"
      >
        <MainHeroBannerForm config={homeConfig} />
      </SectionCard>

      {/* Тарифы доставки */}
      <SectionCard
        icon={<Truck className="h-4 w-4" />}
        title="Тарифы доставки"
        hint="Диапазоны расстояний от склада; считается: база + км × цена"
      >
        <div className="space-y-3">
          {tariffs.map((t) => (
            <div key={t.id} className="rounded-2xl border-2 p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1 space-y-3">
                  <Input
                    className={inputCls}
                    value={t.name}
                    placeholder="Название зоны"
                    onChange={(e) => setTariff(t.id, { name: e.target.value })}
                    onBlur={(e) => void putTariff(t.id, { name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className={labelCls}>База, ₽</Label>
                      <Input
                        className={inputCls}
                        type="number"
                        value={t.basePrice}
                        onChange={(e) => setTariff(t.id, { basePrice: Number(e.target.value) || 0 })}
                        onBlur={(e) => void putTariff(t.id, { basePrice: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelCls}>За км, ₽</Label>
                      <Input
                        className={inputCls}
                        type="number"
                        value={t.perKmPrice}
                        onChange={(e) => setTariff(t.id, { perKmPrice: Number(e.target.value) || 0 })}
                        onBlur={(e) => void putTariff(t.id, { perKmPrice: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelCls}>Бесплатно от, ₽</Label>
                      <Input
                        className={inputCls}
                        type="number"
                        value={t.freeFromSum ?? ""}
                        placeholder="—"
                        onChange={(e) => setTariff(t.id, { freeFromSum: e.target.value === "" ? null : Number(e.target.value) || null })}
                        onBlur={(e) => void putTariff(t.id, { freeFromSum: e.target.value === "" ? null : Number(e.target.value) || null })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelCls}>От, км</Label>
                      <Input
                        className={inputCls}
                        type="number"
                        value={t.minDistanceKm ?? ""}
                        placeholder="0"
                        onChange={(e) => setTariff(t.id, { minDistanceKm: e.target.value === "" ? null : Number(e.target.value) })}
                        onBlur={(e) => void putTariff(t.id, { minDistanceKm: e.target.value === "" ? null : Number(e.target.value) || null })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelCls}>До, км</Label>
                      <Input
                        className={inputCls}
                        type="number"
                        value={t.maxDistanceKm ?? ""}
                        placeholder="∞"
                        onChange={(e) => setTariff(t.id, { maxDistanceKm: e.target.value === "" ? null : Number(e.target.value) || null })}
                        onBlur={(e) => void putTariff(t.id, { maxDistanceKm: e.target.value === "" ? null : Number(e.target.value) || null })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <Switch
                    checked={t.isActive}
                    onCheckedChange={(checked) => {
                      setTariff(t.id, { isActive: checked });
                      void putTariff(t.id, { isActive: checked });
                    }}
                  />
                  <button
                    title="Удалить тариф"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm("Удалить тариф?")) void deleteTariff(t.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="mt-3 h-11 w-full rounded-xl border-2 font-black" onClick={() => void addTariff()}>
          <Plus className="mr-2 h-4 w-4" />
          ДОБАВИТЬ ТАРИФ
        </Button>
        {tariffsSaved && <p className="mt-2 text-xs font-bold text-green-600">Тарифы обновлены</p>}
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Пример: «По Москве» — база 500 ₽, 30 ₽/км, от 0 до 25 км; «МО» — база 800 ₽, 35 ₽/км, от 25 до 60 км. Пустое «До, км» — без ограничения. «Бесплатно от» — сумма заказа, при которой доставка бесплатна.
        </p>
      </SectionCard>

      {/* Автопарк: типы машин с тарифами */}
      <SectionCard
        icon={<Truck className="h-4 w-4" />}
        title="Автопарк — типы машин"
        hint="Машины подбираются по тоннажу в калькуляторе доставки; тариф = база + км × цена"
      >
        <div className="space-y-3">
          {vehicles.map((v) => (
            <div key={v.id} className="rounded-2xl border-2 p-4">
              <div className="flex items-start gap-4">
                <div className="w-28 shrink-0">
                  <ImageUpload
                    value={v.imageUrl}
                    hint="Фото машины"
                    onChange={(url) => {
                      setVehicle(v.id, { imageUrl: url });
                      void putVehicle(v.id, { imageUrl: url });
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <Input
                    className={inputCls}
                    value={v.name}
                    placeholder="Например: Портер (до 2 т)"
                    onChange={(e) => setVehicle(v.id, { name: e.target.value })}
                    onBlur={(e) => void putVehicle(v.id, { name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div className="space-y-1.5">
                      <Label className={labelCls}>Гос. номер</Label>
                      <Input
                        className={inputCls}
                        value={v.plateNumber ?? ""}
                        placeholder="А123ВС 77"
                        onChange={(e) => setVehicle(v.id, { plateNumber: e.target.value })}
                        onBlur={(e) => void putVehicle(v.id, { plateNumber: e.target.value || null })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelCls}>До, кг</Label>
                      <Input
                        className={inputCls}
                        type="number"
                        value={v.maxWeightKg}
                        onChange={(e) => setVehicle(v.id, { maxWeightKg: e.target.value })}
                        onBlur={(e) => void putVehicle(v.id, { maxWeightKg: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelCls}>База, ₽</Label>
                      <Input
                        className={inputCls}
                        type="number"
                        value={v.baseFare}
                        onChange={(e) => setVehicle(v.id, { baseFare: e.target.value })}
                        onBlur={(e) => void putVehicle(v.id, { baseFare: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelCls}>За км, ₽</Label>
                      <Input
                        className={inputCls}
                        type="number"
                        value={v.perKmCharge}
                        onChange={(e) => setVehicle(v.id, { perKmCharge: e.target.value })}
                        onBlur={(e) => void putVehicle(v.id, { perKmCharge: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelCls}>Длина, м</Label>
                      <Input
                        className={inputCls}
                        type="number"
                        step="0.5"
                        value={v.maxLengthMeters}
                        onChange={(e) => setVehicle(v.id, { maxLengthMeters: e.target.value })}
                        onBlur={(e) => void putVehicle(v.id, { maxLengthMeters: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <Switch
                    checked={v.isActive}
                    onCheckedChange={(checked) => {
                      setVehicle(v.id, { isActive: checked });
                      void putVehicle(v.id, { isActive: checked });
                    }}
                  />
                  <button
                    title="Удалить машину"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm("Удалить машину?")) void deleteVehicle(v.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {vehicles.length === 0 && (
            <p className="rounded-2xl border-2 border-dashed p-6 text-center text-xs text-muted-foreground">
              Машины загружаются…
            </p>
          )}
        </div>

        <Button variant="outline" className="mt-3 h-11 w-full rounded-xl border-2 font-black" onClick={() => void addVehicle()}>
          <Plus className="mr-2 h-4 w-4" />
          ДОБАВИТЬ МАШИНУ
        </Button>
        {vehiclesSaved && <p className="mt-2 text-xs font-bold text-green-600">Автопарк обновлён</p>}
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Пример: «Портер» — до 2000 кг, база 2500 ₽, 35 ₽/км; «Газель» — до 3000 кг, база 3000 ₽, 40 ₽/км; «5-тонник» — до 5000 кг; «10-тонник» — до 10000 кг. Калькулятор сам подберёт самую дешёвую машину, которая вмещает вес заказа.
        </p>
      </SectionCard>

      {/* Уведомления о заказах */}
      <SectionCard
        icon={<Bell className="h-4 w-4" />}
        title="Уведомления о заказах"
        hint="Каждый заказ приходит в MAX и на почту"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-primary">Мессенджер MAX</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className={labelCls}>Токен бота MAX</Label>
                <Input
                  className={inputCls}
                  type="password"
                  value={settings.maxBotToken ?? ""}
                  placeholder="Токен от @masterbot"
                  onChange={(e) => set({ maxBotToken: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>Chat ID</Label>
                <Input
                  className={inputCls}
                  value={settings.maxChatId ?? ""}
                  placeholder="Напишите боту и получите ID"
                  onChange={(e) => set({ maxChatId: e.target.value })}
                />
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Создайте бота у @masterbot в MAX, вставьте токен, сохраните, напишите боту любое сообщение и нажмите «Проверить» — chat_id подставится автоматически.
            </p>
          </div>

          <div className="rounded-2xl border-2 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Электронная почта</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className={labelCls}>Email для заказов</Label>
                <Input
                  className={inputCls}
                  value={settings.notifyEmail ?? ""}
                  placeholder="zakazy@pesok-metall.ru"
                  onChange={(e) => set({ notifyEmail: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>SMTP-сервер</Label>
                <Input
                  className={inputCls}
                  value={settings.smtpHost ?? ""}
                  placeholder="smtp.yandex.ru"
                  onChange={(e) => set({ smtpHost: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>Порт</Label>
                <Input
                  className={inputCls}
                  value={settings.smtpPort}
                  placeholder="465"
                  onChange={(e) => set({ smtpPort: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>Логин</Label>
                <Input
                  className={inputCls}
                  value={settings.smtpUser ?? ""}
                  placeholder="zakazy@pesok-metall.ru"
                  onChange={(e) => set({ smtpUser: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>Пароль / пароль приложения</Label>
                <Input
                  className={inputCls}
                  type="password"
                  value={settings.smtpPass ?? ""}
                  onChange={(e) => set({ smtpPass: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>Отправитель (от кого)</Label>
                <Input
                  className={inputCls}
                  value={settings.smtpFrom ?? ""}
                  placeholder="Песок-Металл <zakazy@…>"
                  onChange={(e) => set({ smtpFrom: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SaveButton onSave={saveSettings} saved={saved} saving={saving} />
            <Button
              variant="outline"
              className="h-11 rounded-xl border-2 font-black"
              onClick={async () => {
                setTesting(true);
                setTestResult(null);
                try {
                  const res = await fetch("/api/admin/notify-test", { method: "POST" });
                  setTestResult(await res.json());
                } catch {
                  setTestResult({ error: "Ошибка сети" });
                } finally {
                  setTesting(false);
                }
              }}
              disabled={testing}
            >
              {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
              ПРОВЕРИТЬ
            </Button>
          </div>

          {testResult && (
            <div className="space-y-1.5 rounded-2xl border-2 p-4 text-xs font-bold">
              <NotifyRow label="MAX" value={testResult.max} />
              <NotifyRow label="Telegram" value={testResult.telegram} />
              <NotifyRow label="Email" value={testResult.email} error={testResult.emailError} />
              {testResult.foundChatIds && (
                <p className="pt-1 text-primary">
                  Найдены chat_id в MAX: {testResult.foundChatIds.join(", ")} — скопируйте в поле выше и сохраните
                </p>
              )}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
