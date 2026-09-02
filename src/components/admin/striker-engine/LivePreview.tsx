"use client";

import { useState, useRef, useEffect } from "react";
import { Monitor, Tablet, Smartphone, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useStriker } from "./StrikerContext";
import StrikerStorefront from "@/components/striker/StrikerStorefront";
import type { StorefrontProduct } from "@/lib/theme-storefront";

/** Мок-товары для live-превью (реальная витрина получает данные из БД) */
const MOCK_PRODUCTS: StorefrontProduct[] = [
  { id: "m1", name: "Арматура А500С Ø12 мм", slug: "armatura-a500c-12", categoryName: "Арматура", type: "METALL", price: 50400, isOnOrder: false, unit: "т", weightKg: 0.888, inStock: true, imageUrl: null, imageLocal: null, gost: "ГОСТ 34028-2016", length: "11.7 м", weightLabel: "0.888 кг/м", attributes: [] },
  { id: "m2", name: "Швеллер 10П ст3сп", slug: "shveller-10p", categoryName: "Швеллер", type: "METALL", price: 61200, isOnOrder: false, unit: "т", weightKg: 8.59, inStock: true, imageUrl: null, imageLocal: null, gost: "ГОСТ 8240-97", length: "12 м", weightLabel: "8.59 кг/м", attributes: [] },
  { id: "m3", name: "Труба профильная 40×20×2", slug: "truba-profilnaya-40x20x2", categoryName: "Труба", type: "METALL", price: 68500, isOnOrder: false, unit: "т", weightKg: 1.7, inStock: true, imageUrl: null, imageLocal: null, gost: "ГОСТ 8645-68", length: "6 м", weightLabel: "1.7 кг/м", attributes: [] },
  { id: "m4", name: "Лист горячекатаный 3 мм 1250×2500", slug: "list-goryachekatanyy-3", categoryName: "Лист", type: "METALL", price: 58900, isOnOrder: false, unit: "т", weightKg: 73.6, inStock: true, imageUrl: null, imageLocal: null, gost: "ГОСТ 19903-2015", length: "2.5 м", weightLabel: "73.6 кг/лист", attributes: [] },
  { id: "s1", name: "Песок мытый (намывной)", slug: "pesok-mytyy", categoryName: "Песок", type: "BAG_30KG", price: 1150, isOnOrder: false, unit: "м³", weightKg: 30, inStock: true, imageUrl: null, imageLocal: null, gost: "ГОСТ 8736-2014", length: null, weightLabel: "1600 кг/м³", attributes: [] },
  { id: "s2", name: "Щебень гранитный 5-20", slug: "scheben-granitnyy-5-20", categoryName: "Щебень", type: "BIG_BAG_1TON", price: 2450, isOnOrder: false, unit: "м³", weightKg: 1000, inStock: true, imageUrl: null, imageLocal: null, gost: "ГОСТ 8267-93", length: null, weightLabel: "1470 кг/м³", attributes: [] },
  { id: "s3", name: "Песок карьерный", slug: "pesok-kariernyy", categoryName: "Песок", type: "BAG_30KG", price: 850, isOnOrder: false, unit: "м³", weightKg: 30, inStock: true, imageUrl: null, imageLocal: null, gost: "ГОСТ 8736-2014", length: null, weightLabel: "1500 кг/м³", attributes: [] },
  { id: "s4", name: "Отсев гранитный 0-5", slug: "otsev-granitnyy-0-5", categoryName: "Отсев", type: "BIG_BAG_1TON", price: 1600, isOnOrder: false, unit: "м³", weightKg: 1000, inStock: true, imageUrl: null, imageLocal: null, gost: "ГОСТ 8267-93", length: null, weightLabel: "1450 кг/м³", attributes: [] },
];

type DeviceType = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<DeviceType, number> = {
  desktop: 1200,
  tablet: 768,
  mobile: 390,
};

export default function LivePreview() {
  const { blueprint } = useStriker();
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [frame, setFrame] = useState(0);
  const [zoomMode, setZoomMode] = useState<"fit" | "100" | "75" | "50">("fit");
  const [autoScale, setAutoScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const targetWidth = DEVICE_WIDTHS[device];
  const enabledCount = blueprint.layout.filter((c) => c.enabled).length;

  // Рассчитываем авто-масштаб, чтобы десктопная витрина идеально помещалась в любое окно без горизонтального скролла
  useEffect(() => {
    const calc = () => {
      if (!containerRef.current) return;
      const padding = 32;
      const available = containerRef.current.clientWidth - padding;
      if (available > 0) {
        const s = Math.min(1, Math.max(0.35, available / targetWidth));
        setAutoScale(s);
      }
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [device, targetWidth]);

  // Измеряем реальную высоту витрины, чтобы после масштабирования не было обрезки снизу и пустых полей
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setContentHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [blueprint, frame]);

  const currentScale =
    zoomMode === "100"
      ? 1
      : zoomMode === "75"
      ? 0.75
      : zoomMode === "50"
      ? 0.5
      : autoScale;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-muted/20">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-card px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-foreground">
            Живой сайт
          </span>
          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {targetWidth}px · {Math.round(currentScale * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Switcher */}
          <div className="flex rounded-lg border bg-muted/40 p-0.5">
            {(
              [
                ["desktop", Monitor, "ПК"],
                ["tablet", Tablet, "Планшет"],
                ["mobile", Smartphone, "Телефон"],
              ] as const
            ).map(([d, Icon, title]) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                  device === d ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
                title={title}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{title}</span>
              </button>
            ))}
          </div>

          {/* Zoom Switcher */}
          <div className="flex rounded-lg border bg-muted/40 p-0.5">
            {(
              [
                ["fit", "Авто"],
                ["100", "100%"],
                ["75", "75%"],
                ["50", "50%"],
              ] as const
            ).map(([z, label]) => (
              <button
                key={z}
                onClick={() => setZoomMode(z)}
                className={`rounded px-2 py-1 text-xs font-bold transition-all ${
                  zoomMode === z ? "bg-background text-foreground shadow-xs font-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setFrame((f) => f + 1)}
            className="flex items-center rounded-lg border bg-card p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            title="Обновить просмотр"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Preview Canvas Area */}
      <div
        ref={containerRef}
        className="flex flex-1 items-start justify-center overflow-auto bg-dot-grid p-3 lg:p-6"
      >
        <div
          style={{ height: contentHeight > 0 ? contentHeight * currentScale : "auto" }}
          className="shrink-0"
        >
          <div
            ref={contentRef}
            key={frame}
            style={{
              width: `${targetWidth}px`,
              transform: `scale(${currentScale})`,
              transformOrigin: "top center",
            }}
            className="overflow-hidden rounded-xl border bg-card shadow-2xl ring-1 ring-black/10 transition-transform duration-200"
          >
            {enabledCount === 0 ? (
              <div
                className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-10 text-center"
                style={{ background: blueprint.tokens.palette.background, color: blueprint.tokens.palette.foreground }}
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                  style={{ background: blueprint.tokens.palette.muted }}
                >
                  🏗️
                </span>
                <div className="text-lg font-black uppercase tracking-widest">Тема пуста</div>
                <p className="max-w-sm text-sm font-medium opacity-60">
                  Все блоки выключены. Откройте «Настройки сайта» → «Блоки на главной странице» и
                  включите нужные блоки (Шапка, Баннер, Каталог, Калькулятор…), либо создайте дизайн
                  через ИИ-Дизайнера.
                </p>
                <div
                  className="mt-2 rounded px-3 py-1.5 text-xs font-black uppercase tracking-wider"
                  style={{ background: blueprint.tokens.palette.primary, color: blueprint.tokens.palette.background }}
                >
                  {enabledCount} из {blueprint.layout.length} блоков включено
                </div>
              </div>
            ) : (
              <StrikerStorefront blueprint={blueprint} products={MOCK_PRODUCTS} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
