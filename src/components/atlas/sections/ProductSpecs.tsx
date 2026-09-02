"use client";

import type { SectionComponentProps } from "./index";
import type { AtlasProduct } from "@/lib/atlas/catalog";

export function ProductSpecs({ data }: SectionComponentProps) {
  const resolved = data as { product: AtlasProduct | null } | null;
  const product = resolved?.product;
  if (!product) return null;

  const specs: { label: string; value: string }[] = [
    { label: "Категория", value: product.categoryName },
    { label: "Единица", value: product.unit ?? "—" },
    { label: "Вес", value: product.weightLabel ?? `${product.weightKg} кг` },
    ...(product.gost ? [{ label: "ГОСТ", value: product.gost }] : []),
    ...(product.length ? [{ label: "Длина", value: product.length }] : []),
    ...product.attributes.map((a) => ({ label: a.key, value: a.value })),
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--atlas-font-heading)" }}>Характеристики</h2>
      <div className="atlas-card overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {specs.map((spec, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--atlas-border)" }}>
                <td className="px-4 py-2.5 font-medium" style={{ color: "var(--atlas-text-muted)", width: "40%" }}>{spec.label}</td>
                <td className="px-4 py-2.5">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
