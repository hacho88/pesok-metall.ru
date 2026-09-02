"use client";

import * as Icons from "lucide-react";
import Link from "next/link";
import type { SectionComponentProps } from "./index";
import type { AtlasCategoryNode } from "@/lib/atlas/catalog";

export function CategoryTiles({ props, data }: SectionComponentProps) {
  const resolved = data as { categories: AtlasCategoryNode[] } | null;
  const categories = resolved?.categories ?? [];
  const limit = (props.limit as number) ?? 12;
  const variant = (props.variant as string) ?? "grid";
  const items = categories.slice(0, limit);

  if (items.length === 0) return null;

  if (variant === "list") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((cat) => (
          <Link key={cat.id} href={`/catalog/${encodeURIComponent(cat.slug)}`}
            className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-[var(--atlas-surface-2)]"
            style={{ border: "1px solid var(--atlas-border)" }}>
            <span className="font-medium text-sm">{cat.name}</span>
            <span className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>{cat.totalProductCount} тов.</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((cat) => {
        const iconName = cat.type === "BULK" ? "Package" : cat.type === "MIXED" ? "Boxes" : "Layers";
        const Icon = (Icons as any)[iconName] ?? Icons.Grid3x3;
        return (
          <Link
            key={cat.id}
            href={`/catalog/${encodeURIComponent(cat.slug)}`}
            className="atlas-card atlas-card-elevated p-4 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
              style={{ background: "var(--atlas-surface-2)" }}>
              {cat.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Icon size={28} style={{ color: "var(--atlas-primary)" }} />
              )}
            </div>
            <div className="font-semibold text-sm line-clamp-2">{cat.name}</div>
            <div className="text-xs mt-1" style={{ color: "var(--atlas-text-muted)" }}>
              {cat.totalProductCount} товаров
            </div>
          </Link>
        );
      })}
    </div>
  );
}
