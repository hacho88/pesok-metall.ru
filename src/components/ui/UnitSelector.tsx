"use client";

/**
 * STRIKER.Engine ULTRA — Matrix Selects.
 * Умный селектор единиц измерения с мгновенной конвертацией по
 * теоретическим параметрам товара (вес погонного метра, плотность,
 * вес мешка). Металл: Метры / Тонны / Штуки. Сыпучие: Кубы / Тонны / Мешки.
 */
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Ruler, Weight, Boxes, Layers, Package } from "lucide-react";
import type { StorefrontProduct } from "@/lib/theme-storefront";
import type { SelectVariant } from "@/types/striker-engine";

/** Ключи единиц измерения */
export type UnitKey = "m" | "t" | "pcs" | "m3" | "bags";

interface UnitOption {
  key: UnitKey;
  label: string;
  short: string;
  icon: typeof Ruler;
}

/** Контекст конвертации, вычисляемый из параметров товара */
export interface ConversionContext {
  isMetal: boolean;
  /** кг на 1 погонный метр (металл) */
  kgPerMeter: number;
  /** длина одного изделия в метрах (металл) */
  pieceLengthM: number;
  /** вес одного мешка в кг (сыпучие) */
  bagWeightKg: number;
  /** насыпная плотность кг/м³ (сыпучие) */
  densityKgM3: number;
}

/** Извлечь число из строки вида "1600 кг/м³", "11.7 м", "30 кг" */
function parseNumber(text: string | null | undefined): number | null {
  if (!text) return null;
  const m = text.replace(/\s/g, "").match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Построить контекст конвертации из товара */
export function getConversionContext(product: StorefrontProduct): ConversionContext {
  const isMetal = product.type === "METALL";
  if (isMetal) {
    const kgPerMeter = product.weightKg > 0 ? product.weightKg : 0.888;
    const pieceLengthM = parseNumber(product.length) ?? 6;
    return {
      isMetal: true,
      kgPerMeter,
      pieceLengthM: pieceLengthM > 0 ? pieceLengthM : 6,
      bagWeightKg: 0,
      densityKgM3: 0,
    };
  }
  const bagWeightKg = product.weightKg > 0 ? product.weightKg : 30;
  const densityKgM3 = parseNumber(product.weightLabel) ?? 1500;
  return {
    isMetal: false,
    kgPerMeter: 0,
    pieceLengthM: 0,
    bagWeightKg,
    densityKgM3: densityKgM3 > 0 ? densityKgM3 : 1500,
  };
}

/** Единицы для металла и сыпучих */
export function getUnitOptions(ctx: ConversionContext): UnitOption[] {
  if (ctx.isMetal) {
    return [
      { key: "m", label: "Метры", short: "м", icon: Ruler },
      { key: "t", label: "Тонны", short: "т", icon: Weight },
      { key: "pcs", label: "Штуки", short: "шт", icon: Package },
    ];
  }
  return [
    { key: "m3", label: "Кубы (м³)", short: "м³", icon: Boxes },
    { key: "t", label: "Тонны", short: "т", icon: Weight },
    { key: "bags", label: "Мешки", short: "меш", icon: Layers },
  ];
}

/** Значение в килограммах для выбранной единицы */
function toKg(value: number, unit: UnitKey, ctx: ConversionContext): number {
  if (ctx.isMetal) {
    switch (unit) {
      case "m":
        return value * ctx.kgPerMeter;
      case "t":
        return value * 1000;
      case "pcs":
        return value * ctx.pieceLengthM * ctx.kgPerMeter;
      default:
        return 0;
    }
  }
  switch (unit) {
    case "m3":
      return value * ctx.densityKgM3;
    case "t":
      return value * 1000;
    case "bags":
      return value * ctx.bagWeightKg;
    default:
      return 0;
  }
}

/** Килограммы → целевая единица */
function fromKg(kg: number, unit: UnitKey, ctx: ConversionContext): number {
  if (ctx.isMetal) {
    switch (unit) {
      case "m":
        return kg / ctx.kgPerMeter;
      case "t":
        return kg / 1000;
      case "pcs":
        return kg / (ctx.pieceLengthM * ctx.kgPerMeter);
      default:
        return 0;
    }
  }
  switch (unit) {
    case "m3":
      return kg / ctx.densityKgM3;
    case "t":
      return kg / 1000;
    case "bags":
      return kg / ctx.bagWeightKg;
    default:
      return 0;
  }
}

/** Универсальная конвертация между любыми единицами */
export function convertUnit(
  value: number,
  from: UnitKey,
  to: UnitKey,
  ctx: ConversionContext
): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return fromKg(toKg(value, from, ctx), to, ctx);
}

/** Форматирование числа: 2252.25 → "2 252" */
function formatNum(n: number, digits = 1): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  return n.toLocaleString("ru-RU", { maximumFractionDigits: digits });
}

interface UnitSelectorProps {
  product: StorefrontProduct;
  variant: SelectVariant;
  value: number;
  unit: UnitKey;
  onChange: (value: number, unit: UnitKey) => void;
  /** Компактный режим для карточек-плиток */
  compact?: boolean;
}

export default function UnitSelector({
  product,
  variant,
  value,
  unit,
  onChange,
  compact = false,
}: UnitSelectorProps) {
  const ctx = useMemo(() => getConversionContext(product), [product]);
  const options = useMemo(() => getUnitOptions(ctx), [ctx]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Базовая единица для подписи-конвертации
  const baseUnit: UnitKey = ctx.isMetal ? "m" : "m3";
  const baseLabel = ctx.isMetal ? "м" : "м³";
  const productNoun = ctx.isMetal ? "проката" : "материала";

  const num = Number.isFinite(value) ? value : 0;
  const converted = convertUnit(num, unit, baseUnit, ctx);

  // Дополнительная единица для подписи (штуки/мешки)
  const secondaryUnit: UnitKey = ctx.isMetal ? "pcs" : "bags";
  const secondaryLabel = ctx.isMetal ? "шт." : "меш.";
  const convertedSecondary = convertUnit(num, unit, secondaryUnit, ctx);

  const subText =
    unit === baseUnit
      ? `≈ ${formatNum(convertUnit(num, baseUnit, "t", ctx), 2)} т ${productNoun}`
      : unit === secondaryUnit
      ? `≈ ${formatNum(converted)} ${baseLabel} · ${formatNum(convertedSecondary)} ${secondaryLabel}`
      : `≈ ${formatNum(converted)} ${baseLabel} ${productNoun}`;

  const activeOption = options.find((o) => o.key === unit) ?? options[0];

  const handleInput = (raw: string) => {
    const parsed = parseFloat(raw.replace(",", "."));
    onChange(Number.isFinite(parsed) ? parsed : 0, unit);
  };

  const selectUnit = (key: UnitKey) => {
    onChange(value, key);
    setOpen(false);
  };

  const inputCls = `w-full min-w-0 bg-transparent px-3 py-2 text-sm font-black outline-none ${
    compact ? "text-sm" : "text-base"
  }`;
  const inputWrapCls = `flex items-center border bg-[var(--theme-background)] ${
    variant === "heavy-tabs" ? "rounded-none" : "rounded-md"
  } border-[var(--theme-border)] focus-within:border-[var(--theme-primary)] focus-within:ring-2 focus-within:ring-[var(--theme-primary)]/20 transition-all`;

  return (
    <div className="w-full">
      <div className="flex w-full items-stretch gap-1.5">
        {/* Числовое поле */}
        <div className={inputWrapCls}>
          <input
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            value={value === 0 ? "" : String(value).replace(".", ",")}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="0"
            className={inputCls}
            aria-label="Количество"
          />
          <span className="pr-2.5 text-[10px] font-black uppercase tracking-wider text-[var(--theme-muted-foreground)]">
            {activeOption.short}
          </span>
        </div>

        {/* Селектор единиц */}
        {variant === "heavy-tabs" ? (
          <div className="flex shrink-0 overflow-hidden border border-[var(--theme-border)]">
            {options.map((o) => {
              const active = o.key === unit;
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => selectUnit(o.key)}
                  className={`flex items-center gap-1 px-2.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                    compact ? "px-2" : "px-2.5"
                  } ${
                    active
                      ? "text-[var(--theme-background)]"
                      : "text-[var(--theme-muted-foreground)] hover:text-[var(--theme-foreground)]"
                  }`}
                  style={active ? { background: "var(--theme-primary)" } : { background: "var(--theme-muted)" }}
                  title={o.label}
                >
                  <o.icon className="h-3 w-3" />
                  <span className={compact ? "hidden sm:inline" : ""}>{o.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          /* industrial-dropdown — минималистичный выпадающий список */
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-full items-center gap-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-muted)] px-3 py-2 text-xs font-black uppercase tracking-wider text-[var(--theme-foreground)] transition-all hover:border-[var(--theme-primary)]"
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <activeOption.icon className="h-3.5 w-3.5" style={{ color: "var(--theme-primary)" }} />
              <span>{activeOption.short}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-[var(--theme-muted-foreground)] transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {open && (
                <motion.ul
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  role="listbox"
                  className="absolute right-0 top-full z-50 mt-1.5 w-44 overflow-hidden rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] py-1 shadow-2xl"
                >
                  {options.map((o) => {
                    const active = o.key === unit;
                    return (
                      <li key={o.key} role="option" aria-selected={active}>
                        <button
                          type="button"
                          onClick={() => selectUnit(o.key)}
                          className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-bold transition-colors ${
                            active
                              ? "text-[var(--theme-background)]"
                              : "text-[var(--theme-foreground)] hover:bg-[var(--theme-muted)]"
                          }`}
                          style={active ? { background: "var(--theme-primary)" } : undefined}
                        >
                          <o.icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="flex-1">{o.label}</span>
                          <span className="text-[10px] font-black uppercase opacity-60">{o.short}</span>
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Живая подпись-конвертация с Framer Motion */}
      <div className="mt-1.5 h-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${unit}-${subText}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="truncate text-[10px] font-bold text-[var(--theme-muted-foreground)]"
          >
            {num > 0 ? (
              <>
                <span style={{ color: "var(--theme-primary)" }}>{subText}</span>
                {ctx.isMetal && unit === "t" && (
                  <span className="ml-1.5 opacity-60">
                    · {formatNum(convertedSecondary)} шт. по {formatNum(ctx.pieceLengthM, 1)} м
                  </span>
                )}
                {!ctx.isMetal && unit === "t" && (
                  <span className="ml-1.5 opacity-60">
                    · {formatNum(convertedSecondary)} меш. по {formatNum(ctx.bagWeightKg, 0)} кг
                  </span>
                )}
              </>
            ) : (
              <span className="opacity-50">
                {ctx.isMetal
                  ? `1 м = ${formatNum(ctx.kgPerMeter, 3)} кг · изделие ${formatNum(ctx.pieceLengthM, 1)} м`
                  : `1 м³ = ${formatNum(ctx.densityKgM3, 0)} кг · мешок ${formatNum(ctx.bagWeightKg, 0)} кг`}
              </span>
            )}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
