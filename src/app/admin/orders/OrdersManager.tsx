"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Banknote,
  Bell,
  BellOff,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Truck,
  Volume2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  name: string;
  unit: string;
  qty: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  number: string;
  status: string;
  customerName: string;
  phone: string;
  email: string | null;
  company: string | null;
  inn: string | null;
  paymentMethod: string;
  deliveryType: string;
  address: string | null;
  distanceKm: number | null;
  comment: string | null;
  subtotal: number;
  deliveryCost: number;
  total: number;
  invoiceSent: boolean;
  items: OrderItem[];
  geoZone: { name: string } | null;
  createdAt: string;
}

const STATUSES = [
  { key: "NEW", label: "Новый", cls: "bg-blue-500/15 text-blue-700 border-blue-500/30", grad: "from-blue-500 to-cyan-500" },
  { key: "CONFIRMED", label: "Подтверждён", cls: "bg-amber-500/15 text-amber-700 border-amber-500/30", grad: "from-amber-500 to-orange-500" },
  { key: "PAID", label: "Оплачен", cls: "bg-green-500/15 text-green-700 border-green-500/30", grad: "from-green-500 to-emerald-500" },
  { key: "SHIPPED", label: "В доставке", cls: "bg-purple-500/15 text-purple-700 border-purple-500/30", grad: "from-purple-500 to-fuchsia-500" },
  { key: "DONE", label: "Выполнен", cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", grad: "from-emerald-500 to-teal-500" },
  { key: "CANCELLED", label: "Отменён", cls: "bg-red-500/15 text-red-600 border-red-500/30", grad: "from-red-500 to-rose-500" },
] as const;

const PIPELINE = ["NEW", "CONFIRMED", "PAID", "SHIPPED", "DONE"] as const;

const statusMeta = (s: string) => STATUSES.find((x) => x.key === s) ?? STATUSES[0];

const fmtMoney = (n: number) => `${n.toLocaleString("ru-RU")} ₽`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";

const timeAgo = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  return `${Math.floor(h / 24)} дн назад`;
};

/** Двухтональный сигнал через WebAudio — без аудиофайлов */
function playChime() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0.25;
    master.connect(ctx.destination);

    const notes = [880, 1174.66, 880]; // A5 → D6 → A5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(1, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain).connect(master);
      osc.start(t);
      osc.stop(t + 0.4);
    });
    setTimeout(() => void ctx.close(), 1200);
  } catch {
    // AudioContext недоступен — молча пропускаем
  }
}

export function OrdersManager({
  initialOrders,
  initialNewCount,
}: {
  initialOrders: Order[];
  initialNewCount: number;
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [newCount, setNewCount] = useState(initialNewCount);
  const [filter, setFilter] = useState<string>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const lastCheckRef = useRef(new Date().toISOString());
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 6000);
  }, []);

  // Polling новых заказов каждые 15 секунд
  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch(`/api/admin/orders?since=${encodeURIComponent(lastCheckRef.current)}`);
        if (!res.ok) return;
        const data = await res.json();
        lastCheckRef.current = new Date().toISOString();
        setNewCount(data.newCount ?? 0);

        const fresh: Order[] = (data.orders ?? []).map((o: any) => ({
          ...o,
          lat: o.lat ? Number(o.lat) : null,
          lng: o.lng ? Number(o.lng) : null,
          createdAt: typeof o.createdAt === "string" ? o.createdAt : new Date(o.createdAt).toISOString(),
        }));

        if (fresh.length > 0) {
          setOrders((prev) => {
            const ids = new Set(prev.map((o) => o.id));
            const added = fresh.filter((o) => !ids.has(o.id));
            return added.length > 0 ? [...added, ...prev] : prev;
          });
          const latest = fresh[0];
          if (soundOnRef.current) playChime();
          showToast(`Новый заказ ${latest.number} на ${fmtMoney(latest.total)}`);
          document.title = `(${fresh.length}) Заказы | Админ-панель`;
          setTimeout(() => (document.title = "Админ-панель | pesok-metall.ru"), 10000);
        }
      } catch {
        // сеть/сервер — пропускаем тик
      }
    };
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, [showToast]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/orders?limit=100");
      if (res.ok) {
        const data = await res.json();
        setOrders(
          (data.orders ?? []).map((o: any) => ({
            ...o,
            lat: o.lat ? Number(o.lat) : null,
            lng: o.lng ? Number(o.lng) : null,
            createdAt: typeof o.createdAt === "string" ? o.createdAt : new Date(o.createdAt).toISOString(),
          }))
        );
        setNewCount(data.newCount ?? 0);
        lastCheckRef.current = new Date().toISOString();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const setStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
        const cnt = await fetch("/api/admin/orders?limit=1").then((r) => r.json()).catch(() => null);
        if (cnt) setNewCount(cnt.newCount ?? 0);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const revenue = orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const activeCount = orders.filter((o) => !["DONE", "CANCELLED"].includes(o.status)).length;

  const kpis = [
    { label: "Новые", value: String(newCount), icon: Bell, grad: "from-blue-500 to-cyan-500", alert: newCount > 0 },
    { label: "В работе", value: String(activeCount), icon: TrendingUp, grad: "from-amber-500 to-orange-500", alert: false },
    { label: "Всего заказов", value: String(orders.length), icon: ShoppingBag, grad: "from-purple-500 to-fuchsia-500", alert: false },
    { label: "Выручка", value: fmtMoney(revenue), icon: Wallet, grad: "from-emerald-500 to-teal-500", alert: false },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* KPI-карточки */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className={`relative overflow-hidden rounded-2xl border-2 bg-card p-4 transition-shadow hover:shadow-lg ${
              k.alert ? "border-blue-500/40 shadow-md shadow-blue-500/10" : ""
            }`}
          >
            <span className={`pointer-events-none absolute -right-6 -top-8 size-24 rounded-full bg-gradient-to-br ${k.grad} opacity-15 blur-2xl`} />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{k.label}</span>
              <span className={`flex size-8 items-center justify-center rounded-xl bg-gradient-to-br ${k.grad} text-white shadow-md`}>
                <k.icon className="size-4" />
              </span>
            </div>
            <div className="mt-1.5 text-2xl font-black tracking-tight">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Фильтры + действия */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-2xl border-2 bg-muted/40 p-1">
          <button
            onClick={() => setFilter("ALL")}
            className={`h-8 rounded-xl px-3.5 text-[11px] font-black uppercase tracking-wider transition-all ${
              filter === "ALL" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Все · {orders.length}
          </button>
          {STATUSES.map((s) => {
            const cnt = orders.filter((o) => o.status === s.key).length;
            return (
              <button
                key={s.key}
                onClick={() => setFilter(s.key)}
                className={`h-8 rounded-xl px-3 text-[11px] font-black uppercase tracking-wider transition-all ${
                  filter === s.key ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label} · {cnt}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9 rounded-xl border-2 font-bold"
            onClick={() => {
              setSoundOn((v) => !v);
              if (!soundOn) playChime();
            }}
            title={soundOn ? "Выключить звук" : "Включить звук"}
          >
            {soundOn ? <Volume2 className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4" />}
          </Button>
          <Button variant="outline" className="h-9 rounded-xl border-2 font-bold" onClick={() => void refresh()} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Список заказов */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed p-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Package className="size-7 text-muted-foreground" />
          </span>
          <span className="text-sm font-bold text-muted-foreground">Заказов нет</span>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const meta = statusMeta(o.status);
            const isOpen = expanded === o.id;
            const idx = PIPELINE.indexOf(o.status as (typeof PIPELINE)[number]);
            return (
              <div
                key={o.id}
                className={`relative overflow-hidden rounded-3xl border-2 bg-card transition-shadow hover:shadow-lg ${
                  o.status === "NEW" ? "border-blue-500/40 shadow-md shadow-blue-500/10" : ""
                }`}
              >
                {/* Цветная полоса статуса */}
                <span className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${meta.grad}`} />

                {/* Шапка заказа */}
                <button
                  className="flex w-full items-center gap-4 py-4 pl-6 pr-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                >
                  {/* Аватар с инициалами */}
                  <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.grad} text-sm font-black text-white shadow-md`}>
                    {initials(o.customerName)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="truncate text-[15px] font-black">{o.customerName}</span>
                      <span className="text-xs font-bold text-muted-foreground">{o.number}</span>
                      {o.status === "NEW" && (
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-500 opacity-75" />
                          <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span title={fmtDate(o.createdAt)}>{timeAgo(o.createdAt)}</span>
                      <span className="inline-flex items-center gap-1">
                        {o.paymentMethod === "bank_wire" ? <CreditCard className="size-3" /> : <Banknote className="size-3" />}
                        {o.paymentMethod === "bank_wire" ? "Безнал" : "Наличные"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Truck className="size-3" />
                        {o.deliveryType === "pickup" ? "Самовывоз" : "Доставка"}
                      </span>
                      {o.geoZone && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" />
                          {o.geoZone.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-lg font-black tracking-tight">{fmtMoney(o.total)}</span>
                    <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>
                  {isOpen ? <ChevronUp className="size-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />}
                </button>

                {/* Детали */}
                {isOpen && (
                  <div className="border-t-2 px-4 pb-4 pt-4 pl-6">
                    <div className="grid gap-3 lg:grid-cols-2">
                      {/* Клиент и доставка */}
                      <div className="rounded-2xl border-2 bg-muted/20 p-4">
                        <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          Клиент и доставка
                        </div>
                        <div className="space-y-2.5 text-sm">
                          <a href={`tel:${o.phone}`} className="flex items-center gap-2.5 font-bold text-primary hover:underline">
                            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                              <Phone className="size-3.5" />
                            </span>
                            {o.phone}
                          </a>
                          {o.email && <div className="pl-9 text-muted-foreground">{o.email}</div>}
                          {o.company && (
                            <div className="pl-9 text-muted-foreground">
                              {o.company} {o.inn ? `· ИНН ${o.inn}` : ""}
                            </div>
                          )}
                          {o.address && (
                            <div className="flex items-start gap-2.5 text-muted-foreground">
                              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <MapPin className="size-3.5" />
                              </span>
                              <span className="pt-1">
                                {o.address}
                                {o.distanceKm ? ` · ~${o.distanceKm} км` : ""}
                              </span>
                            </div>
                          )}
                          {o.comment && (
                            <div className="rounded-xl bg-amber-500/10 p-3 text-xs italic text-amber-800">
                              «{o.comment}»
                            </div>
                          )}
                          {o.invoiceSent && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-700">
                              <CheckCircle2 className="size-3.5" /> Счёт отправлен
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Состав заказа */}
                      <div className="rounded-2xl border-2 bg-muted/20 p-4">
                        <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          Состав заказа
                        </div>
                        <div className="space-y-2">
                          {o.items.map((i) => (
                            <div key={i.id} className="flex items-baseline justify-between gap-2 text-sm">
                              <span className="min-w-0 truncate font-medium">
                                {i.name}
                                <span className="ml-1.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                                  {i.qty} {i.unit}
                                </span>
                              </span>
                              <span className="shrink-0 font-bold">{fmtMoney(i.total)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 space-y-1 border-t-2 pt-3 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Товары</span><span>{fmtMoney(o.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Доставка</span><span>{fmtMoney(o.deliveryCost)}</span>
                          </div>
                          <div className="flex justify-between text-base font-black">
                            <span>Итого</span><span>{fmtMoney(o.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Пайплайн статусов */}
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      {PIPELINE.map((key, i) => {
                        const s = STATUSES.find((x) => x.key === key)!;
                        const done = idx > i;
                        const current = idx === i;
                        return (
                          <div key={key} className="flex items-center gap-1.5">
                            {i > 0 && <span className={`h-0.5 w-4 rounded-full ${done || current ? "bg-primary" : "bg-muted-foreground/20"}`} />}
                            <button
                              disabled={updatingId === o.id || current}
                              onClick={() => void setStatus(o.id, key)}
                              className={`flex h-8 items-center gap-1.5 rounded-xl border-2 px-3 text-[11px] font-black uppercase tracking-wider transition-all disabled:cursor-default ${
                                current
                                  ? `bg-gradient-to-r ${s.grad} border-transparent text-white shadow-md`
                                  : done
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : "border-muted-foreground/15 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                              }`}
                            >
                              {updatingId === o.id && !current ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : done ? (
                                <CheckCircle2 className="size-3.5" />
                              ) : null}
                              {s.label}
                            </button>
                          </div>
                        );
                      })}
                      {o.status !== "CANCELLED" && o.status !== "DONE" && (
                        <button
                          disabled={updatingId === o.id}
                          onClick={() => void setStatus(o.id, "CANCELLED")}
                          className="ml-auto h-8 rounded-xl border-2 border-red-500/20 px-3 text-[11px] font-black uppercase tracking-wider text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                        >
                          Отменить
                        </button>
                      )}
                      {o.status === "CANCELLED" && (
                        <span className="ml-auto rounded-xl border-2 border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-red-600">
                          Отменён
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Toast о новом заказе */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border-2 border-primary/30 bg-card px-5 py-4 shadow-2xl shadow-primary/25">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-blue-500 ring-2 ring-card" />
            </span>
          </span>
          <div>
            <div className="text-sm font-black">{toast}</div>
            <div className="text-xs text-muted-foreground">Нажмите на заказ для деталей</div>
          </div>
        </div>
      )}
    </div>
  );
}
