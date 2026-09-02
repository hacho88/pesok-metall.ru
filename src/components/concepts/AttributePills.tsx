"use client";

import { useState } from "react";

/**
 * Текст-пилюли для выбора значения атрибута товара
 * (например: [12мм] [14мм] [16мм]) вместо стандартного <select>.
 * Одна группа = один атрибут (key), выбор — одиночный.
 */
export interface AttributeOption {
  key: string;
  value: string;
}

export function AttributePills({
  attributes,
  label,
  onChange,
}: {
  attributes: AttributeOption[];
  label?: string;
  onChange?: (selected: Record<string, string>) => void;
}) {
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const a of attributes) {
      if (!(a.key in init)) init[a.key] = a.value;
    }
    return init;
  });

  // Группируем по ключу атрибута, сохраняя порядок
  const groups: { key: string; values: string[] }[] = [];
  for (const a of attributes) {
    const g = groups.find((x) => x.key === a.key);
    if (g) {
      if (!g.values.includes(a.value)) g.values.push(a.value);
    } else {
      groups.push({ key: a.key, values: [a.value] });
    }
  }

  function pick(key: string, value: string) {
    const next = { ...selected, [key]: value };
    setSelected(next);
    onChange?.(next);
  }

  if (groups.length === 0) return null;

  return (
    <div className="attr-pills space-y-4">
      {groups.map((g) => (
        <div key={g.key} className="attr-pills__group">
          {label && <span className="attr-pills__label block mb-2">{g.key}</span>}
          <div className="attr-pills__row no-scrollbar flex gap-2 overflow-x-auto pb-1 scroll-smooth">
            {g.values.map((v) => (
              <button
                key={v}
                type="button"
                className={`attr-pill px-4 py-1.5 whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                  selected[g.key] === v 
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "bg-background border-border text-muted-foreground hover:border-primary/50"
                }`}
                onClick={() => pick(g.key, v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
