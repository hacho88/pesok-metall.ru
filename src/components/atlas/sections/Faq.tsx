"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SectionComponentProps } from "./index";

interface FaqItem { q: string; a: string; }

export function Faq({ props }: SectionComponentProps) {
  const title = (props.title as string) ?? "Частые вопросы";
  const items = (props.items as FaqItem[]) ?? [];
  const [open, setOpen] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--atlas-font-heading)" }}>{title}</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="atlas-card overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 text-left font-medium"
              onClick={() => setOpen(open === i ? null : i)}
            >
              {item.q}
              <ChevronDown size={18} style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "var(--atlas-text-muted)" }} />
            </button>
            {open === i && (
              <div className="px-4 pb-4 text-sm" style={{ color: "var(--atlas-text-muted)" }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
