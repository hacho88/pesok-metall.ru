"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Gavel, TrendingUp, TrendingDown, PauseCircle, FileText } from "lucide-react";
import { listTenders, updateTender, type Tender } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const STATUS_LABELS: Record<string, string> = {
  RECOMMENDED: "Участвовать",
  REJECTED: "Отказаться",
  HOLD: "Пауза",
};

const STATUS_COLORS: Record<string, string> = {
  RECOMMENDED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  HOLD: "bg-amber-100 text-amber-700",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  RECOMMENDED: <TrendingUp className="h-4 w-4" />,
  REJECTED: <TrendingDown className="h-4 w-4" />,
  HOLD: <PauseCircle className="h-4 w-4" />,
};

function fmt(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₽";
}

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Tender | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await listTenders({ status: statusFilter || undefined });
      setTenders(data.tenders);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(id: string, aiStatus: string) {
    setSaving(true);
    try {
      await updateTender(id, { aiStatus });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Тендеры</h1>
          <p className="text-sm text-muted-foreground">
            ИИ-анализ тендеров на поставку — всего: {total}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Все статусы</option>
            <option value="RECOMMENDED">Участвовать</option>
            <option value="REJECTED">Отказаться</option>
            <option value="HOLD">Пауза</option>
          </Select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!tenders ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка тендеров...
        </div>
      ) : tenders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
          <Gavel className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="font-medium">Тендеров пока нет</p>
          <p className="text-sm text-muted-foreground">
            Подайте тендер через POST /api/tenders — ИИ проанализирует и вынесет вердикт
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tenders.map((t) => {
            const margin = t.initialPrice > 0
              ? ((t.initialPrice - t.calculatedCost) / t.initialPrice) * 100
              : 0;
            return (
              <div key={t.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-600">
                        {t.tenderNumber}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[t.aiStatus]}`}>
                        {STATUS_ICONS[t.aiStatus]}
                        {STATUS_LABELS[t.aiStatus]}
                      </span>
                    </div>
                    <h3 className="mt-2 truncate font-semibold">{t.title}</h3>
                    <p className="text-sm text-muted-foreground">{t.customer}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm text-muted-foreground">Начальная цена</div>
                    <div className="font-bold">{fmt(Number(t.initialPrice))}</div>
                    <div className="text-sm text-muted-foreground">Себестоимость</div>
                    <div className="font-semibold">{fmt(Number(t.calculatedCost))}</div>
                    <div className={`text-sm font-bold ${margin >= 15 ? "text-green-600" : margin > 0 ? "text-amber-600" : "text-red-600"}`}>
                      Маржа: {margin.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <Button variant="outline" size="sm" onClick={() => setSelected(t)}>
                    <FileText className="mr-2 h-4 w-4" /> Отчёт ИИ
                  </Button>
                  <div className="flex items-center gap-2">
                    <Select
                      value={t.aiStatus}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      disabled={saving}
                    >
                      <option value="RECOMMENDED">Участвовать</option>
                      <option value="REJECTED">Отказаться</option>
                      <option value="HOLD">Пауза</option>
                    </Select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-2xl rounded-xl bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{selected.tenderNumber}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                Закрыть
              </Button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed">
              {selected.aiReport}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
