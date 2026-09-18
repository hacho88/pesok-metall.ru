"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  BellOff,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Volume2,
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
  { key: "NEW", label: "Новый", cls: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  { key: "CONFIRMED", label: "Подтверждён", cls: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  { key: "PAID", label: "Оплачен", cls: "bg-green-500/15 text-green-700 border-green-500/30" },
  { key: "SHIPPED", label: "В доставке", cls: "bg-purple-500/15 text-purple-700 border-purple-500/30" },
  { key: "DONE", label: "Выполнен", cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  { key: "CANCELLED", label: "Отменён", cls: "bg-red-500/15 text-red-600 border-red-500/30" },
] as const;

const statusMeta = (s: string) => STATUSES.find((x) => x.key === s) ?? STATUSES[0];

const fmtMoney = (n: number) => `${n.toLocaleString("ru-RU")} ₽`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

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

  return (
    <div className="flex flex-col gap-4">
      {/* Панель управления */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`h-9 rounded-xl border-2 px-4 text-xs font-black uppercase tracking-wider transition-colors ${
            filter === "ALL" ? "border-primary bg-primary text-white" : "border-muted-foreground/20 hover:border-primary/50"
          }`}
        >
          Все ({orders.length})
        </button>
        {STATUSES.map((s) => {
          const cnt = orders.filter((o) => o.status === s.key).length;
          return (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`h-9 rounded-xl border-2 px-3 text-xs font-black uppercase tracking-wider transition-colors ${
                filter === s.key ? "border-primary bg-primary text-white" : "border-muted-foreground/20 hover:border-primary/50"
              }`}
            >
              {s.label} ({cnt})
            </button>
          );
        })}
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
        <div className="rounded-3xl border-2 border-dashed p-10 text-center text-sm font-bold text-muted-foreground">
          Заказов нет
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const meta = statusMeta(o.status);
            const isOpen = expanded === o.id;
            return (
              <div key={o.id} className="rounded-3xl border-2 bg-card">
                {/* Шапка заказа */}
                <button
                  className="flex w-full items-center gap-3 p-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                >
                  <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${meta.cls}`}>
                    {meta.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-black">{o.number}</span>
                      <span className="text-sm font-bold text-muted-foreground">{o.customerName}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {fmtDate(o.createdAt)} · {o.paymentMethod === "bank_wire" ? "Безнал" : "Наличные"} ·{" "}
                      {o.deliveryType === "pickup" ? "Самовывоз" : "Доставка"}
                      {o.geoZone ? ` · ${o.geoZone.name}` : ""}
                    </div>
                  </div>
                  <span className="shrink-0 text-lg font-black">{fmtMoney(o.total)}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                </button>

                {/* Детали */}
                {isOpen && (
                  <div className="border-t-2 px-4 pb-4 pt-3">
                    <div className="grid gap-4 lg:grid-cols-2">
                      {/* Клиент и доставка */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 font-bold">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          <a href={`tel:${o.phone}`} className="text-primary hover:underline">{o.phone}</a>
                        </div>
                        {o.email && <div className="text-muted-foreground">Email: {o.email}</div>}
                        {o.company && (
                          <div className="text-muted-foreground">
                            {o.company} {o.inn ? `(ИНН ${o.inn})` : ""}
                          </div>
                        )}
                        {o.address && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>
                              {o.address}
                              {o.distanceKm ? ` · ~${o.distanceKm} км` : ""}
                            </span>
                          </div>
                        )}
                        {o.comment && (
                          <div className="rounded-xl bg-muted/50 p-2.5 text-xs italic text-muted-foreground">
                            «{o.comment}»
                          </div>
                        )}
                        {o.invoiceSent && (
                          <div className="text-xs font-bold text-green-600">Счёт отправлен ✓</div>
                        )}
                      </div>

                      {/* Позиции */}
                      <div className="space-y-1.5">
                        {o.items.map((i) => (
                          <div key={i.id} className="flex items-baseline justify-between gap-2 text-sm">
                            <span className="min-w-0 truncate font-medium">
                              {i.name} <span className="text-muted-foreground">× {i.qty} {i.unit}</span>
                            </span>
                            <span className="shrink-0 font-bold">{fmtMoney(i.total)}</span>
                          </div>
                        ))}
                        <div className="mt-2 space-y-0.5 border-t pt-2 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Товары</span><span>{fmtMoney(o.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Доставка</span><span>{fmtMoney(o.deliveryCost)}</span>
                          </div>
                          <div className="flex justify-between font-black">
                            <span>Итого</span><span>{fmtMoney(o.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Смена статуса */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t-2 pt-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        Статус:
                      </span>
                      {STATUSES.map((s) => (
                        <button
                          key={s.key}
                          disabled={updatingId === o.id || o.status === s.key}
                          onClick={() => void setStatus(o.id, s.key)}
                          className={`h-8 rounded-lg border px-3 text-[11px] font-black uppercase tracking-wider transition-colors disabled:opacity-40 ${
                            o.status === s.key ? s.cls : "border-muted-foreground/20 hover:border-primary/50"
                          }`}
                        >
                          {updatingId === o.id && o.status !== s.key ? "…" : s.label}
                        </button>
                      ))}
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border-2 border-primary bg-card px-5 py-4 shadow-2xl shadow-primary/20">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-black">{toast}</div>
            <div className="text-xs text-muted-foreground">Проверьте список заказов</div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        </div>
      )}
    </div>
  );
}
