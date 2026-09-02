"use client";

import { useMemo, useState } from "react";
import { Calculator, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Вес метра арматуры по диаметру, кг/м (ГОСТ 5781-82)
const REBAR_WEIGHT: Record<string, number> = {
  "6": 0.222,
  "8": 0.395,
  "10": 0.617,
  "12": 0.888,
  "14": 1.21,
  "16": 1.58,
  "18": 2.0,
  "20": 2.47,
  "22": 2.98,
  "25": 3.85,
};

const SAND_DENSITY = 1.5; // т/м³

const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

export function IndustrialCalculator() {
  const [tab, setTab] = useState<"metal" | "sand">("metal");

  // Metal: тонны ↔ метры
  const [rebarDia, setRebarDia] = useState("12");
  const [metalValue, setMetalValue] = useState(100);
  const [metalUnit, setMetalUnit] = useState<"m" | "ton">("m");

  // Sand: объём ↔ вес
  const [sandValue, setSandValue] = useState(10);
  const [sandUnit, setSandUnit] = useState<"m3" | "ton">("m3");

  const metalResult = useMemo(() => {
    const kgPerM = REBAR_WEIGHT[rebarDia] ?? 0.888;
    const meters = metalUnit === "m" ? metalValue : (metalValue * 1000) / kgPerM;
    const tons = metalUnit === "ton" ? metalValue : (metalValue * kgPerM) / 1000;
    return { meters, tons, kgPerM };
  }, [rebarDia, metalValue, metalUnit]);

  const sandResult = useMemo(() => {
    const m3 = sandUnit === "m3" ? sandValue : sandValue / SAND_DENSITY;
    const tons = sandUnit === "ton" ? sandValue : sandValue * SAND_DENSITY;
    return { m3, tons };
  }, [sandValue, sandUnit]);

  return (
    <section id="calculator" className="border-b border-[#3A4454] bg-[#1B2129] py-16 text-[#F5F7FA]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 border border-[#FF3B1F] bg-[#FF3B1F]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#FF3B1F]">
              <Calculator className="h-3.5 w-3.5" />
              Металлургический калькулятор
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
              Тонны ↔ метры · объём ↔ вес
            </h2>
          </div>
          <div className="flex items-center border border-[#3A4454] bg-[#232B36] p-1">
            <button
              type="button"
              onClick={() => setTab("metal")}
              className={cn(
                "px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors",
                tab === "metal" ? "bg-[#FF3B1F] text-white" : "text-[#9AA5B5] hover:text-[#F5F7FA]"
              )}
            >
              Металл
            </button>
            <button
              type="button"
              onClick={() => setTab("sand")}
              className={cn(
                "px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors",
                tab === "sand" ? "bg-[#FF3B1F] text-white" : "text-[#9AA5B5] hover:text-[#F5F7FA]"
              )}
            >
              Песок / щебень
            </button>
          </div>
        </div>

        <div className="grid gap-px border border-[#3A4454] bg-[#3A4454] lg:grid-cols-2">
          {/* Inputs */}
          <div className="bg-[#1B2129] p-6 sm:p-8">
            {tab === "metal" ? (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#9AA5B5]">
                    Диаметр арматуры, мм (ГОСТ 5781-82)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(REBAR_WEIGHT).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setRebarDia(d)}
                        className={cn(
                          "h-10 w-12 border font-mono text-sm font-bold transition-colors",
                          rebarDia === d
                            ? "border-[#FF3B1F] bg-[#FF3B1F] text-white"
                            : "border-[#3A4454] bg-[#232B36] text-[#9AA5B5] hover:text-[#F5F7FA]"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#9AA5B5]">
                    Значение
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={metalValue}
                      onChange={(e) => setMetalValue(Math.max(1, Number(e.target.value) || 1))}
                      className="h-13 w-full border border-[#3A4454] bg-[#14181E] px-4 font-mono text-xl font-black text-[#F5F7FA] focus:border-[#FF3B1F] focus:outline-none"
                    />
                    <div className="flex shrink-0 border border-[#3A4454]">
                      {[
                        { id: "m", label: "м" },
                        { id: "ton", label: "т" },
                      ].map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setMetalUnit(u.id as "m" | "ton")}
                          className={cn(
                            "px-4 py-3.5 text-xs font-black uppercase transition-colors",
                            metalUnit === u.id ? "bg-[#FF3B1F] text-white" : "bg-[#232B36] text-[#9AA5B5]"
                          )}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 border border-[#3A4454] bg-[#232B36] p-4 text-sm font-bold text-[#9AA5B5]">
                  <RefreshCw className="h-4 w-4 shrink-0 text-[#FF3B1F]" />
                  {metalUnit === "m"
                    ? `${fmt(metalValue)} м = ${fmt(metalResult.tons)} т (вес метра ${metalResult.kgPerM} кг)`
                    : `${fmt(metalValue)} т = ${fmt(metalResult.meters)} м (вес метра ${metalResult.kgPerM} кг)`}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#9AA5B5]">
                    Значение
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={sandValue}
                      onChange={(e) => setSandValue(Math.max(0.5, Number(e.target.value) || 0.5))}
                      className="h-13 w-full border border-[#3A4454] bg-[#14181E] px-4 font-mono text-xl font-black text-[#F5F7FA] focus:border-[#FF3B1F] focus:outline-none"
                    />
                    <div className="flex shrink-0 border border-[#3A4454]">
                      {[
                        { id: "m3", label: "м³" },
                        { id: "ton", label: "т" },
                      ].map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setSandUnit(u.id as "m3" | "ton")}
                          className={cn(
                            "px-4 py-3.5 text-xs font-black uppercase transition-colors",
                            sandUnit === u.id ? "bg-[#FF3B1F] text-white" : "bg-[#232B36] text-[#9AA5B5]"
                          )}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 border border-[#3A4454] bg-[#232B36] p-4 text-sm font-bold text-[#9AA5B5]">
                  <RefreshCw className="h-4 w-4 shrink-0 text-[#FF3B1F]" />
                  {sandUnit === "m3"
                    ? `${fmt(sandValue)} м³ = ${fmt(sandResult.tons)} т (плотность ${SAND_DENSITY} т/м³)`
                    : `${fmt(sandValue)} т = ${fmt(sandResult.m3)} м³ (плотность ${SAND_DENSITY} т/м³)`}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA5B5]/60">
                  Плотность песка принята 1,5 т/м³ · щебня 1,4 т/м³ — уточняйте у менеджера
                </p>
              </div>
            )}
          </div>

          {/* Result */}
          <div className="flex flex-col justify-center bg-[#232B36] p-6 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FF3B1F]">
              Результат конверсии
            </p>
            <div className="mt-6 grid grid-cols-2 gap-px border border-[#3A4454] bg-[#3A4454]">
              {tab === "metal" ? (
                <>
                  <ResultCell label="Метры" value={`${fmt(metalResult.meters)} м`} />
                  <ResultCell label="Тонны" value={`${fmt(metalResult.tons)} т`} />
                  <ResultCell label="Вес метра" value={`${metalResult.kgPerM} кг`} />
                  <ResultCell label="Диаметр" value={`${rebarDia} мм`} />
                </>
              ) : (
                <>
                  <ResultCell label="Объём" value={`${fmt(sandResult.m3)} м³`} />
                  <ResultCell label="Вес" value={`${fmt(sandResult.tons)} т`} />
                  <ResultCell label="Плотность" value={`${SAND_DENSITY} т/м³`} />
                  <ResultCell label="Тип" value="Песок" />
                </>
              )}
            </div>
            <a
              href="tel:+74950000000"
              className="mt-6 flex h-13 items-center justify-center bg-[#FF3B1F] text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-[#e02f15]"
            >
              Уточнить цену по расчёту
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#1B2129] p-5">
      <p className="text-[9px] font-black uppercase tracking-widest text-[#9AA5B5]">{label}</p>
      <p className="mt-1 font-mono text-xl font-black text-[#FF3B1F]">{value}</p>
    </div>
  );
}
