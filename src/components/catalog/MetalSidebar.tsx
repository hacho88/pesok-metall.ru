"use client";

import Link from "next/link";
import { 
  ChevronDown, 
  Layers, 
  Dna, 
  Box, 
  Hash, 
  Grid3X3,
  Flame,
  Construction
} from "lucide-react";
import type { CategoryNode } from "./CategorySidebar";
import { cn } from "@/lib/utils";

// Mapping category slugs to professional icons
const CATEGORY_ICONS: Record<string, any> = {
  armatura: Dna,
  truby: Hash,
  listy: Box,
  setka: Grid3X3,
  shveller: Layers,
  ugolok: Flame,
  default: Construction,
};

export function MetalSidebar({
  categories,
  activeSlug,
}: {
  categories: CategoryNode[];
  activeSlug?: string;
}) {
  return (
    <aside className="metal-sidebar hidden md:block w-72 shrink-0 pr-8">
      <div className="sticky top-24 space-y-8">
        <div>
          <h3 className="mb-4 px-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Категории металла
          </h3>
          <nav className="metal-side-catalog space-y-1">
            <Link
              href="/metall"
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200",
                !activeSlug 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                !activeSlug ? "bg-white/10" : "bg-slate-100 group-hover:bg-white"
              )}>
                <Layers className="h-4 w-4" />
              </div>
              <span>Весь металл</span>
            </Link>

            <div className="mt-4 space-y-1">
              {categories.map((category) => (
                <SideItem
                  key={category.id}
                  category={category}
                  activeSlug={activeSlug}
                />
              ))}
            </div>
          </nav>
        </div>

        {/* Visual Glassmorphism Card for Support/Help */}
        <div className="rounded-3xl border border-slate-100 bg-white/40 p-6 backdrop-blur-sm shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Помощь</p>
          <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">
            Не нашли нужную позицию? Мы привезем под заказ любой объем.
          </p>
          <Link href="tel:+74950000000" className="text-sm font-bold text-slate-900 hover:underline">
            +7 (495) 000-00-00
          </Link>
        </div>
      </div>
    </aside>
  );
}

function SideItem({
  category,
  activeSlug,
}: {
  category: CategoryNode;
  activeSlug?: string;
}) {
  const isOpen =
    activeSlug === category.slug ||
    category.children.some((c) => c.slug === activeSlug);
  
  const Icon = CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default;

  return (
    <div className="space-y-1">
      <Link
        href={`/metall/${category.slug}`}
        className={cn(
          "group flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all duration-200",
          activeSlug === category.slug 
            ? "bg-slate-900 text-white shadow-md" 
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn(
            "h-4 w-4 transition-colors",
            activeSlug === category.slug ? "text-white" : "text-slate-400 group-hover:text-slate-900"
          )} />
          <span className="font-bold">{category.name}</span>
        </div>
        {category.children.length > 0 && (
          <ChevronDown className={cn(
            "h-3.5 w-3.5 opacity-40 transition-transform",
            isOpen && "rotate-180"
          )} />
        )}
      </Link>
      
      {isOpen && category.children.length > 0 && (
        <div className="ml-9 mt-1 space-y-1 border-l-2 border-slate-100 pl-4">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/metall/${child.slug}`}
              className={cn(
                "block py-1.5 text-xs font-medium transition-colors",
                activeSlug === child.slug 
                  ? "text-slate-900 font-bold" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
