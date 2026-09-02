"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import type { SectionComponentProps } from "./index";

export function DeliveryZones({ props, data }: SectionComponentProps) {
  const resolved = data as { zones: { slug: string; name: string; isRegion: boolean; deliveryTariffMultiplier: number }[] } | null;
  const zones = resolved?.zones ?? [];
  const title = (props.title as string) ?? "Зоны доставки";
  const limit = (props.limit as number) ?? 34;
  const items = zones.slice(0, limit);

  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--atlas-font-heading)" }}>
        <MapPin size={24} style={{ color: "var(--atlas-primary)" }} />
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {items.map((z) => (
          <Link
            key={z.slug}
            href={`/geo/${z.slug}`}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--atlas-surface-2)]"
            style={{ border: "1px solid var(--atlas-border)" }}
          >
            <span className="truncate">{z.name}</span>
            {z.deliveryTariffMultiplier > 1 && (
              <span className="text-xs shrink-0" style={{ color: "var(--atlas-text-muted)" }}>
                ×{z.deliveryTariffMultiplier}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
