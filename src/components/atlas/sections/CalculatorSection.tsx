"use client";

import { useState, useMemo } from "react";
import { Calculator as CalcIcon, Truck, Mail, Package } from "lucide-react";
import type { SectionComponentProps } from "./index";
import { calculateBulkMaterials, assignOptimalVehicle, estimateDeliveryCost, formatRubles, formatNumber } from "@/lib/calculator";

interface FleetVehicle { id: string; name: string; maxWeightKg: any; maxLengthMeters: any; baseFare: any; perKmCharge: any; isActive: boolean; }

export function CalculatorSection({ props, data }: SectionComponentProps) {
  const resolved = data as { fleet: FleetVehicle[] } | null;
  const fleet = resolved?.fleet ?? [];
  const title = (props.title as string) ?? "Калькулятор материалов и доставки";

  const [mode, setMode] = useState<"bulk" | "metal">("bulk");
  const [area, setArea] = useState("");
  const [thickness, setThickness] = useState("10");
  const [density, setDensity] = useState("1600");
  const [distance, setDistance] = useState("20");

  const [length, setLength] = useState("");
  const [weightPerM, setWeightPerM] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");

  const [emailModal, setEmailModal] = useState(false);

  const bulk = useMemo(() => mode === "bulk" && area && thickness && density
    ? calculateBulkMaterials(Number(area), Number(thickness), Number(density))
    : null, [mode, area, thickness, density]);

  const vehicle = bulk ? assignOptimalVehicle(bulk.totalWeightKg, 6, fleet) : null;
  const deliveryCost = vehicle ? estimateDeliveryCost(vehicle, Number(distance)) : 0;

  const metalWeight = mode === "metal" && length && weightPerM ? Number(length) * Number(weightPerM) : 0;
  const metalVehicle = metalWeight > 0 ? assignOptimalVehicle(metalWeight, 6, fleet) : null;
  const metalDelivery = metalVehicle ? estimateDeliveryCost(metalVehicle, Number(distance)) : 0;
  const metalCost = metalWeight > 0 && pricePerUnit ? metalWeight * Number(pricePerUnit) : 0;

  const hasResult = bulk || metalWeight > 0;
  const totalCost = mode === "bulk" ? deliveryCost : (metalCost + metalDelivery);

  return (
    <div className="atlas-card atlas-card-elevated p-6 atlas-fade-in">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 atlas-heading-accent" style={{ fontFamily: "var(--atlas-font-heading)" }}>
        <CalcIcon size={24} style={{ color: "var(--atlas-primary)" }} />
        {title}
      </h2>

      {/* Tabs */}
      <div className="atlas-tabs mb-6">
        <div className={`atlas-tab ${mode === "bulk" ? "atlas-tab-active" : ""}`} onClick={() => setMode("bulk")}>
          Сыпучие материалы
        </div>
        <div className={`atlas-tab ${mode === "metal" ? "atlas-tab-active" : ""}`} onClick={() => setMode("metal")}>
          Металлопрокат
        </div>
      </div>

      {mode === "bulk" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <label className="block">
            <span className="text-sm font-medium block mb-1.5">Площадь, м²</span>
            <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="atlas-input" placeholder="100" />
          </label>
          <label className="block">
            <span className="text-sm font-medium block mb-1.5">Толщина слоя, см</span>
            <input type="number" value={thickness} onChange={(e) => setThickness(e.target.value)} className="atlas-input" placeholder="10" />
          </label>
          <label className="block">
            <span className="text-sm font-medium block mb-1.5">Плотность, кг/м³</span>
            <input type="number" value={density} onChange={(e) => setDensity(e.target.value)} className="atlas-input" placeholder="1600" />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <label className="block">
            <span className="text-sm font-medium block mb-1.5">Длина, м</span>
            <input type="number" value={length} onChange={(e) => setLength(e.target.value)} className="atlas-input" placeholder="100" />
          </label>
          <label className="block">
            <span className="text-sm font-medium block mb-1.5">Вес метра, кг</span>
            <input type="number" value={weightPerM} onChange={(e) => setWeightPerM(e.target.value)} className="atlas-input" placeholder="0.888" step="0.001" />
          </label>
          <label className="block">
            <span className="text-sm font-medium block mb-1.5">Цена за кг, ₽</span>
            <input type="number" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} className="atlas-input" placeholder="55" />
          </label>
        </div>
      )}

      <label className="block mb-6 max-w-xs">
        <span className="text-sm font-medium block mb-1.5">Расстояние от МКАД, км</span>
        <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className="atlas-input" placeholder="20" />
      </label>

      {/* Results breakdown */}
      {hasResult && (
        <div className="space-y-3">
          {bulk && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-lg" style={{ background: "var(--atlas-surface-2)" }}>
              <Stat label="Объём" value={`${formatNumber(bulk.volumeM3, 2)} м³`} />
              <Stat label="Вес" value={`${formatNumber(bulk.totalWeightKg, 0)} кг`} />
              <Stat label="Мешки 30 кг" value={`${bulk.bags30kg} шт`} />
              <Stat label="Биг-беги 1 т" value={`${bulk.bigBags1Ton} шт`} />
            </div>
          )}

          {metalWeight > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-lg" style={{ background: "var(--atlas-surface-2)" }}>
              <Stat label="Общий вес" value={`${formatNumber(metalWeight, 0)} кг`} />
              <Stat label="Тонн" value={`${formatNumber(metalWeight / 1000, 2)} т`} />
              {metalCost > 0 && <Stat label="Стоимость материала" value={`${formatRubles(metalCost)} ₽`} />}
              <Stat label="Длина" value={`${formatNumber(Number(length), 0)} м`} />
            </div>
          )}

          {/* Delivery + total breakdown */}
          {(vehicle || metalVehicle) && (
            <div className="p-4 rounded-lg space-y-2" style={{ background: "color-mix(in srgb, var(--atlas-primary) 8%, transparent)" }}>
              <div className="flex items-center gap-3 mb-2">
                <Truck size={24} style={{ color: "var(--atlas-primary)" }} />
                <div>
                  <div className="font-semibold text-sm">{(vehicle ?? metalVehicle)?.name}</div>
                  <div className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>Оптимальный транспорт для вашего объёма</div>
                </div>
              </div>
              <div className="border-t pt-2 space-y-1.5 text-sm" style={{ borderColor: "color-mix(in srgb, var(--atlas-primary) 20%, transparent)" }}>
                {mode === "metal" && metalCost > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--atlas-text-muted)" }}>Стоимость материала</span>
                    <span className="font-medium">{formatRubles(metalCost)} ₽</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: "var(--atlas-text-muted)" }}>Стоимость доставки ({distance} км)</span>
                  <span className="font-medium">{formatRubles(mode === "bulk" ? deliveryCost : metalDelivery)} ₽</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-1.5 border-t" style={{ borderColor: "color-mix(in srgb, var(--atlas-primary) 20%, transparent)" }}>
                  <span>Итого</span>
                  <span style={{ color: "var(--atlas-primary)" }}>{formatRubles(totalCost)} ₽</span>
                </div>
              </div>
            </div>
          )}

          {/* Email button */}
          <button
            className="atlas-btn atlas-btn-outline w-full"
            onClick={() => setEmailModal(true)}
          >
            <Mail size={18} /> Отправить расчёт на email
          </button>
        </div>
      )}

      {!hasResult && (
        <div className="text-center py-12" style={{ color: "var(--atlas-text-muted)" }}>
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Заполните параметры для расчёта</p>
        </div>
      )}

      {/* Email modal */}
      {emailModal && (
        <EmailModal
          onClose={() => setEmailModal(false)}
          calcData={{
            mode,
            area, thickness, density, distance,
            length, weightPerM, pricePerUnit,
            bulk, vehicle, deliveryCost,
            metalWeight, metalVehicle, metalDelivery, metalCost,
            totalCost,
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>{label}</div>
      <div className="font-bold text-lg atlas-price-main">{value}</div>
    </div>
  );
}

function EmailModal({ onClose, calcData }: { onClose: () => void; calcData: any }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!email.trim()) return;
    setSent(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 atlas-overlay-enter" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-xl p-6 atlas-fade-in" style={{ background: "var(--atlas-surface)" }} onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "color-mix(in srgb, var(--atlas-success) 12%, transparent)" }}>
              <Mail size={32} style={{ color: "var(--atlas-success)" }} />
            </div>
            <p className="text-lg font-bold">Расчёт отправлен!</p>
            <p className="text-sm mt-1" style={{ color: "var(--atlas-text-muted)" }}>Проверьте почту {email}</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-2">Отправить расчёт на email</h3>
            <p className="text-sm mb-4" style={{ color: "var(--atlas-text-muted)" }}>
              Мы пришлём подробный расчёт с ценами и рекомендациями
            </p>
            <input className="atlas-input mb-3" placeholder="your@email.ru" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="atlas-btn atlas-btn-primary w-full atlas-btn-lg" onClick={submit} disabled={!email.trim()}>
              <Mail size={18} /> Отправить
            </button>
          </>
        )}
      </div>
    </div>
  );
}
