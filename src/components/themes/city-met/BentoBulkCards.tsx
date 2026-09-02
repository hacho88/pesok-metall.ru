"use client";

/**
 * BentoBulkCards — верхний ряд из 3 массивных графических карточек
 * собственных высокомаржинальных категорий: [ ПЕСОК ] [ ЩЕБЕНЬ ] [ КЕРАМЗИТ ].
 * Каждая карточка — текстурный оверлей (песчаное зерно / каменная крошка /
 * керамзитовые гранулы) поверх градиента. Клик фильтрует сетку товаров.
 */
import { motion } from "framer-motion";
import { Layers, Mountain, CircleDot, ArrowUpRight } from "lucide-react";
import type { CityMetRow } from "./catalog-data";
import { cn } from "@/lib/utils";

interface BentoCardDef {
  key: string;
  title: string;
  subtitle: string;
  subcategory: string;
  icon: typeof Layers;
  /** Текстурный оверлей (SVG-паттерн) */
  texture: React.ReactNode;
  /** Градиент фона */
  gradient: string;
}

/** Песчаное зерно: мелкие точки */
function SandTexture() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden="true">
      <defs>
        <pattern id="cm-sand" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.1" fill="#fef3c7" opacity="0.7" />
          <circle cx="10" cy="8" r="0.9" fill="#fde68a" opacity="0.6" />
          <circle cx="6" cy="12" r="0.8" fill="#fef9c3" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cm-sand)" />
    </svg>
  );
}

/** Каменная крошка: угловатые многоугольники */
function GravelTexture() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-35" aria-hidden="true">
      <defs>
        <pattern id="cm-gravel" width="26" height="26" patternUnits="userSpaceOnUse">
          <polygon points="4,2 12,6 9,14 2,12" fill="#e2e8f0" opacity="0.55" />
          <polygon points="16,14 24,10 26,20 18,24" fill="#cbd5e1" opacity="0.45" />
          <polygon points="8,18 14,16 16,24 10,26" fill="#94a3b8" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cm-gravel)" />
    </svg>
  );
}

/** Керамзитовые гранулы: круги с обводкой */
function ClayTexture() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden="true">
      <defs>
        <pattern id="cm-clay" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="4" fill="none" stroke="#fdba74" strokeWidth="1.5" opacity="0.7" />
          <circle cx="18" cy="16" r="5" fill="none" stroke="#fb923c" strokeWidth="1.5" opacity="0.6" />
          <circle cx="16" cy="4" r="2.5" fill="#fed7aa" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cm-clay)" />
    </svg>
  );
}

const BENTO_CARDS: BentoCardDef[] = [
  {
    key: "sand",
    title: "ПЕСОК",
    subtitle: "Карьерный · Речной · Мытый",
    subcategory: "Песок в мешках",
    icon: Layers,
    texture: <SandTexture />,
    gradient: "from-amber-200 via-amber-300 to-amber-500",
  },
  {
    key: "gravel",
    title: "ЩЕБЕНЬ",
    subtitle: "Гранитный 5-20 · 20-40",
    subcategory: "Щебень в мешках",
    icon: Mountain,
    texture: <GravelTexture />,
    gradient: "from-slate-300 via-slate-400 to-slate-600",
  },
  {
    key: "clay",
    title: "КЕРАМЗИТ",
    subtitle: "Фракция 10-20 · Лёгкий",
    subcategory: "Керамзит в мешках",
    icon: CircleDot,
    texture: <ClayTexture />,
    gradient: "from-orange-300 via-orange-400 to-orange-600",
  },
];

interface BentoBulkCardsProps {
  rows: CityMetRow[];
  activeSubcategory: string | null;
  onSelect: (subcategory: string | null) => void;
}

export default function BentoBulkCards({ rows, activeSubcategory, onSelect }: BentoBulkCardsProps) {
  const countFor = (subcategory: string) =>
    rows.filter((r) => r.subcategory === subcategory).length;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {BENTO_CARDS.map((card, i) => {
        const active = activeSubcategory === card.subcategory;
        const count = countFor(card.subcategory);
        const Icon = card.icon;
        return (
          <motion.button
            key={card.key}
            type="button"
            onClick={() => onSelect(active ? null : card.subcategory)}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 26 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.985 }}
            className={cn(
              "group relative flex h-40 flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition-all sm:h-44",
              active
                ? "border-neutral-900 ring-2 ring-neutral-900 ring-offset-2"
                : "border-white/40 hover:shadow-xl"
            )}
          >
            {/* Градиент + текстура */}
            <div className={cn("absolute inset-0 bg-gradient-to-br", card.gradient)} />
            {card.texture}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/10" />

            {/* Иконка и счётчик */}
            <div className="relative flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/25 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex items-center gap-1 rounded-full bg-black/25 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-sm">
                {count} поз.
                <ArrowUpRight
                  className={cn(
                    "h-3 w-3 transition-transform duration-300",
                    active ? "rotate-45" : "group-hover:rotate-45"
                  )}
                />
              </span>
            </div>

            {/* Текст */}
            <div className="relative">
              <h3 className="text-2xl font-black uppercase tracking-tight text-white drop-shadow-sm">
                {card.title}
              </h3>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-white/85">
                {card.subtitle}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
