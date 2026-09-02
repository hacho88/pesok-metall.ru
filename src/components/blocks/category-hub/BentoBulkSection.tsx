"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Layers, Mountain, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BentoBulkCardItem {
  id: "sand" | "gravel" | "clay";
  title: string;
  subtitle: string;
  badge: string;
  categoryFilter: string;
  gradient: string;
  accentColor: string;
  grainColor: string;
  highlights: string[];
}

export const BENTO_BULK_ITEMS: BentoBulkCardItem[] = [
  {
    id: "sand",
    title: "ПЕСОК",
    subtitle: "В мешках по 30/50 кг и навалом от 3 м³",
    badge: "Собственная фасовка",
    categoryFilter: "Песок",
    gradient: "from-amber-500/15 via-amber-500/5 to-transparent",
    accentColor: "text-amber-700 border-amber-200 bg-amber-50",
    grainColor: "rgba(217, 119, 6, 0.2)",
    highlights: ["Мытый", "Карьерный", "Сеяный", "Речной"],
  },
  {
    id: "gravel",
    title: "ЩЕБЕНЬ",
    subtitle: "Все фракции в мешках и самосвалами",
    badge: "ГОСТ 8267-93",
    categoryFilter: "Щебень",
    gradient: "from-slate-500/15 via-slate-500/5 to-transparent",
    accentColor: "text-slate-700 border-slate-200 bg-slate-50",
    grainColor: "rgba(100, 116, 139, 0.2)",
    highlights: ["5-20 мм", "20-40 мм", "Гранитный", "Гравийный"],
  },
  {
    id: "clay",
    title: "КЕРАМЗИТ",
    subtitle: "Фасованный 0.05 м³ (мешки) и биг-беги",
    badge: "Теплоизоляция",
    categoryFilter: "Керамзит",
    gradient: "from-orange-500/15 via-orange-500/5 to-transparent",
    accentColor: "text-orange-700 border-orange-200 bg-orange-50",
    grainColor: "rgba(234, 88, 12, 0.2)",
    highlights: ["Фракция 10-20", "Фракция 0-10", "В мешках", "Биг-беги"],
  },
];

interface BentoBulkSectionProps {
  onSelectCategory?: (category: string) => void;
  activeBulkCategory?: string | null;
}

export function BentoBulkSection({
  onSelectCategory,
  activeBulkCategory,
}: BentoBulkSectionProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Секционный лейбл */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600/10 text-red-600">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-widest text-neutral-500">
            Собственные сыпучие материалы · Прямые поставки со склада
          </span>
        </div>
        <span className="hidden text-[10px] font-bold uppercase tracking-wider text-neutral-400 sm:inline">
          3 категории в наличии
        </span>
      </div>

      {/* Асимметричная Bento Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {BENTO_BULK_ITEMS.map((item, idx) => {
          const isActive = activeBulkCategory === item.categoryFilter;
          const IconComponent =
            item.id === "sand"
              ? Layers
              : item.id === "gravel"
              ? Mountain
              : Layers;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: idx * 0.08,
                type: "spring",
                stiffness: 320,
                damping: 26,
              }}
              whileHover={{
                y: -4,
                scale: 1.01,
                transition: { duration: 0.2 },
              }}
              onClick={() => onSelectCategory?.(item.categoryFilter)}
              className={cn(
                "group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border bg-white p-6 transition-all duration-300",
                "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04),0_12px_24px_-8px_rgba(0,0,0,0.08)]",
                "hover:border-red-500/40 hover:shadow-[0_8px_30px_-6px_rgba(239,68,68,0.2)]",
                isActive
                  ? "border-red-600 ring-2 ring-red-600/20 shadow-[0_8px_30px_-6px_rgba(239,68,68,0.25)]"
                  : "border-neutral-100"
              )}
            >
              {/* CSS Grain / Physical Texture Overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-75"
                style={{
                  backgroundImage: `radial-gradient(${item.grainColor} 1.2px, transparent 1.2px)`,
                  backgroundSize: "10px 10px",
                }}
              />

              {/* Ambient Glow Canvas Background */}
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br transition-opacity duration-300",
                  item.gradient,
                  "opacity-60 group-hover:opacity-100"
                )}
              />

              {/* Flare Highlight on Hover */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-white/60 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-red-500/10" />

              {/* Card Header & Badges */}
              <div className="relative z-10 flex items-start justify-between">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
                    item.accentColor
                  )}
                >
                  <IconComponent className="h-3 w-3" />
                  {item.badge}
                </span>

                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-all duration-300",
                    isActive
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-neutral-200/80 bg-white/80 text-neutral-400 group-hover:border-red-500 group-hover:bg-red-600 group-hover:text-white group-hover:shadow-md"
                  )}
                >
                  {isActive ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )}
                </div>
              </div>

              {/* Main Content */}
              <div className="relative z-10 mt-6">
                <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900 transition-colors group-hover:text-red-600">
                  {item.title}
                </h3>
                <p className="mt-1 min-h-[36px] text-xs font-semibold leading-relaxed text-neutral-500">
                  {item.subtitle}
                </p>

                {/* Parametric Highlight Tags */}
                <div className="mt-5 flex flex-wrap gap-1.5 border-t border-neutral-100/80 pt-4">
                  {item.highlights.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-neutral-50 px-2 py-0.5 text-[10px] font-bold text-neutral-600 transition-colors group-hover:bg-white group-hover:text-neutral-900"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
