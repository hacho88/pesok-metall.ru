"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Package,
  Ruler,
  Layers,
  SlidersHorizontal,
  X,
  Flame,
  Check,
  Zap,
} from "lucide-react";
import type { StorefrontProduct } from "@/lib/theme-storefront";
import { cn } from "@/lib/utils";
import ProductAsset from "@/components/themes/city-met/ProductAsset";
import CardUnitSelector, {
  cardWeightTons,
  cardUnitPrice,
  cardPriceUnitLabel,
  type CardSelectorParams,
  type CardUnit,
} from "@/components/ui/CardUnitSelector";
import type { CityMetRow } from "@/components/themes/city-met/catalog-data";

export type ParentCategoryKey =
  | "armatura"
  | "truby"
  | "fasonnyy"
  | "listovoy"
  | "bulk";

export interface SubcategoryTag {
  id: string;
  label: string;
  matchPattern: string | RegExp;
  isDiameter?: boolean;
}

export interface DirectoryCategoryNode {
  key: ParentCategoryKey;
  title: string;
  description: string;
  icon: typeof Layers;
  matchTerms: string[];
  subcategories: SubcategoryTag[];
}

export const METAL_DIRECTORY_NODES: DirectoryCategoryNode[] = [
  {
    key: "armatura",
    title: "АРМАТУРА",
    description: "А500С рифленая, А240 гладкая, ГОСТ 5781-82",
    icon: Layers,
    matchTerms: ["арматура"],
    subcategories: [
      { id: "all", label: "Все", matchPattern: "" },
      {
        id: "a500c",
        label: "Рифленая А3 (А500С)",
        matchPattern: /а500с|а-500|рифлен/i,
      },
      {
        id: "a240",
        label: "Гладкая А1 (А240)",
        matchPattern: /а240|а-240|гладк/i,
      },
      { id: "d8", label: "8 мм", matchPattern: /8\s*мм/i, isDiameter: true },
      { id: "d10", label: "10 мм", matchPattern: /10\s*мм/i, isDiameter: true },
      { id: "d12", label: "12 мм", matchPattern: /12\s*мм/i, isDiameter: true },
      { id: "d14", label: "14 мм", matchPattern: /14\s*мм/i, isDiameter: true },
    ],
  },
  {
    key: "truby",
    title: "ТРУБЫ СТАЛЬНЫЕ",
    description: "Профильные квадратные, прямоугольные, ВГП, круглые",
    icon: Layers,
    matchTerms: ["труба", "трубы"],
    subcategories: [
      { id: "all", label: "Все", matchPattern: "" },
      {
        id: "sq",
        label: "Профильные квадратные",
        matchPattern: /квадрат|20х20|25х25|30х30|40х40|50х50|60х60|80х80|100х100/i,
      },
      {
        id: "rect",
        label: "Профильные прямоугольные",
        matchPattern: /прямоугольн|40х20|50х25|60х30|60х40|80х40|100х50/i,
      },
      {
        id: "round",
        label: "Электросварные круглые",
        matchPattern: /электросварн|круг/i,
      },
    ],
  },
  {
    key: "fasonnyy",
    title: "ФАСОННЫЙ ПРОКАТ",
    description: "Швеллер, уголок равнополочный, балка двутавровая",
    icon: Layers,
    matchTerms: ["швеллер", "уголок", "балка", "фасонный"],
    subcategories: [
      { id: "all", label: "Все", matchPattern: "" },
      { id: "channel", label: "Швеллер", matchPattern: /швеллер/i },
      { id: "angle", label: "Уголок", matchPattern: /уголок/i },
      { id: "beam", label: "Балка двутавровая", matchPattern: /балка|двутавр/i },
    ],
  },
  {
    key: "listovoy",
    title: "ЛИСТОВОЙ ПРОКАТ",
    description: "ГК, ХК, оцинкованный и рифленый металлопрокат",
    icon: Layers,
    matchTerms: ["лист", "листовой"],
    subcategories: [
      { id: "all", label: "Все", matchPattern: "" },
      {
        id: "gk",
        label: "Лист горячекатаный (ГК)",
        matchPattern: /горячекат|гк/i,
      },
      {
        id: "hk",
        label: "Лист холоднокатаный (ХК)",
        matchPattern: /холоднокат|хк/i,
      },
      {
        id: "zinc",
        label: "Лист оцинкованный",
        matchPattern: /оцинкован/i,
      },
      {
        id: "ribbed",
        label: "Лист рифленый",
        matchPattern: /рифлен/i,
      },
    ],
  },
];

interface MetalDirectoryHubProps {
  products: StorefrontProduct[];
  activeCategoryKey: ParentCategoryKey;
  activeSubcategoryTag: string;
  activeBulkCategory: string | null;
  onSelectCategory: (key: ParentCategoryKey) => void;
  onSelectSubcategoryTag: (tagId: string) => void;
  onClearBulkFilter: () => void;
}

export function MetalDirectoryHub({
  products,
  activeCategoryKey,
  activeSubcategoryTag,
  activeBulkCategory,
  onSelectCategory,
  onSelectSubcategoryTag,
  onClearBulkFilter,
}: MetalDirectoryHubProps) {
  const [hoveredCategoryKey, setHoveredCategoryKey] =
    useState<ParentCategoryKey | null>(null);

  // Активный узел для отображения тегов
  const displayedNodeKey = hoveredCategoryKey ?? activeCategoryKey;
  const activeNode =
    METAL_DIRECTORY_NODES.find((n) => n.key === displayedNodeKey) ??
    METAL_DIRECTORY_NODES[0];

  // Счётчики товаров по узлам
  const categoryCounts = useMemo(() => {
    const counts: Record<ParentCategoryKey, number> = {
      armatura: 0,
      truby: 0,
      fasonnyy: 0,
      listovoy: 0,
      bulk: 0,
    };

    for (const p of products) {
      const text = `${p.name} ${p.categoryName}`.toLowerCase();
      if (p.type !== "METALL") {
        counts.bulk++;
        continue;
      }
      if (/арматур/i.test(text)) counts.armatura++;
      else if (/труб/i.test(text)) counts.truby++;
      else if (/швеллер|уголок|балк/i.test(text)) counts.fasonnyy++;
      else if (/лист/i.test(text)) counts.listovoy++;
    }
    return counts;
  }, [products]);

  // Реактивная фильтрация товаров для левой колонки (Column A)
  const filteredProducts = useMemo(() => {
    if (activeBulkCategory) {
      const q = activeBulkCategory.toLowerCase();
      return products.filter((p) => {
        const text = `${p.name} ${p.categoryName}`.toLowerCase();
        return text.includes(q);
      });
    }

    const node = METAL_DIRECTORY_NODES.find((n) => n.key === activeCategoryKey);
    if (!node) return products;

    let list = products.filter((p) => {
      if (p.type !== "METALL") return false;
      const text = `${p.name} ${p.categoryName}`.toLowerCase();
      return node.matchTerms.some((term) => text.includes(term));
    });

    if (activeSubcategoryTag && activeSubcategoryTag !== "all") {
      const tag = node.subcategories.find((s) => s.id === activeSubcategoryTag);
      if (tag && tag.matchPattern) {
        list = list.filter((p) => {
          const text = `${p.name} ${p.categoryName} ${p.gost ?? ""}`.toLowerCase();
          return typeof tag.matchPattern === "string"
            ? text.includes(tag.matchPattern.toLowerCase())
            : tag.matchPattern.test(text);
        });
      }
    }

    return list;
  }, [products, activeCategoryKey, activeSubcategoryTag, activeBulkCategory]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Заголовок секции */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <Ruler className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">
              Каталог металлопроката и справочник типоразмеров
            </h2>
          </div>
          <p className="mt-1 text-xs font-semibold text-neutral-500">
            Прямая выборка с ценами за метр и тонну · Наличие на складе в Москве
          </p>
        </div>

        {activeBulkCategory && (
          <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
            <span>Фильтр сыпучих: {activeBulkCategory}</span>
            <button
              type="button"
              onClick={onClearBulkFilter}
              className="rounded-full p-0.5 hover:bg-red-200 text-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2-Column Dashboard Hub: */}
      {/* Column A (LEFT - 25% Width): The Navigation Directory Sidebar */}
      {/* Column B (RIGHT - 75% Width): The Product Display Grid */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* ========================================================= */}
        {/* COLUMN B (Right Side - 75% Width): Product Display Grid  */}
        {/* ========================================================= */}
        <div className="order-2 min-w-0 flex-1 lg:order-2 lg:w-[72%]">
          {/* Верхняя панель активного фильтра */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/10 text-red-600">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </span>
              <div>
                <span className="text-xs font-black uppercase tracking-tight text-neutral-900">
                  {activeBulkCategory
                    ? `Категория: ${activeBulkCategory}`
                    : `${activeNode.title} · ${
                        activeNode.subcategories.find(
                          (s) => s.id === activeSubcategoryTag
                        )?.label ?? "Все"
                      }`}
                </span>
                <span className="ml-2 text-[11px] font-bold text-neutral-400">
                  ({filteredProducts.length} поз.)
                </span>
              </div>
            </div>

            {/* Горизонтальная линейка подкатегорий активного узла */}
            {!activeBulkCategory && (
              <div className="flex flex-wrap gap-1.5">
                {activeNode.subcategories.map((sub) => {
                  const isTagActive = activeSubcategoryTag === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => onSelectSubcategoryTag(sub.id)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all",
                        isTagActive
                          ? "bg-red-600 text-white shadow-sm"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      )}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Сетка карточек товаров с селектором единиц */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
              <Package className="h-10 w-10 text-neutral-300" />
              <p className="mt-3 text-sm font-black uppercase tracking-widest text-neutral-400">
                По выбранным параметрам позиции не найдены
              </p>
              <button
                type="button"
                onClick={() => {
                  onClearBulkFilter();
                  onSelectSubcategoryTag("all");
                }}
                className="mt-3 rounded-full bg-neutral-900 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-700"
              >
                Показать все в разделе
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <MetalProductInteractiveCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* ========================================================= */}
        {/* COLUMN A (Left Side - 25% Width): Navigation Directory   */}
        {/* ========================================================= */}
        <div className="order-1 w-full shrink-0 lg:order-1 lg:w-[28%] lg:max-w-[320px]">
          <div className="sticky top-20 overflow-hidden rounded-2xl border border-neutral-100 bg-white p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04),0_12px_24px_-8px_rgba(0,0,0,0.08)]">
            <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Разделы проката
              </span>
              <span className="text-[10px] font-bold uppercase text-neutral-400">
                4 группы
              </span>
            </div>

            {/* Главные родительские узлы металлопроката */}
            <div className="space-y-1.5">
              {METAL_DIRECTORY_NODES.map((node) => {
                const isCurrentActive =
                  activeCategoryKey === node.key && !activeBulkCategory;
                const isHovered = hoveredCategoryKey === node.key;
                const count = categoryCounts[node.key];

                return (
                  <div
                    key={node.key}
                    onMouseEnter={() => setHoveredCategoryKey(node.key)}
                    onMouseLeave={() => setHoveredCategoryKey(null)}
                    className="relative"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onClearBulkFilter();
                        onSelectCategory(node.key);
                        onSelectSubcategoryTag("all");
                      }}
                      className={cn(
                        "group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all duration-200",
                        isCurrentActive
                          ? "bg-neutral-900 text-white shadow-md"
                          : "text-neutral-900 hover:bg-neutral-50 hover:text-red-600"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs font-black uppercase tracking-wide transition-colors",
                              isCurrentActive
                                ? "text-white"
                                : "text-neutral-900 group-hover:text-red-600"
                            )}
                          >
                            {node.title}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "mt-0.5 truncate text-[10px] font-semibold transition-colors",
                            isCurrentActive
                              ? "text-neutral-300"
                              : "text-neutral-400 group-hover:text-neutral-500"
                          )}
                        >
                          {node.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10px] font-black tabular-nums transition-colors",
                            isCurrentActive
                              ? "bg-white/20 text-white"
                              : "bg-neutral-100 text-neutral-500 group-hover:bg-red-50 group-hover:text-red-600"
                          )}
                        >
                          {count}
                        </span>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isCurrentActive
                              ? "text-white"
                              : "text-neutral-300 group-hover:translate-x-0.5 group-hover:text-red-600"
                          )}
                        />
                      </div>
                    </button>

                    {/* Hover-to-Expand / Click Subcategories Drawer */}
                    <AnimatePresence>
                      {(isCurrentActive || isHovered) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-3 pr-1 pt-1.5"
                        >
                          <div className="flex flex-wrap gap-1 border-l-2 border-red-500/30 pl-2.5 py-1">
                            {node.subcategories.map((sub) => {
                              const isSubActive =
                                isCurrentActive &&
                                activeSubcategoryTag === sub.id;

                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onClearBulkFilter();
                                    onSelectCategory(node.key);
                                    onSelectSubcategoryTag(sub.id);
                                  }}
                                  className={cn(
                                    "rounded-lg px-2 py-1 text-[11px] font-bold transition-all",
                                    isSubActive
                                      ? "bg-red-600 text-white shadow-sm"
                                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
                                  )}
                                >
                                  {sub.label}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Футер правого сайдбара */}
            <div className="mt-4 border-t border-neutral-100 pt-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500">
                <span>Всего в наличии:</span>
                <span className="font-black text-neutral-900">
                  {products.length} товаров
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Интерактивная карточка товара с CardUnitSelector */
function MetalProductInteractiveCard({
  product,
}: {
  product: StorefrontProduct;
}) {
  const isMetal = product.type === "METALL";
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<CardUnit>(isMetal ? "m" : "bags");
  const [added, setAdded] = useState(false);

  // Адаптер для ProductAsset
  const rowAdapter: CityMetRow = {
    id: product.id,
    name: product.name,
    grade: "Ст3сп",
    gost: product.gost ?? "ГОСТ 5781-82",
    category: product.categoryName,
    subcategory: product.categoryName,
    tags: [product.categoryName],
    kind: isMetal ? "metal" : "bulk",
    lengthM: product.length ? parseFloat(product.length) || 6 : null,
    weightPerMeterKg: product.weightKg > 0 ? product.weightKg : null,
    pricePerMeter: product.price,
    pricePerTon:
      product.price && product.weightKg > 0
        ? Math.round((product.price / product.weightKg) * 1000)
        : null,
    bagWeightKg: !isMetal ? product.weightKg || 30 : null,
    bulkDensityTonsPerM3: 1.5,
    pricePerBag: !isMetal ? product.price : null,
    pricePerM3: !isMetal && product.price ? product.price * 25 : null,
    imageUrl: product.imageLocal ?? product.imageUrl,
    inStock: product.inStock,
  };

  const params: CardSelectorParams = {
    kind: rowAdapter.kind,
    weightPerMeterKg: rowAdapter.weightPerMeterKg,
    pricePerMeter: rowAdapter.pricePerMeter,
    pricePerTon: rowAdapter.pricePerTon,
    bagWeightKg: rowAdapter.bagWeightKg,
    bulkDensityTonsPerM3: rowAdapter.bulkDensityTonsPerM3,
    pricePerBag: rowAdapter.pricePerBag,
    pricePerM3: rowAdapter.pricePerM3,
  };

  const unitPrice = cardUnitPrice(params, unit);
  const weightTons = cardWeightTons(params, quantity, unit);

  const handleQuickAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-100 bg-white p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04),0_10px_24px_-8px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-red-500/30 hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)]"
    >
      {/* Верхний статус-бейдж */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700">
            <Flame className="h-3 w-3" />
            {product.categoryName}
          </span>
          {product.gost && (
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
              {product.gost}
            </span>
          )}
        </div>

        {/* Превью чертежа / фото */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-50 p-2">
          <ProductAsset row={rowAdapter} className="h-full w-full rounded-lg" />
        </div>

        {/* Наименование и параметры */}
        <div className="mt-3">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-neutral-900 transition-colors group-hover:text-red-600">
            {product.name}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-neutral-500">
            {product.length && (
              <span>
                Длина:{" "}
                <span className="font-black text-neutral-800">
                  {product.length}
                </span>
              </span>
            )}
            {product.weightKg > 0 && (
              <span>
                Вес:{" "}
                <span className="font-black text-neutral-800">
                  {product.weightKg} кг
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Интерактивный селектор единиц + вес */}
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

      {/* Футер с ценой и кнопкой */}
      <div className="mt-4 flex items-end justify-between border-t border-neutral-100 pt-3">
        <div>
          {unitPrice != null ? (
            <>
              <div className="text-lg font-black leading-tight text-neutral-900">
                {unitPrice.toLocaleString("ru-RU")} ₽
              </div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                {cardPriceUnitLabel(unit)}
              </div>
            </>
          ) : (
            <span className="text-xs font-black uppercase text-red-600">
              Под заказ
            </span>
          )}
        </div>

        <motion.button
          type="button"
          onClick={handleQuickAdd}
          whileTap={{ scale: 0.92 }}
          className={cn(
            "flex h-10 items-center gap-1.5 rounded-full px-4 text-[10px] font-black uppercase tracking-wider text-white shadow-sm transition-colors",
            added
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-neutral-900 hover:bg-red-600"
          )}
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5" /> В заказе
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5" /> Заказать
            </>
          )}
        </motion.button>
      </div>
    </motion.article>
  );
}
