"use client";

/**
 * CardUnitSelector — интерактивный селектор единиц измерения для карточек товаров.
 *
 * Металл:  [ Метры ] / [ Тонны ]
 *   Метры:  вес = (Qty * weightPerMeterKg) / 1000 тонн
 *   Тонны:  длина = (Qty * 1000) / weightPerMeterKg метров
 * Сыпучие: [ Мешки ] / [ Кубы ]
 *   Мешки:  объём = (Qty * bagWeightKg) / (bulkDensity * 1000) м³
 *   Кубы:   мешки = (Qty * bulkDensity * 1000) / bagWeightKg шт
 *
 * Вся математика вынесена в чистые функции (cardWeightTons / cardInverseUnit /
 * cardUnitPrice) — их использует и карточка для ценового футера.
 */
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, Weight, Layers, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

/** Единицы измерения карточки */
export type CardUnit = "m" | "t" | "bags" | "m3";

/** Параметры товара для расчётного движка */
export interface CardSelectorParams {
  kind: "metal" | "bulk";
  /* Металл */
  weightPerMeterKg: number | null;
  pricePerMeter: number | null;
  pricePerTon: number | null;
  /* Сыпучие */
  bagWeightKg: number | null;
  bulkDensityTonsPerM3: number | null;
  pricePerBag: number | null;
  pricePerM3: number | null;
}

/** Вес позиции в тоннах по выбранной единице */
export function cardWeightTons(
  p: CardSelectorParams,
  quantity: number,
  unit: CardUnit
): number {
  if (quantity <= 0) return 0;
  if (p.kind === "bulk") {
    const bagKg = p.bagWeightKg ?? 50;
    const dens = p.bulkDensityTonsPerM3 ?? 1.5;
    return unit === "bags" ? (quantity * bagKg) / 1000 : quantity * dens;
  }
  const wpm = p.weightPerMeterKg ?? 0;
  return unit === "m" ? (quantity * wpm) / 1000 : quantity;
}

/** Обратная конвертация (помощник под полем количества) */
export function cardInverseUnit(
  p: CardSelectorParams,
  quantity: number,
  unit: CardUnit
): number {
  if (quantity <= 0) return 0;
  if (p.kind === "bulk") {
    const bagKg = p.bagWeightKg ?? 50;
    const dens = p.bulkDensityTonsPerM3 ?? 1.5;
    return unit === "bags"
      ? (quantity * bagKg) / (dens * 1000)
      : (quantity * dens * 1000) / bagKg;
  }
  const wpm = p.weightPerMeterKg ?? 0;
  if (wpm <= 0) return 0;
  return unit === "m" ? (quantity * wpm) / 1000 : (quantity * 1000) / wpm;
}

/** Цена за выбранную единицу */
export function cardUnitPrice(p: CardSelectorParams, unit: CardUnit): number | null {
  if (p.kind === "bulk") return unit === "bags" ? p.pricePerBag : p.pricePerM3;
  return unit === "m" ? p.pricePerMeter : p.pricePerTon;
}

/** Подпись обратного помощника */
export function cardInverseLabel(p: CardSelectorParams, unit: CardUnit): string {
  if (p.kind === "metal") return unit === "m" ? "тонн" : "метров";
  return unit === "bags" ? "м³" : "мешков";
}

/** Подпись цены за единицу (для футера карточки) */
export function cardPriceUnitLabel(unit: CardUnit): string {
  switch (unit) {
    case "m":
      return "ЗА МЕТР";
    case "t":
      return "ЗА ТОННУ";
    case "bags":
      return "ЗА МЕШОК";
    case "m3":
      return "ЗА М³";
  }
}

/** Короткая метка единицы */
export const CARD_UNIT_SHORT: Record<CardUnit, string> = {
  m: "м",
  t: "т",
  bags: "меш",
  m3: "м³",
};

interface CardUnitSelectorProps {
  params: CardSelectorParams;
  quantity: number;
  unit: CardUnit;
  onChange: (quantity: number, unit: CardUnit) => void;
}

export default function CardUnitSelector({
  params,
  quantity,
  unit,
  onChange,
}: CardUnitSelectorProps) {
  const isMetal = params.kind === "metal";
  const units: CardUnit[] = isMetal ? ["m", "t"] : ["bags", "m3"];

  const weightTons = cardWeightTons(params, quantity, unit);
  const inverse = cardInverseUnit(params, quantity, unit);
  const inverseLabel = cardInverseLabel(params, unit);

  const handleInput = (raw: string) => {
    const parsed = parseFloat(raw.replace(",", "."));
    onChange(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0, unit);
  };

  const tabMeta: Record<CardUnit, { label: string; icon: typeof Ruler }> = {
    m: { label: "Метры", icon: Ruler },
    t: { label: "Тонны", icon: Weight },
    bags: { label: "Мешки", icon: Layers },
    m3: { label: "Кубы", icon: Boxes },
  };

  return (
    <div className="w-full">
      {/* Табы единиц */}
      <div className="flex overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
        {units.map((u) => {
          const active = u === unit;
          const Icon = tabMeta[u].icon;
          return (
            <button
              key={u}
              type="button"
              onClick={() => onChange(quantity, u)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-black uppercase tracking-wide transition-colors",
                active ? "text-white" : "text-neutral-500 hover:text-neutral-900"
              )}
            >
              {active && (
                <motion.span
                  layoutId={`unit-pill-${isMetal ? "metal" : "bulk"}`}
                  className="absolute inset-0 rounded-md bg-neutral-900"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <Icon className="relative z-10 h-3 w-3" />
              <span className="relative z-10">{tabMeta[u].label}</span>
            </button>
          );
        })}
      </div>

      {/* Поле количества */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex flex-1 items-center rounded-lg border border-neutral-200 bg-white transition-all focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10">
          <input
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            value={quantity === 0 ? "" : String(quantity).replace(".", ",")}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="0"
            aria-label="Количество"
            className="w-full min-w-0 bg-transparent px-3 py-2 text-sm font-black text-neutral-900 outline-none placeholder:text-neutral-300"
          />
          <span className="shrink-0 pr-3 text-[10px] font-black uppercase tracking-wider text-neutral-400">
            {CARD_UNIT_SHORT[unit]}
          </span>
        </div>
      </div>

      {/* Живая нота-конвертация */}
      <div className="mt-1.5 h-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${unit}-${quantity}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="truncate text-[10px] font-bold text-neutral-400"
          >
            {quantity > 0 ? (
              <>
                ≈{" "}
                <span className="font-black text-neutral-900">
                  {weightTons.toLocaleString("ru-RU", { maximumFractionDigits: 3 })}
                </span>{" "}
                т
                {unit !== "t" && (
                  <span className="ml-1">
                    · {inverse.toLocaleString("ru-RU", { maximumFractionDigits: 3 })}{" "}
                    {inverseLabel}
                  </span>
                )}
              </>
            ) : (
              <span className="opacity-60">введите количество</span>
            )}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
