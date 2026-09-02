"use client";

import * as Icons from "lucide-react";
import type { SectionComponentProps } from "./index";

interface PromoItem {
  icon: string;
  title: string;
  text: string;
}

export function PromoStrip({ props }: SectionComponentProps) {
  const items = (props.items as PromoItem[]) ?? [];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => {
        const Icon = (Icons as any)[item.icon] ?? Icons.CheckCircle;
        return (
          <div key={i} className="flex items-start gap-3 p-4 rounded-lg" style={{ border: "1px solid var(--atlas-border)" }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0" style={{ background: "color-mix(in srgb, var(--atlas-primary) 10%, transparent)" }}>
              <Icon size={20} style={{ color: "var(--atlas-primary)" }} />
            </div>
            <div>
              <div className="font-semibold text-sm">{item.title}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--atlas-text-muted)" }}>{item.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
