import { ReactNode } from "react";
import type { SectionSettings } from "@/lib/atlas/config-schema";

const PT_MAP = { none: "", sm: "atlas-section-pt-sm", md: "atlas-section-pt-md", lg: "atlas-section-pt-lg" };
const PB_MAP = { none: "", sm: "atlas-section-pb-sm", md: "atlas-section-pb-md", lg: "atlas-section-pb-lg" };
const BG_MAP = { none: "", surface: "atlas-section-bg-surface", muted: "atlas-section-bg-muted", brand: "atlas-section-bg-brand", dark: "atlas-section-bg-dark", image: "" };
const CONTAINER_MAP = { default: "atlas-container", wide: "atlas-container-wide", full: "atlas-container-full" };

export function SectionShell({ settings, children }: { settings: SectionSettings; children: ReactNode }) {
  const pt = PT_MAP[settings.paddingTop] ?? "";
  const pb = PB_MAP[settings.paddingBottom] ?? "";
  const bg = BG_MAP[settings.background] ?? "";
  const container = CONTAINER_MAP[settings.container] ?? "atlas-container";

  const visClasses = [
    settings.visibility.desktop ? "" : "atlas-hide-desktop",
    settings.visibility.tablet ? "" : "atlas-hide-tablet",
    settings.visibility.mobile ? "" : "atlas-hide-mobile",
  ].join(" ");

  return (
    <section className={`atlas-section ${pt} ${pb} ${bg} ${visClasses}`.trim().replace(/\s+/g, " ")}>
      <div className={container}>
        {children}
      </div>
    </section>
  );
}
