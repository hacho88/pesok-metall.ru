"use client";

import { Component, ReactNode } from "react";
import type { Section } from "@/lib/atlas/config-schema";
import type { ResolvedSectionData } from "@/lib/atlas/resolver";
import { SectionShell } from "./SectionShell";
import { getSectionComponent } from "../sections";

interface Props {
  sections: Section[];
  resolved: ResolvedSectionData;
}

export function AtlasRenderer({ sections, resolved }: Props) {
  return (
    <>
      {sections.map((section) => {
        const entry = getSectionComponent(section.type);
        if (!entry) {
          return (
            <SectionShell key={section.id} settings={section.settings}>
              <div className="p-4 rounded-lg text-sm" style={{ background: "var(--atlas-surface-2)", color: "var(--atlas-text-muted)" }}>
                Неизвестная секция: {section.type}
              </div>
            </SectionShell>
          );
        }
        const data = resolved[section.id] ?? null;
        return (
          <ErrorBoundary key={section.id} sectionId={section.id}>
            <SectionShell settings={section.settings}>
              <entry.Component props={section.props} data={data} />
            </SectionShell>
          </ErrorBoundary>
        );
      })}
    </>
  );
}

class ErrorBoundary extends Component<{ sectionId: string; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.error(`[atlas renderer] section ${this.props.sectionId}:`, err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <SectionShell settings={{ paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } }}>
          <div className="p-4 rounded-lg text-sm" style={{ background: "color-mix(in srgb, var(--atlas-danger) 8%, transparent)", color: "var(--atlas-danger)", border: "1px solid color-mix(in srgb, var(--atlas-danger) 20%, transparent)" }}>
            Ошибка в секции. Проверьте конфигурацию.
          </div>
        </SectionShell>
      );
    }
    return this.props.children;
  }
}
