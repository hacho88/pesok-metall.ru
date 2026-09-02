"use client";

import type { SectionComponentProps } from "./index";

export function Divider({ props }: SectionComponentProps) {
  const variant = (props.variant as string) ?? "line";
  if (variant === "dots") {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <span className="w-2 h-2 rounded-full" style={{ background: "var(--atlas-border)" }} />
        <span className="w-2 h-2 rounded-full" style={{ background: "var(--atlas-border)" }} />
        <span className="w-2 h-2 rounded-full" style={{ background: "var(--atlas-border)" }} />
      </div>
    );
  }
  return <hr style={{ border: "none", borderTop: "1px solid var(--atlas-border)" }} />;
}
