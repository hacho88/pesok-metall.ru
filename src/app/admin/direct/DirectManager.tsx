"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Eye,
  Loader2,
  Megaphone,
  MousePointerClick,
  RefreshCw,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CampaignStats {
  campaignId: number;
  campaignName: string;
  impressions: number;
  clicks: number;
  cost: number;
  ctr: number;
  avgCpc: number;
  conversions: number;
}

interface DirectCampaign {
  Id: number;
  Name: string;
  Status: string;
  State: string;
  StartDate?: string;
  Type?: string;
  DailyBudget?: { Amount: number; Mode: string };
}

interface DirectData {
  configured: boolean;
  campaigns: DirectCampaign[];
  stats: CampaignStats[];
  totals: { impressions: number; clicks: number; cost: number; ctr: number; conversions: number };
  error?: string;
}

const PERIODS = [
  { days: 7, label: "7 дней" },
  { days: 30, label: "30 дней" },
  { days: 90, label: "90 дней" },
];

const STATE_META: Record<string, { label: string; cls: string }> = {
  ON: { label: "Активна", cls: "border-green-500/30 bg-green-500/10 text-green-700" },
  OFF: { label: "Остановлена", cls: "border-slate-500/30 bg-slate-500/10 text-slate-600" },
  SUSPENDED: { label: "Приостановлена", cls: "border-amber-500/30 bg-amber-500/10 text-amber-700" },
  ARCHIVED: { label: "В архиве", cls: "border-muted-foreground/30 bg-muted text-muted-foreground" },
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  ACCEPTED: { label: "Принята", cls: "border-green-500/30 bg-green-500/10 text-green-700" },
  MODERATION: { label: "На модерации", cls: "border-blue-500/30 bg-blue-500/10 text-blue-700" },
  DRAFT: { label: "Черновик", cls: "border-muted-foreground/30 bg-muted text-muted-foreground" },
  REJECTED: { label: "Отклонена", cls: "border-red-500/30 bg-red-500/10 text-red-700" },
};

const fmtMoney = (v: number) => `${Math.round(v).toLocaleString("ru-RU")} ₽`;
const fmtNum = (v: number) => v.toLocaleString("ru-RU");

export function DirectManager() {
  const [data, setData] = useState<DirectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const load = useCallback(async (d: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/direct?days=${d}`);
      setData(await res.json());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(days);
  }, [days, load]);

  // Не настроен — инструкция
  if (data && !data.configured) {
    return (
      <div className="rounded-3xl border-2 border-dashed p-10">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg">
            <AlertTriangle className="size-7" />
          </span>
          <h2 className="text-lg font-black">Яндекс.Директ не настроен</h2>
          <p className="text-sm text-muted-foreground">
            Добавьте переменные окружения на сервере в <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">.env</code>:
          </p>
          <pre className="w-full rounded-2xl bg-slate-900 p-4 text-left font-mono text-xs text-green-400">
{`YANDEX_DIRECT_TOKEN="<OAuth-токен>"
YANDEX_DIRECT_LOGIN="pesok-metall"`}
          </pre>
          <p className="text-xs text-muted-foreground">
            Токен: oauth.yandex.ru → приложение с доступом «Яндекс.Директ API» →
            authorize?response_type=token&client_id=… После добавления перезапустите сервис.
          </p>
        </div>
      </div>
    );
  }

  const kpis = data
    ? [
        { label: "Расход", value: fmtMoney(data.totals.cost), icon: Wallet, grad: "from-red-500 to-orange-500" },
        { label: "Клики", value: fmtNum(data.totals.clicks), icon: MousePointerClick, grad: "from-blue-500 to-cyan-500" },
        { label: "Показы", value: fmtNum(data.totals.impressions), icon: Eye, grad: "from-purple-500 to-fuchsia-500" },
        { label: "CTR", value: `${data.totals.ctr.toFixed(2)}%`, icon: TrendingUp, grad: "from-amber-500 to-orange-500" },
        { label: "Конверсии", value: fmtNum(data.totals.conversions), icon: Target, grad: "from-emerald-500 to-teal-500" },
      ]
    : [];

  return (
    <div className="flex flex-col gap-5">
      {/* Период + обновление */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-2xl border-2 bg-muted/40 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`h-8 rounded-xl px-4 text-[11px] font-black uppercase tracking-wider transition-all ${
                days === p.days ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          className="ml-auto h-9 rounded-xl border-2 font-bold"
          onClick={() => void load(days)}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {data?.error && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700">
          <AlertTriangle className="size-4 shrink-0" />
          {data.error}
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="relative overflow-hidden rounded-2xl border-2 bg-card p-4 transition-shadow hover:shadow-lg">
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

      {/* Таблица кампаний */}
      {loading && !data ? (
        <div className="flex items-center justify-center gap-2 rounded-3xl border-2 p-12 text-sm font-bold text-muted-foreground">
          <Loader2 className="size-5 animate-spin" /> Загружаю кампании…
        </div>
      ) : !data || data.campaigns.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed p-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Megaphone className="size-7 text-muted-foreground" />
          </span>
          <span className="text-sm font-bold text-muted-foreground">Кампаний нет</span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border-2 bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b-2 bg-muted/40 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-3">Кампания</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3 text-right">Показы</th>
                  <th className="px-4 py-3 text-right">Клики</th>
                  <th className="px-4 py-3 text-right">CTR</th>
                  <th className="px-4 py-3 text-right">Ср. CPC</th>
                  <th className="px-4 py-3 text-right">Конв.</th>
                  <th className="px-4 py-3 text-right">Расход</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.campaigns.map((c) => {
                  const s = data.stats.find((x) => x.campaignId === c.Id);
                  const state = STATE_META[c.State] ?? STATE_META.OFF;
                  const status = STATUS_META[c.Status] ?? STATUS_META.DRAFT;
                  return (
                    <tr key={c.Id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3.5">
                        <div className="font-bold">{c.Name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          ID {c.Id}
                          {c.StartDate ? ` · с ${new Date(c.StartDate).toLocaleDateString("ru-RU")}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${state.cls}`}>
                            {state.label}
                          </span>
                          <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${status.cls}`}>
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums">{s ? fmtNum(s.impressions) : "—"}</td>
                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums">{s ? fmtNum(s.clicks) : "—"}</td>
                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums">{s ? `${s.ctr.toFixed(2)}%` : "—"}</td>
                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums">{s ? fmtMoney(s.avgCpc) : "—"}</td>
                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums">{s ? fmtNum(s.conversions) : "—"}</td>
                      <td className="px-4 py-3.5 text-right font-black tabular-nums">{s ? fmtMoney(s.cost) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
