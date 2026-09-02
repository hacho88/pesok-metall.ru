"use client";

/**
 * STRIKER.Engine ULTRA — CategoryLayout.
 * Конструктор структурного вида категорий на главной странице:
 *  - brutalist-grid: строгая сетка с рамками 1px, тяжёлая капс-типографика
 *  - carousel-minimal: горизонтальная свайп-лента с иконками
 *  - masonry-industrial: кирпичная раскладка в индустриальном стиле
 * Поверх изображений категорий накладывается регулируемое зерно-шум.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Factory,
  Boxes,
  Package,
  Layers,
  Hammer,
  Building2,
  ShieldCheck,
  Truck,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { CatalogComponentsConfig } from "@/types/striker-engine";

export interface CategoryItem {
  name: string;
  count: number;
}

/** Иконка категории по ключевым словам названия */
function categoryIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (/(песок|щебень|отсев|грунт|сыпуч)/.test(n)) return Boxes;
  if (/(арматур|сетка)/.test(n)) return Layers;
  if (/(труба|профиль)/.test(n)) return Factory;
  if (/(лист|швеллер|балка|уголок|квадрат|полоса)/.test(n)) return Hammer;
  if (/(цемент|смесь|бетон|кирпич|блок)/.test(n)) return Building2;
  if (/(свая|крепёж|метиз)/.test(n)) return ShieldCheck;
  return Package;
}

/** Псевдо-тон изображения категории (для градиента) */
function categoryTone(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const hues = [22, 38, 210, 160, 280, 350];
  return `hsl(${hues[h % hues.length]} 28% 42%)`;
}

interface CategoryLayoutProps {
  categories: CategoryItem[];
  config: CatalogComponentsConfig;
  onSelect?: (name: string) => void;
}

export default function CategoryLayout({ categories, config, onSelect }: CategoryLayoutProps) {
  const { categoryStyle, grainOpacity } = config;

  /** Зерно-шум поверх изображения категории */
  const grain = useMemo(
    () => (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <filter id="striker-cat-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#striker-cat-grain)" />
      </svg>
    ),
    []
  );

  const tone = (name: string) => categoryTone(name);

  /* ============ brutalist-grid: строгая сетка 1px ============ */
  if (categoryStyle === "brutalist-grid") {
    return (
      <div className="grid grid-cols-2 gap-0 border border-[var(--theme-border)] sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c, i) => {
          const Icon = categoryIcon(c.name);
          return (
            <motion.button
              key={c.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect?.(c.name)}
              className="group relative flex flex-col items-start gap-3 overflow-hidden p-4 text-left transition-colors hover:bg-[var(--theme-muted)]/50"
              style={{ border: "1px solid var(--theme-border)", margin: -0.5 }}
            >
              {/* Изображение-подложка с зерном */}
              <div
                className="relative flex h-16 w-full items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${tone(c.name)}, var(--theme-secondary))` }}
              >
                <Icon className="h-8 w-8 opacity-60 transition-transform duration-300 group-hover:scale-110" />
                <div style={{ opacity: grainOpacity }}>{grain}</div>
              </div>
              <div className="w-full">
                <div className="text-sm font-black uppercase leading-tight tracking-tight text-[var(--theme-foreground)]">
                  {c.name}
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--theme-muted-foreground)]">
                  <span>{c.count} поз.</span>
                  <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" style={{ color: "var(--theme-primary)" }} />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  }

  /* ============ carousel-minimal: горизонтальная свайп-лента ============ */
  if (categoryStyle === "carousel-minimal") {
    return (
      <div className="relative">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {categories.map((c, i) => {
            const Icon = categoryIcon(c.name);
            return (
              <motion.button
                key={c.name}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onSelect?.(c.name)}
                className="group flex w-40 shrink-0 snap-start flex-col items-center gap-2.5 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-4 text-center transition-all hover:-translate-y-0.5 hover:border-[var(--theme-primary)] hover:shadow-lg"
              >
                <div
                  className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full"
                  style={{ background: `linear-gradient(135deg, ${tone(c.name)}, var(--theme-secondary))` }}
                >
                  <Icon className="h-6 w-6 text-white/90" />
                  <div style={{ opacity: grainOpacity }}>{grain}</div>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-black uppercase tracking-wide text-[var(--theme-foreground)]">
                    {c.name}
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold text-[var(--theme-muted-foreground)]">
                    {c.count} поз.
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
        {/* Индикатор прокрутки */}
        <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-[var(--theme-muted)]">
          <motion.div
            className="h-full"
            style={{ background: "var(--theme-primary)" }}
            initial={false}
            animate={{ width: `${Math.min(100, (3 / categories.length) * 100)}%` }}
          />
        </div>
      </div>
    );
  }

  /* ============ masonry-industrial: кирпичная раскладка ============ */
  return (
    <div className="columns-2 gap-3 lg:columns-4">
      {categories.map((c, i) => {
        const Icon = categoryIcon(c.name);
        const tall = i % 3 === 0;
        return (
          <motion.button
            key={c.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelect?.(c.name)}
            className={`group relative mb-3 block w-full break-inside-avoid overflow-hidden border border-[var(--theme-border)] text-left transition-all hover:border-[var(--theme-primary)] hover:shadow-xl ${
              tall ? "h-44" : "h-32"
            }`}
            style={{ background: "var(--theme-card)" }}
          >
            {/* Изображение-подложка */}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(160deg, ${tone(c.name)}, var(--theme-secondary))` }}
            >
              <div style={{ opacity: grainOpacity }}>{grain}</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-3.5">
              <Icon className="mb-2 h-6 w-6 text-white/80" />
              <div className="text-sm font-black uppercase leading-tight tracking-tight text-white">
                {c.name}
              </div>
              <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-white/60">
                {c.count} поз.
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
