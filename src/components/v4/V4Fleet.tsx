"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FleetVehicle {
  id: string;
  name: string;
  maxWeightKg: number;
  maxLengthMeters: number;
  baseFare: number;
  perKmCharge: number;
}

const ZONES = [
  { name: "Москва", km: "0–15", color: "#FF6B00" },
  { name: "Ближнее МО", km: "15–40", color: "#FF9900" },
  { name: "Среднее МО", km: "40–80", color: "#E6D5BC" },
  { name: "Дальнее МО", km: "80+", color: "#3A3F44" },
];

const fmt = (n: number) => n.toLocaleString("ru-RU");

export function V4Fleet({ fleet }: { fleet: FleetVehicle[] }) {
  const [index, setIndex] = useState(0);
  const vehicles = fleet.length > 0 ? fleet : [];
  const current = vehicles[index] ?? null;

  function prev() {
    if (vehicles.length === 0) return;
    setIndex((i) => (i - 1 + vehicles.length) % vehicles.length);
  }
  function next() {
    if (vehicles.length === 0) return;
    setIndex((i) => (i + 1) % vehicles.length);
  }

  return (
    <section id="fleet" className="border-b border-[#3A3F44] bg-[#F4EBE1] py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="mb-4 inline-flex items-center gap-2 border border-[#1A1D20]/20 bg-[#E6D5BC] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#1A1D20]">
            <Truck className="h-3.5 w-3.5" />
            Logistics
          </span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-[#1A1D20] sm:text-4xl">
            Автопарк и <span className="text-[#FF6B00]">зоны доставки</span>
          </h2>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* Fleet carousel */}
          <div>
            {current && (
              <div className="relative border-2 border-[#1A1D20] bg-[#1A1D20] p-8 text-[#F4EBE1]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-30"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 8px)",
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FF9900]">
                        Транспорт {index + 1} / {vehicles.length}
                      </p>
                      <h3 className="mt-2 text-2xl font-black uppercase tracking-tight">
                        {current.name}
                      </h3>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-[#FF6B00] text-[#FF6B00]">
                      <Truck className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-4">
                    <Stat label="Грузоподъёмность" value={`${fmt(current.maxWeightKg)} кг`} />
                    <Stat label="Длина кузова" value={`${current.maxLengthMeters} м`} />
                    <Stat label="Подача" value={`${fmt(current.baseFare)} ₽`} />
                  </div>
                  <p className="mt-4 text-xs font-bold text-[#E6D5BC]/50">
                    + {fmt(current.perKmCharge)} ₽/км от МКАД
                  </p>

                  <div className="mt-8 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={prev}
                      className="flex h-12 w-12 items-center justify-center border border-[#3A3F44] text-[#E6D5BC] transition-all hover:border-[#FF6B00] hover:text-[#FF6B00] active:scale-95"
                      aria-label="Предыдущий"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex gap-2">
                      {vehicles.map((v, i) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setIndex(i)}
                          className={cn(
                            "h-2.5 w-2.5 transition-all",
                            i === index ? "w-8 bg-[#FF6B00]" : "bg-[#3A3F44] hover:bg-[#FF6B00]/50"
                          )}
                          aria-label={v.name}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={next}
                      className="flex h-12 w-12 items-center justify-center border border-[#3A3F44] text-[#E6D5BC] transition-all hover:border-[#FF6B00] hover:text-[#FF6B00] active:scale-95"
                      aria-label="Следующий"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Zone map */}
          <div className="border-2 border-[#1A1D20]/15 bg-[#E6D5BC]/40 p-6">
            <p className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1A1D20]/60">
              <MapPin className="h-4 w-4 text-[#FF6B00]" />
              Карта покрытия
            </p>
            {/* Stylized concentric map */}
            <div className="relative mx-auto flex aspect-square max-w-[300px] items-center justify-center">
              {[100, 72, 46, 22].map((size, i) => (
                <div
                  key={size}
                  className="absolute rounded-full border-2"
                  style={{
                    width: `${size}%`,
                    height: `${size}%`,
                    borderColor: ZONES[i].color,
                    background: i === 0 ? "rgba(255,107,0,0.08)" : "transparent",
                  }}
                />
              ))}
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B00] text-[#1A1D20] shadow-[0_0_30px_rgba(255,107,0,0.5)]">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {ZONES.map((z) => (
                <div key={z.name} className="flex items-center justify-between text-xs font-bold text-[#1A1D20]/70">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5" style={{ background: z.color }} />
                    {z.name}
                  </span>
                  <span className="font-black text-[#1A1D20]/50">{z.km} км</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#3A3F44] bg-[#2B3035] p-4">
      <p className="text-[9px] font-black uppercase tracking-widest text-[#E6D5BC]/50">{label}</p>
      <p className="mt-1 text-lg font-black text-[#FF9900]">{value}</p>
    </div>
  );
}
