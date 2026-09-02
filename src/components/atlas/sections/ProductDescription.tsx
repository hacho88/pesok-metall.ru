"use client";

import { sanitizeDescription } from "@/lib/atlas/sanitize";
import type { SectionComponentProps } from "./index";
import type { AtlasProduct } from "@/lib/atlas/catalog";

export function ProductDescription({ data }: SectionComponentProps) {
  const resolved = data as { product: AtlasProduct | null } | null;
  const product = resolved?.product;
  if (!product?.description) return null;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--atlas-font-heading)" }}>Описание</h2>
      <div
        className="text-sm leading-relaxed [&_h3]:font-bold [&_h3]:text-base [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_p]:mb-3"
        dangerouslySetInnerHTML={{ __html: sanitizeDescription(product.description) }}
      />
    </div>
  );
}
