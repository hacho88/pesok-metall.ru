"use client";

import { Truck, Clock, MapPin, Package, Phone } from "lucide-react";
import { AtlasBreadcrumbs } from "../catalog/AtlasBreadcrumbs";

interface Zone { slug: string; name: string; isRegion?: boolean; deliveryTariffMultiplier?: number; }

export function DeliveryPageContent({ zones, currentZone }: { zones: Zone[]; currentZone: { slug: string; name: string } | null }) {
  const getMult = (z: Zone) => z.deliveryTariffMultiplier ?? 1.0;
  const cityZones = zones.filter((z) => !z.isRegion && getMult(z) <= 1.0);
  const nearZones = zones.filter((z) => getMult(z) > 1.0 && getMult(z) <= 1.2);
  const farZones = zones.filter((z) => getMult(z) > 1.2 && getMult(z) <= 1.5);
  const veryFarZones = zones.filter((z) => getMult(z) > 1.5);

  const getDeliveryTime = (mult: number) => {
    if (mult <= 1.0) return "В день заказа (при оформлении до 14:00)";
    if (mult <= 1.2) return "1–2 дня";
    if (mult <= 1.5) return "1–3 дня";
    return "2–4 дня";
  };

  return (
    <div className="atlas-fade-in">
      <AtlasBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Доставка" }]} />

      <h1 className="text-3xl font-bold mt-4 mb-3 atlas-heading-accent" style={{ fontFamily: "var(--atlas-font-heading)" }}>
        Доставка металлопроката и сыпучих материалов
      </h1>
      <p className="text-base mb-8 max-w-3xl" style={{ color: "var(--atlas-text-muted)" }}>
        Доставляем по Москве и Московской области. В день заказа при оформлении до 14:00.
        Подбираем оптимальный транспорт под объём заказа — от газели до самосвала.
      </p>

      {/* Transport types */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <TransportCard icon="🚚" title="Газель" desc="До 1.5 т" price="от 800 ₽" />
        <TransportCard icon="🏗️" title="Манипулятор" desc="До 5 т" price="от 2500 ₽" />
        <TransportCard icon="🚛" title="Самосвал" desc="До 10 т" price="от 4000 ₽" />
        <TransportCard icon="🚂" title="Длинномер" desc="До 20 т" price="по запросу" />
      </div>

      {/* Zone groups */}
      <div className="space-y-6">
        <ZoneGroup
          title="Москва (в пределах МКАД)"
          color="#10B981"
          time="В день заказа"
          zones={cityZones}
          getDeliveryTime={getDeliveryTime}
        />
        <ZoneGroup
          title="Ближайшее Подмосковье (до 30 км от МКАД)"
          color="#F59E0B"
          time="1–2 дня"
          zones={nearZones}
          getDeliveryTime={getDeliveryTime}
        />
        <ZoneGroup
          title="Подмосковье (30–60 км от МКАД)"
          color="#F97316"
          time="1–3 дня"
          zones={farZones}
          getDeliveryTime={getDeliveryTime}
        />
        {veryFarZones.length > 0 && (
          <ZoneGroup
            title="Дальнее Подмосковье (60+ км от МКАД)"
            color="#EF4444"
            time="2–4 дня"
            zones={veryFarZones}
            getDeliveryTime={getDeliveryTime}
          />
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        <InfoCard icon={<Clock size={24} />} title="Сроки доставки" text="При оформлении до 14:00 — доставка в день заказа по Москве. Для МО — на следующий день." />
        <InfoCard icon={<Package size={24} />} title="Самовывоз" text="Возможен самовывоз со склада. Адрес и время согласуются с менеджером после заказа." />
        <InfoCard icon={<Phone size={24} />} title="Согласование" text="Менеджер перезвонит в течение 15 минут для подтверждения заказа и времени доставки." />
      </div>

      {/* CTA */}
      <div className="mt-10 p-8 rounded-xl text-center" style={{ background: "var(--atlas-primary)", color: "#fff" }}>
        <h2 className="text-2xl font-bold mb-2">Нужна доставка?</h2>
        <p className="mb-4 opacity-90">Оформите заказ или позвоните — рассчитаем стоимость доставки под ваш адрес</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="/shop" className="atlas-btn atlas-btn-lg" style={{ background: "#fff", color: "var(--atlas-primary)" }}>Перейти в каталог</a>
          <a href="tel:+74950000000" className="atlas-btn atlas-btn-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>Позвонить</a>
        </div>
      </div>
    </div>
  );
}

function TransportCard({ icon, title, desc, price }: { icon: string; title: string; desc: string; price: string }) {
  return (
    <div className="atlas-card atlas-card-elevated p-5 text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="font-bold text-base">{title}</div>
      <div className="text-sm" style={{ color: "var(--atlas-text-muted)" }}>{desc}</div>
      <div className="text-sm font-bold mt-2" style={{ color: "var(--atlas-primary)" }}>{price}</div>
    </div>
  );
}

function ZoneGroup({ title, color, time, zones, getDeliveryTime }: { title: string; color: string; time: string; zones: Zone[]; getDeliveryTime: (m: number) => string }) {
  if (zones.length === 0) return null;
  return (
    <div className="atlas-card p-5" style={{ borderTop: `3px solid ${color}` }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: color }} />
          {title}
        </h2>
        <span className="text-sm flex items-center gap-1" style={{ color: "var(--atlas-text-muted)" }}>
          <Clock size={14} /> {time}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {zones.map((z) => (
          <a
            key={z.slug}
            href={`/geo/${z.slug}`}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all hover:shadow-md"
            style={{ background: `color-mix(in srgb, ${color} 6%, transparent)`, border: `1px solid ${color}22` }}
          >
            <span className="truncate">{z.name}</span>
            <span className="text-xs font-bold shrink-0 ml-1" style={{ color }}>×{z.deliveryTariffMultiplier ?? 1.0}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="atlas-card p-5">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: "color-mix(in srgb, var(--atlas-primary) 10%, transparent)", color: "var(--atlas-primary)" }}>
        {icon}
      </div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm" style={{ color: "var(--atlas-text-muted)" }}>{text}</p>
    </div>
  );
}
