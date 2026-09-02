"use client";

/**
 * city-met — параметрические бейджи-фильтры подкатегорий.
 * Плотные горизонтальные линии острых текстовых чипов: [12 мм] [А500С] [рифленая].
 * Клик по тегу реактивно фильтрует строки таблицы без перезагрузки страницы.
 */
import { X } from "lucide-react";
import type { CityMetRow } from "./catalog-data";
import { cn } from "@/lib/utils";

interface FilterTagsProps {
  rows: CityMetRow[];
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

export default function FilterTags({ rows, activeTags, onToggleTag, onClearTags }: FilterTagsProps) {
  /** Уникальные теги по видимым строкам (до фильтрации по тегам) */
  const allTags = Array.from(new Set(rows.flatMap((r) => r.tags))).sort((a, b) =>
    a.localeCompare(b, "ru")
  );

  if (allTags.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-neutral-100 bg-neutral-50/70 px-3.5 py-2.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900">
          Параметры
        </span>
        {activeTags.length > 0 && (
          <button
            type="button"
            onClick={onClearTags}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 transition-colors hover:text-blue-700"
          >
            <X className="h-3 w-3" />
            Сбросить ({activeTags.length})
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 p-2.5">
        {allTags.map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors",
                active
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
