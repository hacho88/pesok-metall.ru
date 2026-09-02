"use client";

/**
 * ProductCard — плитка товара по визуальному блюпринту:
 * rounded-2xl, белый фон, тонкая рамка, мягкая тень, HOT-бейдж слева-сверху,
 * белый канвас с техническим чертежом, иерархия текста (подкатегория →
 * жирный заголовок → метаданные → ГОСТ), футер с крупной ценой, вторичной
 * ценой и тёмной круглой кнопкой быстрого заказа. Интерактивный селектор
 * единиц и количество — над ценой.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Check, Flame } from "lucide-react";
import type { CityMetRow, CityMetUnit } from "./catalog-data";
import ProductAsset from "./ProductAsset";
import CardUnitSelector, {
  cardWeightTons,
  cardUnitPrice,
  cardPriceUnitLabel,
  type CardSelectorParams,
  type CardUnit,
} from "@/components/ui/CardUnitSelector";
import { useCityMetBasket } from "./basket-context";
import { cn } from "@/lib/utils";

/** Формат цены: тонны — 0 знаков, остальное — 2 */
function formatPrice(value: number | null, unit: CardUnit): string {
  if (value == null) return "—";
  const digits = unit === "t" ? 0 : 2;
  return value.toLocaleString("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Вторичная цена (другая единица) для подписи под основной */
function secondaryPrice(row: CityMetRow, unit: CardUnit): { value: number | null; label: string } {
  if (row.kind === "bulk") {
    return unit === "bags"
      ? { value: row.pricePerM3, label: "₽ / М³" }
      : { value: row.pricePerBag, label: "₽ / МЕШОК" };
  }
  return unit === "m"
    ? { value: row.pricePerTon, label: "₽ / Т" }
    : { value: row.pricePerMeter, label: "₽ / М" };
}

/** Подкатегория-индикатор: «РАВНОПОЛОЧНЫЙ», «ТРУБА ПРОФИЛЬНАЯ 25х25» */
function subcategoryLabel(row: CityMetRow): string {
  if (row.kind === "bulk") {
    return row.subcategory.replace(" в мешках", "").toUpperCase();
  }
  const sub = row.subcategory.toUpperCase();
  if (sub === row.category.toUpperCase()) return row.grade.toUpperCase();
  return sub;
}

export default function ProductCard({ row }: { row: CityMetRow }) {
  const { addItem } = useCityMetBasket();
  const isMetal = row.kind === "metal";

  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<CardUnit>(isMetal ? "m" : "bags");
  const [added, setAdded] = useState(false);

  const params: CardSelectorParams = {
    kind: row.kind,
    weightPerMeterKg: row.weightPerMeterKg,
    pricePerMeter: row.pricePerMeter,
    pricePerTon: row.pricePerTon,
    bagWeightKg: row.bagWeightKg,
    bulkDensityTonsPerM3: row.bulkDensityTonsPerM3,
    pricePerBag: row.pricePerBag,
    pricePerM3: row.pricePerM3,
  };

  const unitPrice = cardUnitPrice(params, unit);
  const weightTons = cardWeightTons(params, quantity, unit);
  const secondary = secondaryPrice(row, unit);

  const handleAdd = () => {
    if (quantity <= 0 || unitPrice == null) return;
    addItem({
      rowId: row.id,
      name: row.name,
      gost: row.gost,
      kind: row.kind,
      unit: unit as CityMetUnit,
      quantity,
      weightTons,
      pricePerUnit: unitPrice,
      lineTotal: unitPrice * quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const badge = !row.inStock
    ? { text: "ПОД ЗАКАЗ", cls: "bg-neutral-200 text-neutral-600" }
    : isMetal
    ? { text: "🔥 HOT", cls: "bg-blue-600 text-white" }
    : { text: "🔥 ХИТ", cls: "bg-blue-600 text-white" };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_16px_40px_-16px_rgba(0,0,0,0.2)]"
    >
      {/* Бейдж слева-сверху */}
      <div className="absolute left-3 top-3 z-20">
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm",
            badge.cls
          )}
        >
          {badge.text === "ПОД ЗАКАЗ" ? null : <Flame className="h-3 w-3" />}
          {badge.text}
        </span>
      </div>

      {/* Превью товара: белый канвас с техническим чертежом */}
      <div className="relative aspect-square w-full overflow-hidden bg-white">
        <ProductAsset row={row} className="h-full w-full" />
        {/* Лёгкий градиент снизу для глубины */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-neutral-50/80 to-transparent" />
      </div>

      {/* Текстовая иерархия */}
      <div className="flex flex-1 flex-col px-4 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
          {subcategoryLabel(row)}
        </p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-neutral-900">
          {row.name}
        </h3>

        {/* Метаданные: длина / вес / ГОСТ */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-neutral-500">
          {isMetal ? (
            row.lengthM != null && (
              <span>
                Длина: <span className="font-black text-neutral-900">{row.lengthM.toLocaleString("ru-RU")} м.</span>
              </span>
            )
          ) : (
            row.bagWeightKg != null && (
              <span>
                Фасовка: <span className="font-black text-neutral-900">{row.bagWeightKg} кг.</span>
              </span>
            )
          )}
          {isMetal && row.weightPerMeterKg != null && (
            <span>
              Вес: <span className="font-black text-neutral-900">{row.weightPerMeterKg.toLocaleString("ru-RU")} кг.</span>
            </span>
          )}
        </div>

        {row.gost !== "—" && (
          <div className="mt-2">
            <span className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50/70 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700">
              {row.gost}
            </span>
          </div>
        )}

        {/* Селектор единиц + количество */}
        <div className="mt-3">
          <CardUnitSelector
            params={params}
            quantity={quantity}
            unit={unit}
            onChange={(q, u) => {
              setQuantity(q);
              setUnit(u);
            }}
          />
        </div>
      </div>

      {/* Футер: цена + кнопка */}
      <div className="mt-3 flex items-end justify-between gap-3 border-t border-neutral-100 bg-neutral-50/60 px-4 py-3">
        <div className="min-w-0">
          {unitPrice != null ? (
            <>
              <p className="text-lg font-black leading-none tracking-tight text-neutral-900">
                {formatPrice(unitPrice, unit)} ₽
              </p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                {cardPriceUnitLabel(unit)}
              </p>
              {secondary.value != null && (
                <p className="mt-1 text-[11px] font-bold tabular-nums text-blue-600/80">
                  {formatPrice(secondary.value, secondary.value >= 1000 ? "t" : unit)} {secondary.label}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm font-black uppercase tracking-wide text-red-600">под заказ</p>
          )}
        </div>

        {/* Тёмная круглая кнопка быстрого заказа */}
        <motion.button
          type="button"
          onClick={handleAdd}
          disabled={unitPrice == null || quantity <= 0}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-40",
            added ? "bg-emerald-600 hover:bg-emerald-700" : "bg-neutral-900 hover:bg-neutral-800"
          )}
          title="Быстрый заказ"
          aria-label="Добавить в корзину"
        >
          {added ? <Check className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
        </motion.button>
      </div>
    </motion.article>
  );
}
