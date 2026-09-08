"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_BATCHES = 300; // предохранитель: не более 300 порций за сессию

export function BulkGenerateButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failed, setFailed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    setFailed(0);
    try {
      for (let i = 0; i < MAX_BATCHES; i++) {
        const res = await fetch("/api/admin/products/generate-all", { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Ошибка генерации");
          break;
        }
        setProgress({ done: data.totalPending - data.remaining, total: data.totalPending });
        if (data.failed > 0) setFailed((f: number) => f + data.failed);
        // Готово, либо порция не продвинулась (сплошные ошибки) — останавливаемся
        if (data.done || data.processed === 0) break;
      }
      router.refresh();
    } catch {
      setError("Не удалось связаться с сервером");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        onClick={run}
        disabled={running}
        className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-primary/30 bg-primary/5 px-4 text-xs font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        title="Сгенерировать ИИ-описания для всех товаров без описания (пакетами, с прогрессом)"
      >
        {running ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {running
          ? progress
            ? `ГЕНЕРАЦИЯ ${progress.done}/${progress.total}…`
            : "ГЕНЕРАЦИЯ…"
          : "ГЕНЕРАЦИЯ ВСЕХ ТОВАРОВ"}
      </Button>
      {running && failed > 0 && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
          ошибок: {failed}
        </span>
      )}
      {!running && progress && failed === 0 && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-600">
          <CheckCircle2 className="h-3 w-3" /> готово: {progress.total}
        </span>
      )}
      {error && <span className="text-[10px] font-bold text-red-600">{error}</span>}
    </div>
  );
}
