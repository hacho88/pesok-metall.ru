"use client";

import Link from "next/link";
import type { SectionComponentProps } from "./index";
import type { AtlasProduct } from "@/lib/atlas/catalog";
import { formatRub } from "@/lib/atlas/pricing";

export function PriceBoard({ props, data }: SectionComponentProps) {
  const resolved = data as { products: AtlasProduct[] } | null;
  const products = resolved?.products ?? [];
  const title = (props.title as string) ?? "Ключевые позиции";

  if (products.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--atlas-font-heading)" }}>{title}</h2>
      <div className="atlas-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--atlas-surface-2)", borderBottom: "1px solid var(--atlas-border)" }}>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--atlas-text-muted)" }}>Наименование</th>
              <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--atlas-text-muted)" }}>Цена за ед.</th>
              <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--atlas-text-muted)" }}>Цена за тонну</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const perTon = p.price != null && p.weightKg > 0 && (p.unit === "м" || p.unit === "п.м")
                ? (p.price / p.weightKg) * 1000
                : p.unit === "т" ? p.price : null;
              return (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--atlas-border)" }} className="hover:bg-[var(--atlas-surface-2)]">
                  <td className="px-4 py-3">
                    <Link href={`/product/${encodeURIComponent(p.slug)}`} className="font-medium hover:text-[var(--atlas-primary)]">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {p.price != null ? `${formatRub(p.price)} ₽` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: "var(--atlas-text-muted)", fontVariantNumeric: "tabular-nums" }}>
                    {perTon != null ? `${formatRub(perTon)} ₽/т` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/product/${encodeURIComponent(p.slug)}`} className="atlas-btn atlas-btn-outline atlas-btn-sm">
                      Подробнее
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
