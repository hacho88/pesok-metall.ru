"use client";

import { useState } from "react";
import { useEditorStore } from "../editor-store";
import { Sparkles, Loader2, Check } from "lucide-react";
import { nanoid } from "nanoid";
import type { Section } from "@/lib/atlas/config-schema";

export function AIPanel() {
  const store = useEditorStore();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!store.config) return null;

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("/api/atlas/ai/generate-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || "AI generation failed");
      }
      const data = await resp.json();
      if (data.sections && Array.isArray(data.sections)) {
        const sections: Section[] = data.sections.map((s: any) => ({
          id: s.id || `ai-${nanoid(6)}`,
          type: s.type,
          props: s.props || {},
          settings: s.settings || { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
        }));
        // Replace home sections
        const config = { ...store.config!, pages: { ...store.config!.pages, home: { ...store.config!.pages.home, sections } } };
        useEditorStore.setState({ config, dirty: true });
        setResult(`Сгенерировано ${sections.length} секций для главной страницы`);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Лендинг для оптовых продаж металлопроката с акцентом на цены и доставку",
    "Главная страница с фокусом на сыпучие материалы (песок, щебень) и калькулятор",
    "Минималистичная страница с каталогом, преимуществами и формой заявки",
  ];

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
        <Sparkles size={18} className="text-purple-500" /> AI-генерация
      </h3>

      <div>
        <label className="text-xs font-medium block mb-1 text-slate-600">Опишите желаемую страницу</label>
        <textarea
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Например: лендинг с акцентом на оптовые цены, быструю доставку и калькулятор..."
        />
      </div>

      <div className="space-y-1">
        <span className="text-xs text-slate-400">Подсказки:</span>
        {suggestions.map((s, i) => (
          <button
            key={i}
            className="block w-full text-left p-2 rounded-lg text-xs text-slate-600 hover:bg-slate-50 border border-slate-100"
            onClick={() => setPrompt(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <button
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 disabled:opacity-50"
        onClick={generate}
        disabled={loading || !prompt.trim()}
      >
        {loading ? <><Loader2 size={16} className="animate-spin" /> Генерация...</> : <><Sparkles size={16} /> Сгенерировать</>}
      </button>

      {result && (
        <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm flex items-center gap-2">
          <Check size={16} /> {result}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
          <p className="text-xs mt-1 text-red-500">Требуется DEEPSEEK_API_KEY в .env</p>
        </div>
      )}

      <div className="border-t border-slate-100 pt-3">
        <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Генерация описаний</h4>
        <p className="text-xs text-slate-500 mb-2">Массовая генерация SEO-описаний для товаров и категорий через DeepSeek</p>
        <a href="/api/atlas/ai/generate-descriptions?scope=products" className="block w-full text-center px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 mb-1">
          Товары (все без описаний)
        </a>
        <a href="/api/atlas/ai/generate-descriptions?scope=categories" className="block w-full text-center px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50">
          Категории (все без описаний)
        </a>
      </div>
    </div>
  );
}
