"use client";

import type { ReactNode } from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
    />
  );
}

export function Select<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-primary"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-primary"
      />
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-lg border border-border bg-background p-0.5"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-border bg-background px-2 font-mono text-xs uppercase outline-none focus:border-primary"
        />
      </div>
    </Field>
  );
}

export function SpacingEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: { top: number; right: number; bottom: number; left: number };
  onChange: (v: { top: number; right: number; bottom: number; left: number }) => void;
}) {
  const cell = (key: "top" | "right" | "bottom" | "left", label: string) => (
    <label className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
      <input
        type="number"
        min={0}
        max={200}
        value={value[key]}
        onChange={(e) => onChange({ ...value, [key]: Number(e.target.value) || 0 })}
        className="h-8 w-full rounded-md border border-border bg-background px-1.5 text-center text-xs tabular-nums outline-none focus:border-primary"
      />
    </label>
  );
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {cell("top", "Т")}
        {cell("right", "П")}
        {cell("bottom", "Н")}
        {cell("left", "Л")}
      </div>
    </div>
  );
}

export function UploadButton({
  accept = "image/*",
  label = "Загрузить файл",
  onUploaded,
}: {
  accept?: string;
  label?: string;
  onUploaded: (url: string) => void;
}) {
  return (
    <label className="inline-flex h-9 shrink-0 cursor-pointer items-center rounded-lg border border-dashed border-primary/50 bg-primary/5 px-3 text-xs font-bold text-primary transition-colors hover:bg-primary/10">
      {label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const fd = new FormData();
          fd.append("file", file);
          try {
            const res = await fetch("/api/atlas/media", { method: "POST", body: fd });
            const data = await res.json();
            if (data?.url) onUploaded(data.url as string);
          } finally {
            e.target.value = "";
          }
        }}
      />
    </label>
  );
}
