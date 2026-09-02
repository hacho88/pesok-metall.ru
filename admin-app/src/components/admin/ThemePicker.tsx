"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, LayoutTemplate, Palette } from "lucide-react";
import { THEME_OPTIONS, type ThemeOption } from "@/lib/block-schemas";
import { THEME_STYLES, THEME_STYLE_OF, type ThemeStyle } from "@/lib/theme-styles";
import { cn } from "@/lib/utils";
import type { ThemePreset } from "@/types/page-builder";

interface ThemePickerProps {
  value: ThemePreset;
  onChange: (theme: ThemePreset) => void;
}

const STYLE_ORDER: ThemeStyle[] = ["minimal", "bento", "editorial", "commerce"];

/** Мини-превью раскладки страницы в стиле категории */
function LayoutPreview({ style, swatch }: { style: ThemeStyle; swatch: [string, string, string] }) {
  const [bg, accent, fg] = swatch;
  const line = (w: string, c = fg, o = 0.35) => (
    <span className="block h-1 rounded-full" style={{ width: w, backgroundColor: c, opacity: o }} />
  );

  if (style === "minimal") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1.5 p-2" style={{ backgroundColor: bg }}>
        <span className="h-0.5 w-6 rounded-full" style={{ backgroundColor: accent, opacity: 0.7 }} />
        {line("70%", fg, 0.85)}
        {line("55%", fg, 0.85)}
        {line("40%", fg, 0.4)}
        <span className="mt-1 h-2 w-10 rounded-full" style={{ backgroundColor: accent }} />
      </div>
    );
  }

  if (style === "bento") {
    return (
      <div className="grid h-full grid-cols-2 gap-1 p-2" style={{ backgroundColor: bg }}>
        <span className="col-span-2 rounded-md" style={{ backgroundColor: accent, opacity: 0.85 }} />
        <span className="rounded-md" style={{ backgroundColor: fg, opacity: 0.18 }} />
        <span className="rounded-md" style={{ backgroundColor: fg, opacity: 0.12 }} />
        <span className="col-span-2 rounded-md" style={{ backgroundColor: fg, opacity: 0.08 }} />
      </div>
    );
  }

  if (style === "editorial") {
    return (
      <div className="grid h-full grid-cols-2 gap-1 p-2" style={{ backgroundColor: bg }}>
        <div className="flex flex-col justify-center gap-1">
          <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: accent }} />
          {line("90%", fg, 0.85)}
          {line("70%", fg, 0.85)}
          {line("50%", fg, 0.4)}
        </div>
        <div className="rounded-sm" style={{ backgroundColor: accent, opacity: 0.25 }} />
      </div>
    );
  }

  // commerce
  return (
    <div className="flex h-full gap-1 p-2" style={{ backgroundColor: bg }}>
      <span className="w-1/4 rounded-sm" style={{ backgroundColor: fg, opacity: 0.12 }} />
      <div className="grid flex-1 grid-cols-2 gap-1">
        <span className="relative rounded-sm" style={{ backgroundColor: fg, opacity: 0.15 }}>
          <span className="absolute left-0.5 top-0.5 h-1 w-3 rounded-[2px]" style={{ backgroundColor: accent }} />
        </span>
        <span className="rounded-sm" style={{ backgroundColor: fg, opacity: 0.15 }} />
        <span className="rounded-sm" style={{ backgroundColor: fg, opacity: 0.15 }} />
        <span className="rounded-sm" style={{ backgroundColor: fg, opacity: 0.15 }} />
      </div>
    </div>
  );
}

function ThemeCard({
  t,
  active,
  onSelect,
}: {
  t: ThemeOption;
  active: boolean;
  onSelect: () => void;
}) {
  const style = THEME_STYLE_OF[t.value];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex flex-col gap-2 rounded-lg border p-2 text-left transition-all",
        active
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      <span
        className="flex h-16 w-full shrink-0 items-stretch overflow-hidden rounded-md ring-1 ring-inset ring-black/10"
        style={{ backgroundColor: t.swatch[0] }}
      >
        <LayoutPreview style={style} swatch={t.swatch} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-sm font-medium">
          <span className="truncate">{t.label}</span>
          {active && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
          {t.description}
        </span>
      </span>
    </button>
  );
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = THEME_OPTIONS.find((t) => t.value === value) ?? THEME_OPTIONS[0];
  const currentStyle = THEME_STYLE_OF[current.value];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-md border bg-background px-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        title="Theme Hub: выбрать тему и архитектуру страницы"
      >
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ring-black/10"
          style={{ backgroundColor: current.swatch[1] }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: current.swatch[0] }}
          />
        </span>
        <span className="hidden max-w-36 truncate sm:inline">{current.label}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-[min(94vw,30rem)] overflow-hidden rounded-xl border bg-card shadow-xl md:w-[30rem]">
            <div className="flex items-center gap-2 border-b px-3 py-2.5">
              <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Theme Hub</p>
              <span className="ml-auto text-xs text-muted-foreground">
                {THEME_OPTIONS.length} тем · 4 архитектуры
              </span>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-3">
              {STYLE_ORDER.map((styleId) => {
                const meta = THEME_STYLES[styleId];
                const themes = THEME_OPTIONS.filter((t) => THEME_STYLE_OF[t.value] === styleId);
                const isActiveStyle = styleId === currentStyle;
                return (
                  <div key={styleId} className="mb-4 last:mb-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          isActiveStyle
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {themes.length} тем
                      </span>
                    </div>
                    <p className="mb-2 text-[11px] leading-snug text-muted-foreground">
                      {meta.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {themes.map((t) => (
                        <ThemeCard
                          key={t.value}
                          t={t}
                          active={t.value === value}
                          onSelect={() => {
                            onChange(t.value);
                            setOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5 border-t bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
              <Palette className="h-3.5 w-3.5 shrink-0" />
              Тема меняет не только цвета: типографику, раскладку секций и анимации.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
