"use client";

import { sanitizeCustomHtml } from "@/lib/atlas/sanitize";
import type { SectionComponentProps } from "./index";

export function RichText({ props }: SectionComponentProps) {
  const html = (props.html as string) ?? "";
  const title = (props.title as string) ?? "";

  return (
    <div>
      {title && <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--atlas-font-heading)" }}>{title}</h2>}
      <div
        className="prose-atlas text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizeCustomHtml(html) }}
      />
    </div>
  );
}
