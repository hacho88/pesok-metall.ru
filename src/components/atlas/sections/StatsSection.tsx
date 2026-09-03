"use client";

import type { SectionComponentProps } from "./index";

interface StatItem { value: string; label: string; }

export function StatsSection({ props }: SectionComponentProps) {
  const title = (props.title as string) ?? "Почему нас выбирают";
  const stats = (props.stats as StatItem[]) ?? [
    { value: "15", label: "лет на рынке" },
    { value: "5000+", label: "довольных клиентов" },
    { value: "800+", label: "позиций в каталоге" },
    { value: "34", label: "района доставки" },
  ];

  return (
    <div className="atlas-fade-in">
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 atlas-heading-accent" style={{ fontFamily: "var(--atlas-font-heading)", paddingLeft: 0 }}>
        {title}
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="text-center p-6 rounded-xl atlas-fade-in"
            style={{
              background: i % 2 === 0 ? "var(--atlas-surface)" : "color-mix(in srgb, var(--atlas-primary) 5%, var(--atlas-surface))",
              border: "1px solid var(--atlas-border)",
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <div className="text-4xl lg:text-5xl font-bold mb-2 atlas-price-main" style={{ color: "var(--atlas-primary)" }}>
              {stat.value}
            </div>
            <div className="text-sm" style={{ color: "var(--atlas-text-muted)" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
