"use client";

import { useMemo, useState } from "react";
import { Calculator, MapPin, RefreshCw, Scale, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

// Плотности песка, т/м³
const SAND_DENSITY: Record<string, number> = {
  river: 1.6,
  quarry: 1.5,
  washed: 1.65,
};

const SAND_PRICE_PER_TON: Record<string, number> = {
  river: 950,
  quarry: 650,
  washed: 1100,
};

const METAL_PRICES: Record<string, { perMeter: number; perTon: number }> = {
  rebar: { perMeter: 62, perTon: 62000 },
  sheet: { perMeter: 1450, perTon: 58000 },
  pipe: { perMeter: 380, perTon: 61000 },
};

// Логистические зоны: коэффициент к базовой подаче
const LOGISTIC_ZONES = [
  { id: "moscow", name: "Москва (в пределах МКАД)", multiplier: 1.0, base: 2500 },
  { id: "near", name: "До 15 км от МКАД", multiplier: 1.15, base: 2900 },
  { id: "mid", name: "15–40 км от МКАД", multiplier: 1.35, base: 3400 },
  { id: "far", name: "40–80 км от МКАД", multiplier: 1.6, base: 4000 },
];

const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

export function V4Calculator() {
  const [tab, setTab] = useState<"sand" | "metal">("sand");

  // Sand state
  const [sandType, setSandType] = useState("river");
  const [sandUnit, setSandUnit] = useState<"m3" | "ton">("m3");
  const [sandValue, setSandValue] = useState(10);

  // Metal state
  const [metalType, setMetalType] = useState("rebar");
  const [metalUnit, setMetalUnit] = useState<"m" | "ton">("m");
  const [metalValue, setMetalValue] = useState(100);

  const [zone, setZone] = useState("moscow");

  const sandResult = useMemo(() => {
    const density = SAND_DENSITY[sandType];
    const tons = sandUnit === "m3" ? sandValue * density : sandValue;
    const m3 = sandUnit === "m3" ? sandValue : sandValue / density;
    const materialCost = tons * SAND_PRICE_PER_TON[sandType];
    const z = LOGISTIC_ZONES.find((l) => l.id === zone)!;
    const delivery = Math.round(z.base * z.multiplier);
    return { tons, m3, materialCost, delivery, total: materialCost + delivery };
  }, [sandType, sandUnit, sandValue, zone]);

  const metalResult = useMemo(() => {
    const p = METAL_PRICES[metalType];
    const meters = metalUnit === "m" ? metalValue : (metalValue * 1000) / p.perTon;
    const tons = metalUnit === "ton" ? metalValue : (metalValue * p.perTon) / 1000;
    const materialCost = metalUnit === "m" ? meters * p.perMeter : tons * p.perTon;
    const z = LOGISTIC_ZONES.find((l) => l.id === zone)!;
    const delivery = Math.round(z.base * z.multiplier);
    return { meters, tons, materialCost, delivery, total: materialCost + delivery };
  }, [metalType, metalUnit, metalValue, zone]);

  return (
    <section id="calculator" className="border-b border-[#3A3F44] bg-[#F4EBE1] py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 border border-[#1A1D20]/20 bg-[#E6D5BC] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#1A1D20]">
              <Calculator className="h-3.5 w-3.5" />
              Powerful View
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#1A1D20] sm:text-4xl">
              Калькулятор <span className="text-[#FF6B00]">материалов</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm font-medium text-[#1A1D20]/60">
              Мгновенная конверсия объёма в тонны и метров в тонны с учётом
              логистической зоны доставки.
            </p>
          </div>
          <div className="flex items-center rounded-full border border-[#1A1D20]/20 bg-[#E6D5BC] p-1">
            <button
              type="button"
              onClick={() => setTab("sand")}
              className={cn(
                "flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all",
                tab === "sand" ? "bg-[#1A1D20] text-[#F4EBE1]" : "text-[#1A1D20]/60 hover:text-[#1A1D20]"
              )}
            >
              <Scale className="h-4 w-4" />
              Песок и щебень
            </button>
            <button
              type="button"
              onClick={() => setTab("metal")}
              className={cn(
                "flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all",
                tab === "metal" ? "bg-[#1A1D20] text-[#F4EBE1]" : "text-[#1A1D20]/60 hover:text-[#1A1D20]"
              )}
            >
              <Truck className="h-4 w-4" />
              Металлопрокат
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Inputs */}
          <div className="border-2 border-[#1A1D20] bg-[#F4EBE1] p-6 sm:p-8">
            {tab === "sand" ? (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#1A1D20]/50">
                      Тип материала
                    </label>
                    <select
                      value={sandType}
                      onChange={(e) => setSandType(e.target.value)}
                      className="h-13 w-full border-2 border-[#1A1D20]/20 bg-[#E6D5BC] px-4 py-3.5 text-sm font-bold text-[#1A1D20] focus:border-[#FF6B00] focus:outline-none"
                    >
                      <option value="river">Песок речной</option>
                      <option value="quarry">Песок карьерный</option>
                      <option value="washed">Песок мытый</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#1A1D20]/50">
                      Единица расчёта
                    </label>
                    <div className="flex items-center rounded border-2 border-[#1A1D20]/20 bg-[#E6D5BC] p-1">
                      {[
                        { id: "m3", label: "м³" },
                        { id: "ton", label: "тонны" },
                      ].map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setSandUnit(u.id as "m3" | "ton")}
                          className={cn(
                            "flex-1 rounded px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all",
                            sandUnit === u.id ? "bg-[#FF6B00] text-[#1A1D20]" : "text-[#1A1D20]/60 hover:text-[#1A1D20]"
                          )}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#1A1D20]/50">
                    Объём / вес
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={sandValue}
                      onChange={(e) => setSandValue(Math.max(0.5, Number(e.target.value) || 0.5))}
                      className="h-14 w-full border-2 border-[#1A1D20]/20 bg-[#E6D5BC] px-5 text-2xl font-black text-[#1A1D20] focus:border-[#FF6B00] focus:outline-none"
                    />
                    <span className="shrink-0 text-sm font-black uppercase text-[#1A1D20]/50">
                      {sandUnit === "m3" ? "м³" : "т"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#1A1D20]/50">
                    <RefreshCw className="h-3.5 w-3.5 text-[#FF6B00]" />
                    {sandUnit === "m3"
                      ? `${sandValue} м³ = ${sandResult.tons.toFixed(1)} т (плотность ${SAND_DENSITY[sandType]} т/м³)`
                      : `${sandValue} т = ${sandResult.m3.toFixed(1)} м³ (плотность ${SAND_DENSITY[sandType]} т/м³)`}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#1A1D20]/50">
                      Профиль
                    </label>
                    <select
                      value={metalType}
                      onChange={(e) => setMetalType(e.target.value)}
                      className="h-13 w-full border-2 border-[#1A1D20]/20 bg-[#E6D5BC] px-4 py-3.5 text-sm font-bold text-[#1A1D20] focus:border-[#FF6B00] focus:outline-none"
                    >
                      <option value="rebar">Арматура А500С</option>
                      <option value="sheet">Лист стальной</option>
                      <option value="pipe">Труба профильная</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#1A1D20]/50">
                      Единица расчёта
                    </label>
                    <div className="flex items-center rounded border-2 border-[#1A1D20]/20 bg-[#E6D5BC] p-1">
                      {[
                        { id: "m", label: "метры" },
                        { id: "ton", label: "тонны" },
                      ].map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setMetalUnit(u.id as "m" | "ton")}
                          className={cn(
                            "flex-1 rounded px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all",
                            metalUnit === u.id ? "bg-[#FF6B00] text-[#1A1D20]" : "text-[#1A1D20]/60 hover:text-[#1A1D20]"
                          )}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#1A1D20]/50">
                    Количество
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={metalValue}
                      onChange={(e) => setMetalValue(Math.max(1, Number(e.target.value) || 1))}
                      className="h-14 w-full border-2 border-[#1A1D20]/20 bg-[#E6D5BC] px-5 text-2xl font-black text-[#1A1D20] focus:border-[#FF6B00] focus:outline-none"
                    />
                    <span className="shrink-0 text-sm font-black uppercase text-[#1A1D20]/50">
                      {metalUnit === "m" ? "м" : "т"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#1A1D20]/50">
                    <RefreshCw className="h-3.5 w-3.5 text-[#FF6B00]" />
                    {metalUnit === "m"
                      ? `${metalValue} м = ${metalResult.tons.toFixed(2)} т`
                      : `${metalValue} т = ${metalResult.meters.toFixed(0)} м`}
                  </div>
                </div>
              </div>
            )}

            {/* Delivery zone */}
            <div className="mt-8 border-t-2 border-[#1A1D20]/10 pt-6">
              <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1A1D20]/50">
                <MapPin className="h-3.5 w-3.5 text-[#FF6B00]" />
                Адрес доставки (логистическая зона)
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {LOGISTIC_ZONES.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setZone(z.id)}
                    className={cn(
                      "flex items-center justify-between rounded border-2 px-4 py-3 text-left text-xs font-bold transition-all",
                      zone === z.id
                        ? "border-[#FF6B00] bg-[#FF6B00]/10 text-[#1A1D20]"
                        : "border-[#1A1D20]/15 bg-[#E6D5BC]/50 text-[#1A1D20]/60 hover:border-[#1A1D20]/40"
                    )}
                  >
                    <span>{z.name}</span>
                    <span className="font-black text-[#FF6B00]">×{z.multiplier}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result panel */}
          <div className="flex flex-col border-2 border-[#FF6B00] bg-[#1A1D20] p-6 text-[#F4EBE1] shadow-[0_0_50px_rgba(255,107,0,0.15)] sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FF9900]">
              Расчёт стоимости
            </p>
            <div className="mt-6 space-y-4">
              <ResultRow
                label={tab === "sand" ? "Материал" : "Металлопрокат"}
                value={`${fmt(tab === "sand" ? sandResult.materialCost : metalResult.materialCost)} ₽`}
              />
              <ResultRow
                label="Доставка"
                value={`${fmt(tab === "sand" ? sandResult.delivery : metalResult.delivery)} ₽`}
              />
              <div className="border-t border-[#3A3F44] pt-4">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-[#E6D5BC]/60">
                    Итого
                  </span>
                  <span className="text-4xl font-black tracking-tight text-[#FF6B00]">
                    {fmt(tab === "sand" ? sandResult.total : metalResult.total)} ₽
                  </span>
                </div>
                <p className="mt-1 text-right text-[10px] font-bold text-[#E6D5BC]/40">
                  с доставкой до объекта
                </p>
              </div>
            </div>
            <a
              href="tel:+74950000000"
              className="mt-8 flex h-14 items-center justify-center gap-2 bg-[#FF6B00] text-sm font-black uppercase tracking-widest text-[#1A1D20] transition-all hover:bg-[#FF9900] active:scale-[0.98]"
            >
              <Truck className="h-4 w-4" />
              Заказать с доставкой
            </a>
            <p className="mt-4 text-center text-[10px] font-medium text-[#E6D5BC]/40">
              Точную цену подтвердит менеджер. Цены указаны с НДС.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-widest text-[#E6D5BC]/60">{label}</span>
      <span className="text-lg font-black text-[#F4EBE1]">{value}</span>
    </div>
  );
}
