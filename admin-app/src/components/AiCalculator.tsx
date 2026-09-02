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
    <Card id="calculator" className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calculator className="h-5 w-5 text-primary" />
          ИИ-калькулятор доставки
          {geoZoneName && <Badge variant="secondary">{geoZoneName}</Badge>}
        </CardTitle>
        <CardDescription>
          Перевод объёма в тару, автоподбор машины и расчёт стоимости доставки.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Переключатель режима */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-secondary p-1">
          <button
            type="button"
            onClick={() => setMode("bulk")}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === "bulk"
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Сыпучие (песок, щебень)
          </button>
          <button
            type="button"
            onClick={() => setMode("metal")}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === "metal"
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Металлопрокат
          </button>
        </div>

        {mode === "bulk" ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="area">Площадь, м²</Label>
              <Input
                id="area"
                type="number"
                min={1}
                value={areaM2}
                onChange={(e) => setAreaM2(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thickness">Толщина слоя, см</Label>
              <Input
                id="thickness"
                type="number"
                min={1}
                value={thicknessCm}
                onChange={(e) => setThicknessCm(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material">Материал</Label>
              <Select
                id="material"
                value={presetIndex}
                onChange={(e) => setPresetIndex(Number(e.target.value))}
              >
                {BULK_PRESETS.map((p, i) => (
                  <option key={p.label} value={i}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="metal-length">Длина, м</Label>
              <Input
                id="metal-length"
                type="number"
                min={0.1}
                step={0.1}
                value={metalLengthM}
                onChange={(e) => setMetalLengthM(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metal-weight">Вес 1 метра, кг</Label>
              <Input
                id="metal-weight"
                type="number"
                min={0.01}
                step={0.01}
                value={metalWeightPerM}
                onChange={(e) => setMetalWeightPerM(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="distance">Расстояние от МКАД, км</Label>
          <Input
            id="distance"
            type="number"
            min={0}
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
          />
        </div>

        {/* Результаты */}
        <div className="grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {mode === "bulk" ? (
            <>
              <ResultItem
                icon={<Package className="h-4 w-4" />}
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
        <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {vehicle ? vehicle.name : "Нет подходящей машины"}
              </p>
              <p className="text-xs text-muted-foreground">
                {vehicle
                  ? `Доставка: ${formatRubles(deliveryCost)} (подача ${formatRubles(
                      Number(vehicle.baseFare)
                    )} + ${formatRubles(Number(vehicle.perKmCharge))}/км × ${distanceKm} км)`
                  : "Увеличьте заказ или свяжитесь с менеджером"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Итого с доставкой</p>
            <p className="text-2xl font-bold text-primary">{formatRubles(totalCost)}</p>
          </div>
        </div>

        <a href="#invoice" className="block w-full">
          <Button className="w-full" size="lg">
            Оформить счёт на эту сумму
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
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-lg font-semibold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
