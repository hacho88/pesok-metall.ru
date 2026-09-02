"use client";

/**
 * STRIKER.Engine ULTRA — ProductCard.
 * Архитектура карточки полностью управляется JSON-блюпринтом:
 * радиус, вариант раскладки (строка-таблица / премиум-плитка),
 * рейтинг звёзд, бейдж наличия (точный тоннаж / розничный текст),
 * бейдж ГОСТ и встроенный Matrix Select (UnitSelector).
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, Package, CheckCircle2, Truck } from "lucide-react";
import type { StorefrontProduct } from "@/lib/theme-storefront";
import { pricePerTon } from "@/lib/theme-storefront";
import type { ProductCardComponentsConfig, UnitSelectorComponentsConfig } from "@/types/striker-engine";
import UnitSelector, { getConversionContext, type UnitKey } from "@/components/ui/UnitSelector";

/** Детерминированный псевдо-рейтинг из id товара (4.0–5.0) */
function stableRating(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 4 + (h % 10) / 10; // 4.0 – 4.9
}

/** Детерминированный тоннаж на складе (5–40 т) */
function stableStockTons(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
  return 5 + (h % 350) / 10; // 5.0 – 39.9 т
}

interface ProductCardProps {
  product: StorefrontProduct;
  config: ProductCardComponentsConfig;
  unitConfig: UnitSelectorComponentsConfig;
  onOrder: (product: StorefrontProduct, quantity: number, unit: UnitKey) => void;
  index?: number;
}

export default function ProductCard({
  product,
  config,
  unitConfig,
  onOrder,
  index = 0,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<UnitKey>(product.type === "METALL" ? "m" : "m3");

  const radius = config.cardBorderRadius;
  const isTile = config.cardLayoutVariant === "ecommerce-tile";
  const rating = useMemo(() => stableRating(product.id), [product.id]);
  const stockTons = useMemo(() => stableStockTons(product.id), [product.id]);
  const ctx = useMemo(() => getConversionContext(product), [product]);
  const ppt = pricePerTon(product);

  const radiusStyle = { borderRadius: radius } as const;
  const borderStyle = { border: "1px solid var(--theme-border)" } as const;

  const stockLabel =
    config.stockStatusType === "exact-tonnage"
      ? product.inStock
        ? `${stockTons.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} тонн на складе`
        : "Под заказ"
      : product.inStock
      ? "В наличии"
      : "Под заказ";

  const handleOrder = () => onOrder(product, quantity > 0 ? quantity : 1, unit);

  /* ============ Вариант: компактная строка (spreadsheet-row) ============ */
  if (!isTile) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="group flex flex-col gap-3 p-3.5 transition-colors hover:bg-[var(--theme-muted)]/40 sm:flex-row sm:items-center"
        style={{ ...borderStyle, ...radiusStyle, background: "var(--theme-card)" }}
      >
        {/* Иконка-заглушка изображения */}
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center"
          style={{ background: "var(--theme-muted)", borderRadius: radius === "0px" ? 0 : 6 }}
        >
          <Package className="h-6 w-6 opacity-40" />
        </div>

        {/* Основная колонка */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted-foreground)]">
              {product.categoryName}
            </span>
            {config.showGostBadge && product.gost && (
              <span
                className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
                style={{ background: "var(--theme-muted)", color: "var(--theme-primary)" }}
              >
                {product.gost}
              </span>
            )}
            {config.showRating && (
              <span className="flex items-center gap-0.5 text-[10px] font-black" style={{ color: "var(--theme-primary)" }}>
                <Star className="h-3 w-3 fill-current" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>

          <h3 className="mt-0.5 truncate text-sm font-black leading-snug text-[var(--theme-foreground)]">
            {product.name}
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] font-semibold text-[var(--theme-muted-foreground)]">
            <span>{product.weightLabel ?? `${product.weightKg} кг`}</span>
            {product.length && <span>· {product.length}</span>}
            <span
              className="inline-flex items-center gap-1 font-bold"
              style={{ color: product.inStock ? "var(--theme-primary)" : "var(--theme-muted-foreground)" }}
            >
              {product.inStock ? <CheckCircle2 className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
              {stockLabel}
            </span>
          </div>
        </div>

        {/* Цена */}
        <div className="shrink-0 text-right">
          {product.price != null ? (
            <>
              <div className="text-base font-black" style={{ color: "var(--theme-primary)" }}>
                {product.price.toLocaleString("ru-RU")} ₽
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-wider opacity-50">
                за {product.unit ?? "ед."}
                {ppt != null && <span className="ml-1.5">· {ppt.toLocaleString("ru-RU")} ₽/т</span>}
              </div>
            </>
          ) : (
            <div className="text-sm font-black uppercase" style={{ color: "var(--theme-primary)" }}>
              Под заказ
            </div>
          )}
        </div>

        {/* Matrix Select + кнопка */}
        <div className="w-full shrink-0 sm:w-64">
          <UnitSelector
            product={product}
            variant={unitConfig.selectVariant}
            value={quantity}
            unit={unit}
            onChange={(v, u) => {
              setQuantity(v);
              setUnit(u);
            }}
          />
          <button
            onClick={handleOrder}
            className="mt-1.5 flex w-full items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[var(--theme-background)] transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "var(--theme-primary)", borderRadius: radius === "0px" ? 0 : 6 }}
          >
            В заказ <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </motion.article>
    );
  }

  /* ============ Вариант: премиум-плитка (ecommerce-tile) ============ */
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl"
      style={{ ...borderStyle, ...radiusStyle, background: "var(--theme-card)" }}
    >
      {/* Изображение-заглушка с градиентом и зерном */}
      <div
        className="relative flex h-32 items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, var(--theme-muted) 0%, var(--theme-secondary) 100%)`,
        }}
      >
        <Package className="h-12 w-12 opacity-30 transition-transform duration-300 group-hover:scale-110" />
        <span
          className="absolute left-2.5 top-2.5 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest"
          style={{ background: "var(--theme-primary)", color: "var(--theme-background)", borderRadius: radius === "0px" ? 0 : 4 }}
        >
          {product.categoryName}
        </span>
        {config.showGostBadge && product.gost && (
          <span
            className="absolute right-2.5 top-2.5 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
            style={{ background: "rgba(0,0,0,0.55)", color: "var(--theme-foreground)", borderRadius: radius === "0px" ? 0 : 4 }}
          >
            {product.gost}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        {/* Рейтинг + наличие */}
        <div className="flex items-center justify-between gap-2">
          {config.showRating ? (
            <span className="flex items-center gap-0.5 text-[10px] font-black" style={{ color: "var(--theme-primary)" }}>
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className={`h-3 w-3 ${s < Math.round(rating) ? "fill-current" : "opacity-25"}`} />
              ))}
              <span className="ml-1 text-[var(--theme-foreground)]">{rating.toFixed(1)}</span>
            </span>
          ) : (
            <span />
          )}
          <span
            className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider"
            style={{ color: product.inStock ? "var(--theme-primary)" : "var(--theme-muted-foreground)" }}
          >
            {product.inStock ? <CheckCircle2 className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
            {stockLabel}
          </span>
        </div>

        <h3 className="line-clamp-2 text-sm font-black leading-snug text-[var(--theme-foreground)]">
          {product.name}
        </h3>

        <div className="text-[10px] font-semibold text-[var(--theme-muted-foreground)]">
          {product.weightLabel ?? `${product.weightKg} кг`}
          {product.length && <span> · {product.length}</span>}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            {product.price != null ? (
              <>
                <div className="text-lg font-black leading-none" style={{ color: "var(--theme-primary)" }}>
                  {product.price.toLocaleString("ru-RU")} ₽
                </div>
                <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider opacity-50">
                  за {product.unit ?? "ед."}
                  {ppt != null && <span className="ml-1">· {ppt.toLocaleString("ru-RU")} ₽/т</span>}
                </div>
              </>
            ) : (
              <div className="text-sm font-black uppercase" style={{ color: "var(--theme-primary)" }}>
                Под заказ
              </div>
            )}
          </div>
        </div>

        {/* Matrix Select */}
        <UnitSelector
          product={product}
          variant={unitConfig.selectVariant}
          value={quantity}
          unit={unit}
          onChange={(v, u) => {
            setQuantity(v);
            setUnit(u);
          }}
          compact
        />

        <button
          onClick={handleOrder}
          className="flex w-full items-center justify-center gap-1.5 px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-[var(--theme-background)] transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: "var(--theme-primary)", borderRadius: radius === "0px" ? 0 : 6 }}
        >
          Добавить в заказ <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </motion.article>
  );
}
