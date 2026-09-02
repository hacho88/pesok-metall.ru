"use client";

/**
 * city-met — непрерывная таблица-спредшит каталога с ДВОЙНОЙ ЛОГИКОЙ строк.
 *
 * CASE A (kind === "metal", спарсен с city-met.ru):
 *   Селектор [ Метры ] / [ Тонны ].
 *   Метры: цена = Qty * pricePerMeter, помощник = (Qty * weightPerMeter) / 1000 тонн.
 *   Тонны: цена = Qty * pricePerTon, помощник = (Qty * 1000) / weightPerMeter метров.
 *
 * CASE B (kind === "bulk", наши сыпучие из админки):
 *   Селектор [ Мешки ] / [ Кубы ].
 *   Мешки: цена = Qty * pricePerBag, помощник = (Qty * BagWeight) / BulkDensity м³.
 *   Кубы: цена = Qty * pricePerM3, помощник = количество мешков.
 */
import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Check } from "lucide-react";
import type { CityMetRow, CityMetUnit } from "./catalog-data";
import { rowWeightTons, rowInverseUnit, rowUnitPrice } from "./catalog-data";
import { useCityMetBasket } from "./basket-context";
import { cn } from "@/lib/utils";

/** Формат цены: метры/кубы/мешки — 2 знака, тонны — 0 знаков */
function formatPrice(value: number | null, unit: CityMetUnit): string {
  if (value == null) return "—";
  const digits = unit === "t" ? 0 : 2;
  return value.toLocaleString("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Формат веса/объёма: до 3 знаков */
function formatQty(value: number): string {
  return value.toLocaleString("ru-RU", { maximumFractionDigits: 3 });
}

/** Подпись цены за единицу */
function unitPriceLabel(unit: CityMetUnit): string {
  switch (unit) {
    case "m":
      return "Цена за метр";
    case "t":
      return "Цена за тонну";
    case "bags":
      return "Цена за мешок";
    case "m3":
      return "Цена за м³";
  }
}

/** Одна строка таблицы с локальным состоянием единицы и количества */
function CityMetRowView({ row }: { row: CityMetRow }) {
  const { addItem } = useCityMetBasket();
  const isMetal = row.kind === "metal";
  const [unit, setUnit] = useState<CityMetUnit>(isMetal ? "m" : "bags");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const units: CityMetUnit[] = isMetal ? ["m", "t"] : ["bags", "m3"];

  const unitPrice = rowUnitPrice(row, unit);
  const weightTons = rowWeightTons(row, quantity, unit);
  const inverse = rowInverseUnit(row, quantity, unit);
  /** Подпись обратного помощника */
  const inverseLabel = isMetal
    ? unit === "m"
      ? "тонн"
      : "метров"
    : unit === "bags"
    ? "м³"
    : "мешков";

  const handleAdd = () => {
    if (quantity <= 0 || unitPrice == null) return;
    addItem({
      rowId: row.id,
      name: row.name,
      gost: row.gost,
      kind: row.kind,
      unit,
      quantity,
      weightTons,
      pricePerUnit: unitPrice,
      lineTotal: unitPrice * quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <tr className="border-t border-neutral-200 transition-colors hover:bg-neutral-50/70">
      {/* 1. Квадратное превью */}
      <td className="px-3 py-2.5 align-middle">
        <div className="relative h-14 w-14 overflow-hidden rounded-none border border-neutral-200 bg-neutral-50 md:h-16 md:w-16">
          {row.imageUrl ? (
            <Image
              src={row.imageUrl}
              alt={row.name}
              fill
              sizes="64px"
              className="rounded-none object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-base font-black text-neutral-300">
              {row.category.slice(0, 1)}
            </div>
          )}
        </div>
      </td>

      {/* 2. Идентичность: имя + марка/фракция + ГОСТ */}
      <td className="px-3 py-2.5 align-middle">
        <p className="text-sm font-bold leading-snug text-neutral-900">{row.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {row.grade !== "—" && (
            <span className="rounded-none border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-neutral-700">
              {row.grade}
            </span>
          )}
          {row.gost !== "—" && (
            <span className="rounded-none bg-red-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
              {row.gost}
            </span>
          )}
        </div>
      </td>

      {/* 3. Длина / фасовка */}
      <td className="px-3 py-2.5 align-middle">
        {isMetal ? (
          row.lengthM != null ? (
            <span className="whitespace-nowrap text-xs font-bold text-neutral-900">
              {row.lengthM.toLocaleString("ru-RU")} м
            </span>
          ) : (
            <span className="text-xs font-semibold text-neutral-400">—</span>
          )
        ) : row.bagWeightKg != null ? (
          <span className="whitespace-nowrap text-xs font-bold text-neutral-900">
            {row.bagWeightKg} кг
          </span>
        ) : (
          <span className="text-xs font-semibold text-neutral-400">—</span>
        )}
      </td>

      {/* 4. Активный селектор единиц */}
      <td className="px-3 py-2.5 align-middle">
        <div className="flex overflow-hidden rounded-none border border-neutral-200">
          {units.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={cn(
                "px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wide transition-colors",
                unit === u
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-600 hover:bg-neutral-50"
              )}
            >
              {u === "m" ? "Метры" : u === "t" ? "Тонны" : u === "bags" ? "Мешки" : "Кубы"}
            </button>
          ))}
        </div>
      </td>

      {/* 5. Динамическая цена */}
      <td className="px-3 py-2.5 align-middle">
        {unitPrice != null ? (
          <div className="whitespace-nowrap">
            <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
              {unitPriceLabel(unit)}:
            </span>
            <span className="ml-1 text-sm font-black text-neutral-900">
              {formatPrice(unitPrice, unit)} ₽
            </span>
          </div>
        ) : (
          <span className="text-xs font-bold uppercase text-red-600">под заказ</span>
        )}
      </td>

      {/* 6. Количество + обратный помощник */}
      <td className="px-3 py-2.5 align-middle">
        <div className="w-28">
          <input
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            value={quantity === 0 ? "" : String(quantity).replace(".", ",")}
            onChange={(e) => {
              const v = parseFloat(e.target.value.replace(",", "."));
              setQuantity(Number.isFinite(v) && v >= 0 ? v : 0);
            }}
            className="w-full rounded-none border border-neutral-200 bg-white px-2 py-1.5 text-right text-sm font-bold text-neutral-900 outline-none transition-colors focus:border-red-600 focus:ring-1 focus:ring-red-600"
            aria-label="Количество"
          />
          <p className="mt-1 h-3.5 truncate text-[10px] font-semibold text-neutral-400">
            {quantity > 0 ? (
              <>
                ≈ <span className="font-black text-red-600">{formatQty(weightTons)}</span> т
                {unit !== "t" && (
                  <span className="ml-1">· {formatQty(inverse)} {inverseLabel}</span>
                )}
              </>
            ) : (
              <span className="opacity-60">введите количество</span>
            )}
          </p>
        </div>
      </td>

      {/* 7. Кнопка покупки */}
      <td className="px-3 py-2.5 align-middle">
        <button
          type="button"
          onClick={handleAdd}
          disabled={unitPrice == null || quantity <= 0}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-none px-4 text-[11px] font-black uppercase tracking-widest text-white transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
            added ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
          )}
        >
          {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
          {added ? "Добавлено" : "В корзину"}
        </button>
      </td>
    </tr>
  );
}

interface CityMetTableProps {
  rows: CityMetRow[];
  title: string;
}

export default function CityMetTable({ rows, title }: CityMetTableProps) {
  return (
    <section className="border border-neutral-200 bg-white">
      {/* Заголовок таблицы */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-50 px-3 py-2.5">
        <h2 className="text-sm font-black uppercase tracking-tight text-neutral-900">{title}</h2>
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
          {rows.length} поз.
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="bg-neutral-50 text-[10px] font-black uppercase tracking-widest text-neutral-500">
              <th className="px-3 py-2.5">Фото</th>
              <th className="px-3 py-2.5">Наименование</th>
              <th className="px-3 py-2.5">{rows.some((r) => r.kind === "metal") ? "Длина" : "Фасовка"}</th>
              <th className="px-3 py-2.5">Единицы</th>
              <th className="px-3 py-2.5">Цена</th>
              <th className="px-3 py-2.5">Количество</th>
              <th className="px-3 py-2.5">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {rows.map((row) => (
              <CityMetRowView key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="border-t border-neutral-200 py-14 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">
            По выбранным фильтрам ничего не найдено
          </p>
        </div>
      )}
    </section>
  );
}
