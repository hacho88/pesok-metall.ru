"use client";

import * as Icons from "lucide-react";
import type { SectionComponentProps } from "./index";

interface AdvItem { icon: string; title: string; text: string; }

export function Advantages({ props }: SectionComponentProps) {
  const items = (props.items as AdvItem[]) ?? [];
  const variant = (props.variant as string) ?? "cards";

  if (variant === "list") {
    return (
      <div className="space-y-3">
        {items.map((item, i) => {
          const Icon = (Icons as any)[item.icon] ?? Icons.CheckCircle;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0" style={{ background: "color-mix(in srgb, var(--atlas-primary) 10%, transparent)" }}>
                <Icon size={20} style={{ color: "var(--atlas-primary)" }} />
              </div>
              <div>
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm" style={{ color: "var(--atlas-text-muted)" }}>{item.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => {
        const Icon = (Icons as any)[item.icon] ?? Icons.CheckCircle;
        return (
          <div key={i} className="atlas-card atlas-card-elevated p-5 atlas-fade-in group" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-3 transition-transform group-hover:scale-110" style={{ background: "color-mix(in srgb, var(--atlas-primary) 10%, transparent)" }}>
              <Icon size={24} style={{ color: "var(--atlas-primary)" }} />
            </div>
            <h3 className="font-bold text-base mb-1">{item.title}</h3>
            <p className="text-sm" style={{ color: "var(--atlas-text-muted)" }}>{item.text}</p>
          </div>
        );
      })}
    </div>
  );
}
