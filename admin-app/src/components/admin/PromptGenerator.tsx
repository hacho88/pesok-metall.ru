"use client";

import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generatePageConfig } from "@/lib/api";
import type { PageConfig, ThemePreset } from "@/types/page-builder";

interface PromptGeneratorProps {
  open: boolean;
  slug: string;
  theme: ThemePreset;
  onClose: () => void;
  onGenerated: (config: PageConfig) => void;
}

const EXAMPLES = [
  "Создай идеальную B2B-витрину для металлопроката, песка и щебня с акцентом на быструю доставку, оптовые цены и доверие",
  "Главная для продажи песка и щебня: баннер, преимущества, калькулятор доставки, каталог товаров, зоны доставки, отзывы, FAQ и ИИ-чат",
  "Лендинг для оптовых закупок арматуры: баннер с акцентом на опт и скидки, статистика компании, каталог, счёт на оплату",
  "Страница для района Балашиха: баннер с доставкой в Балашиху в день заказа, калькулятор, каталог, зоны доставки, чат",
];

export function PromptGenerator({
  open,
  slug,
  theme,
  onClose,
  onGenerated,
}: PromptGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generatePageConfig(prompt.trim(), slug, theme);
      onGenerated(data.config);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="h-5 w-5 text-primary" />
              Сгенерировать страницу по промпту
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Опишите страницу словами — ИИ соберёт блоки с контентом. Потом
              можно отредактировать вручную.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Например: главная для продажи песка и щебня с доставкой по Москве и МО — баннер, преимущества, калькулятор, каталог, отзывы, FAQ, чат..."
          rows={4}
          className="mb-3"
          autoFocus
        />

        <div className="mb-4 flex flex-wrap gap-1.5">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setPrompt(example)}
              className="rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {example.length > 60 ? example.slice(0, 60) + "…" : example}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={generate} disabled={loading || !prompt.trim()}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Генерация…
              </>
            ) : (
              <Sparkles />
            )}
            Сгенерировать
          </Button>
        </div>
      </div>
    </div>
  );
}
