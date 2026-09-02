"use client";

import type { SectionComponentProps } from "./index";

interface Step { title: string; text: string; }

export function Steps({ props }: SectionComponentProps) {
  const title = (props.title as string) ?? "";
  const steps = (props.steps as Step[]) ?? [];

  return (
    <div>
      {title && <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--atlas-font-heading)" }}>{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div key={i} className="atlas-card atlas-card-elevated p-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-full mb-3 font-bold text-lg"
              style={{ background: "var(--atlas-primary)", color: "var(--atlas-primary-fg)" }}>
              {i + 1}
            </div>
            <h3 className="font-bold text-base mb-1">{step.title}</h3>
            <p className="text-sm" style={{ color: "var(--atlas-text-muted)" }}>{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
