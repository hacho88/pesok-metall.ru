"use client";

import Link from "next/link";
import { MapPin, Clock, Truck } from "lucide-react";
import type { SectionComponentProps } from "./index";

export function DeliveryZones({ props, data }: SectionComponentProps) {
  const resolved = data as { zones: { slug: string; name: string; isRegion: boolean; deliveryTariffMultiplier: number }[] } | null;
  const zones = resolved?.zones ?? [];
  const title = (props.title as string) ?? "Зоны доставки";
  const limit = (props.limit as number) ?? 34;
  const items = zones.slice(0, limit);

  if (items.length === 0) return null;

  // Color-code by multiplier
  const getZoneColor = (mult: number) => {
    if (mult <= 1.0) return { bg: "color-mix(in srgb, #10B981 8%, transparent)", border: "#10B981", text: "#10B981", label: "Базовая" };
    if (mult <= 1.2) return { bg: "color-mix(in srgb, #F59E0B 8%, transparent)", border: "#F59E0B", text: "#F59E0B", label: "+20%" };
    if (mult <= 1.5) return { bg: "color-mix(in srgb, #F97316 10%, transparent)", border: "#F97316", text: "#F97316", label: "+50%" };
    return { bg: "color-mix(in srgb, #EF4444 10%, transparent)", border: "#EF4444", text: "#EF4444", label: `+${Math.round((mult - 1) * 100)}%` };
  };

  const getDeliveryTime = (mult: number) => {
    if (mult <= 1.0) return "В день заказа";
    if (mult <= 1.2) return "1–2 дня";
    if (mult <= 1.5) return "1–3 дня";
    return "2–4 дня";
  };

  // Group by zone type
  const cityZones = items.filter((z) => !z.isRegion);
  const regionZones = items.filter((z) => z.isRegion);

  return (
    <div className="atlas-fade-in">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 atlas-heading-accent" style={{ fontFamily: "var(--atlas-font-heading)" }}>
        <MapPin size={24} style={{ color: "var(--atlas-primary)" }} />
        {title}
      </h2>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5 text-xs">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: "#10B981" }} /> Базовая цена</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: "#F59E0B" }} /> +20%</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: "#F97316" }} /> +50%</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: "#EF4444" }} /> Дальние районы</div>
      </div>

      {/* Visual zone diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ZoneCard title="Москва (МКАД)" zones={cityZones.filter((z) => z.deliveryTariffMultiplier <= 1.0)} color="#10B981" icon={<Truck size={20} />} />
        <ZoneCard title="Подмосковье (до 30 км)" zones={items.filter((z) => z.deliveryTariffMultiplier > 1.0 && z.deliveryTariffMultiplier <= 1.2)} color="#F59E0B" icon={<Truck size={20} />} />
        <ZoneCard title="Дальнее Подмосковье" zones={items.filter((z) => z.deliveryTariffMultiplier > 1.2)} color="#F97316" icon={<Truck size={20} />} />
      </div>

      {/* Full zone list */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {items.map((z) => {
          const c = getZoneColor(z.deliveryTariffMultiplier);
          return (
            <Link
              key={z.slug}
              href={`/geo/${z.slug}`}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-md atlas-card"
              style={{ background: c.bg, border: `1px solid ${c.border}33` }}
            >
              <span className="truncate flex items-center gap-1.5">
                <MapPin size={14} style={{ color: c.text }} />
                {z.name}
              </span>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xs font-bold" style={{ color: c.text }}>×{z.deliveryTariffMultiplier}</span>
                <span className="text-[10px]" style={{ color: "var(--atlas-text-muted)" }}>{getDeliveryTime(z.deliveryTariffMultiplier)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ZoneCard({ title, zones, color, icon }: { title: string; zones: any[]; color: string; icon: React.ReactNode }) {
  return (
    <div className="atlas-card p-4" style={{ borderTop: `3px solid ${color}` }}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color }}>{icon}</span>
        <h3 className="font-bold text-sm">{title}</h3>
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color }}>{zones.length}</div>
      <div className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>районов доставки</div>
      <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: "var(--atlas-text-muted)" }}>
        <Clock size={12} />
        {zones[0] ? (zones[0].deliveryTariffMultiplier <= 1.0 ? "В день заказа" : zones[0].deliveryTariffMultiplier <= 1.2 ? "1–2 дня" : "1–3 дня") : "—"}
      </div>
    </div>
  );
}
