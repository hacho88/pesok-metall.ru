"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Megaphone, Sparkles, TrendingUp, DollarSign, Target } from "lucide-react";
import {
  listAdvertising,
  updateAdvertising,
  getBudgetPrediction,
  runBidAnalysis,
  type AdminCampaign,
  type BudgetPrediction,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatRubles(value: string | null): string {
  if (!value) return "—";
  const n = Number(value);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function AdvertisingPage() {
  const [campaigns, setCampaigns] = useState<AdminCampaign[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<BudgetPrediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await listAdvertising();
      setCampaigns(data.campaigns);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(c: AdminCampaign, patch: Record<string, unknown>) {
    setSavingId(c.id);
    try {
      await updateAdvertising(c.id, patch);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingId(null);
    }
  }

  async function handlePredict() {
    setPredicting(true);
    setError(null);
    try {
      const p = await getBudgetPrediction();
      setPrediction(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPredicting(false);
    }
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    setError(null);
    try {
      await runBidAnalysis();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAnalyzing(false);
    }
  }

  const activeCount = campaigns?.filter((c) => c.isActive).length ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Megaphone className="h-6 w-6 text-primary" />
          Реклама
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Кампании Яндекс.Директ по товарам · активно: {activeCount} из{" "}
          {campaigns?.length ?? 0}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* AI Budget Predictor Panel */}
      <div className="mb-6 rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Прогноз бюджета Яндекс.Директ
            </h2>
            <p className="text-sm text-muted-foreground">DeepSeek R1 анализирует ROAS, конверсии и маржинальность</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePredict} disabled={predicting} className="gap-2">
              {predicting ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
              Прогноз бюджета
            </Button>
            <Button variant="outline" onClick={handleAnalyze} disabled={analyzing} className="gap-2">
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
              Анализ ставок
            </Button>
          </div>
        </div>

        {prediction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg bg-muted/40 p-4">
                <DollarSign className="h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Реком. дневной бюджет</p>
                <p className="text-xl font-bold">{prediction.recommendedDailyBudget.toLocaleString("ru-RU")} ₽</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <Target className="h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Ожидаемые клики</p>
                <p className="text-xl font-bold">{prediction.expectedClicks}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <TrendingUp className="h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Ожидаемая прибыль</p>
                <p className="text-xl font-bold">{prediction.expectedProfit.toLocaleString("ru-RU")} ₽</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <Sparkles className="h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">ROAS</p>
                <p className="text-xl font-bold">{prediction.roas.toFixed(1)}x</p>
              </div>
            </div>

            {prediction.allocation.length > 0 && (
              <div>
                <h3 className="text-sm font-bold mb-2">Распределение бюджета по кампаниям</h3>
                <div className="space-y-2">
                  {prediction.allocation.map((a, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.productName}</p>
                        <p className="text-xs text-muted-foreground">{a.reason}</p>
                      </div>
                      <div className="text-right">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${a.budgetShare * 100}%` }} />
                        </div>
                        <p className="text-xs font-bold mt-1">{(a.budgetShare * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">{prediction.reasoning}</p>
            </div>
          </div>
        )}
      </div>

      {!campaigns && !error && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          Загрузка кампаний…
        </div>
      )}

      {campaigns && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="px-4 py-3 text-right font-medium">Цена</th>
                <th className="px-4 py-3 text-right font-medium">Ставка, ₽</th>
                <th className="px-4 py-3 text-right font-medium">Лимит, ₽</th>
                <th className="px-4 py-3 text-right font-medium">Клики</th>
                <th className="px-4 py-3 text-right font-medium">Конверсии</th>
                <th className="px-4 py-3 text-right font-medium">ROI</th>
                <th className="px-4 py-3 text-center font-medium">Активна</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      /{c.productSlug}
                      {c.yandexDirectId && ` · Директ: ${c.yandexDirectId}`}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatRubles(c.priceRetailBase)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Input
                      type="number"
                      min={0}
                      step="0.1"
                      defaultValue={c.cpcBid}
                      className="ml-auto h-8 w-24 text-right"
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (Number.isFinite(v) && v !== Number(c.cpcBid)) {
                          save(c, { cpcBid: v });
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Input
                      type="number"
                      min={0}
                      step="0.1"
                      defaultValue={c.maxBidLimit}
                      className="ml-auto h-8 w-24 text-right"
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (Number.isFinite(v) && v !== Number(c.maxBidLimit)) {
                          save(c, { maxBidLimit: v });
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">{c.clicks}</td>
                  <td className="px-4 py-3 text-right">{c.conversions}</td>
                  <td className="px-4 py-3 text-right">
                    {c.roi ? `${Number(c.roi).toFixed(0)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {savingId === c.id ? (
                      <Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => save(c, { isActive: !c.isActive })}
                        className={
                          c.isActive
                            ? "text-green-700 hover:text-green-800"
                            : "text-muted-foreground hover:text-foreground"
                        }
                      >
                        {c.isActive ? "Вкл" : "Выкл"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    Кампаний пока нет. Они создаются при подключении товара к
                    Яндекс.Директ.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
