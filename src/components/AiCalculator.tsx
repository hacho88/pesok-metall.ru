"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Calculator, Package, Truck } from "lucide-react";
import {
  calculateBulkMaterials,
  assignOptimalVehicle,
  estimateDeliveryCost,
  formatRubles,
  formatNumber,
  type FleetVehicleLike,
} from "@/lib/calculator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type CalculatorMode = "bulk" | "metal";

interface BulkMaterialPreset {
  label: string;
  density: number;
}

const BULK_PRESETS: BulkMaterialPreset[] = [
  { label: "Песок мытый (1.6 т/м³)", density: 1600 },
  { label: "Песок карьерный (1.5 т/м³)", density: 1500 },
  { label: "Щебень гранитный 5-20 (1.4 т/м³)", density: 1400 },
  { label: "Щебень известняковый (1.3 т/м³)", density: 1300 },
  { label: "Керамзит (0.5 т/м³)", density: 500 },
];

interface AiCalculatorProps {
  fleet: FleetVehicleLike[];
  geoZoneName?: string;
  pricePerBag30?: number;
  pricePerBigBag?: number;
  pricePerKgMetal?: number;
}

export function AiCalculator({
  fleet,
  geoZoneName,
  pricePerBag30 = 190,
  pricePerBigBag = 4700,
  pricePerKgMetal = 52,
}: AiCalculatorProps) {
  const [mode, setMode] = useState<CalculatorMode>("bulk");

  // Параметры сыпучих
  const [areaM2, setAreaM2] = useState(20);
  const [thicknessCm, setThicknessCm] = useState(5);
  const [presetIndex, setPresetIndex] = useState(0);

  // Параметры металла
  const [metalLengthM, setMetalLengthM] = useState(12);
  const [metalWeightPerM, setMetalWeightPerM] = useState(0.888);

  // Логистика
  const [distanceKm, setDistanceKm] = useState(15);

  const density = BULK_PRESETS[presetIndex].density;

  const bulk = useMemo(
    () => calculateBulkMaterials(areaM2, thicknessCm, density),
    [areaM2, thicknessCm, density]
  );

  const metalWeightKg = metalLengthM * metalWeightPerM;

  const { weightKg, maxLengthMeters } =
    mode === "bulk"
      ? { weightKg: bulk.totalWeightKg, maxLengthMeters: 0 }
      : { weightKg: metalWeightKg, maxLengthMeters: metalLengthM };

  const vehicle = useMemo(
    () => assignOptimalVehicle(weightKg, maxLengthMeters, fleet),
    [weightKg, maxLengthMeters, fleet]
  );

  const deliveryCost = estimateDeliveryCost(vehicle, distanceKm);

  const goodsCost =
    mode === "bulk"
      ? Math.min(
          bulk.bags30kg * pricePerBag30,
          bulk.bigBags1Ton * pricePerBigBag
        )
      : metalWeightKg * pricePerKgMetal;

  const totalCost = goodsCost + deliveryCost;

  return (
    <Card id="calculator" className="w-full overflow-hidden rounded-[2rem] border-2 shadow-2xl shadow-primary/5 font-jakarta">
      <CardHeader className="bg-muted/30 pb-8">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <Calculator className="h-5 w-5" />
            </div>
            ИИ-калькулятор
          </CardTitle>
          {geoZoneName && <Badge variant="secondary" className="rounded-full px-4 py-1 font-bold uppercase tracking-widest">{geoZoneName}</Badge>}
        </div>
        <CardDescription className="mt-4 text-base font-medium leading-relaxed">
          Перевод объёма в тару, автоподбор машины и расчёт стоимости доставки в реальном времени.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {/* Переключатель режима */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1.5">
          <button
            type="button"
            onClick={() => setMode("bulk")}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
              mode === "bulk"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Песок, щебень
          </button>
          <button
            type="button"
            onClick={() => setMode("metal")}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
              mode === "metal"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Металлопрокат
          </button>
        </div>

        {mode === "bulk" ? (
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-3">
              <Label htmlFor="area" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Площадь, м²</Label>
              <Input
                id="area"
                type="number"
                min={1}
                className="h-14 rounded-xl border-2 text-lg font-bold transition-all focus:border-primary focus:ring-0"
                value={areaM2}
                onChange={(e) => setAreaM2(Number(e.target.value))}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="thickness" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Слой, см</Label>
              <Input
                id="thickness"
                type="number"
                min={1}
                className="h-14 rounded-xl border-2 text-lg font-bold transition-all focus:border-primary focus:ring-0"
                value={thicknessCm}
                onChange={(e) => setThicknessCm(Number(e.target.value))}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="material" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Материал</Label>
              <select
                id="material"
                className="flex h-14 w-full rounded-xl border-2 bg-background px-3 py-2 text-lg font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={presetIndex}
                onChange={(e) => setPresetIndex(Number(e.target.value))}
              >
                {BULK_PRESETS.map((p, i) => (
                  <option key={p.label} value={i}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="metal-length" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Длина, м</Label>
              <Input
                id="metal-length"
                type="number"
                min={0.1}
                step={0.1}
                className="h-14 rounded-xl border-2 text-lg font-bold transition-all focus:border-primary focus:ring-0"
                value={metalLengthM}
                onChange={(e) => setMetalLengthM(Number(e.target.value))}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="metal-weight" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Вес 1м, кг</Label>
              <Input
                id="metal-weight"
                type="number"
                min={0.01}
                step={0.01}
                className="h-14 rounded-xl border-2 text-lg font-bold transition-all focus:border-primary focus:ring-0"
                value={metalWeightPerM}
                onChange={(e) => setMetalWeightPerM(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label htmlFor="distance" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Расстояние от МКАД, км</Label>
          <Input
            id="distance"
            type="number"
            min={0}
            className="h-14 rounded-xl border-2 text-lg font-bold transition-all focus:border-primary focus:ring-0"
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
          />
        </div>

        {/* Результаты */}
        <div className="grid gap-6 rounded-3xl border-2 border-primary/10 bg-primary/[0.02] p-8 sm:grid-cols-2 lg:grid-cols-4">
          {mode === "bulk" ? (
            <>
              <ResultItem
                icon={<Package className="h-5 w-5 text-primary" />}
                label="Объём"
                value={`${formatNumber(bulk.volumeM3, 2)} м³`}
              />
              <ResultItem
                label="Вес"
                value={`${formatNumber(bulk.totalWeightKg, 0)} кг`}
              />
              <ResultItem
                label="Мешки 30 кг"
                value={`${bulk.bags30kg} шт.`}
                hint={formatRubles(bulk.bags30kg * pricePerBag30)}
              />
              <ResultItem
                label="Биг-беги 1 т"
                value={`${bulk.bigBags1Ton} шт.`}
                hint={formatRubles(bulk.bigBags1Ton * pricePerBigBag)}
              />
            </>
          ) : (
            <>
              <ResultItem
                icon={<Package className="h-5 w-5 text-primary" />}
                label="Вес заказа"
                value={`${formatNumber(metalWeightKg, 0)} кг`}
              />
              <ResultItem
                label="Длина"
                value={`${formatNumber(metalLengthM, 1)} м`}
              />
              <ResultItem
                label="Цена металла"
                value={formatRubles(metalWeightKg * pricePerKgMetal)}
              />
            </>
          )}
        </div>

        {/* Транспорт */}
        <div className="flex flex-col gap-6 rounded-3xl border-2 p-8 sm:flex-row sm:items-center sm:justify-between transition-all hover:border-primary/30">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <Truck className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-foreground">
                {vehicle ? vehicle.name : "Нет подходящей машины"}
              </p>
              <p className="mt-1 text-sm font-bold text-muted-foreground">
                {vehicle
                  ? `Доставка: ${formatRubles(deliveryCost)} (подача ${formatRubles(
                      Number(vehicle.baseFare)
                    )} + ${formatRubles(Number(vehicle.perKmCharge))}/км)`
                  : "Увеличьте заказ или свяжитесь с менеджером"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Итого с доставкой</p>
            <p className="mt-1 text-4xl font-black text-primary tracking-tighter">{formatRubles(totalCost)}</p>
          </div>
        </div>

        <a href="#invoice" className="block w-full">
          <Button className="w-full h-16 rounded-full text-xl font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95" size="lg">
            ОФОРМИТЬ СЧЁТ НА {formatRubles(totalCost)}
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}

function ResultItem({
  icon,
  label,
  value,
  hint,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
        {icon}
        {label}
      </p>
      <p className="text-2xl font-black tracking-tight text-foreground">{value}</p>
      {hint && <p className="text-xs font-bold text-primary/80">{hint}</p>}
    </div>
  );
}
