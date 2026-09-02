"use client";

import { useEditorStore } from "../editor-store";
import { PALETTE_PRESETS } from "../../tokens/AtlasTokensProvider";
import { Check } from "lucide-react";

export function TokensPanel() {
  const store = useEditorStore();
  if (!store.config) return null;
  const tokens = store.config.tokens;

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold text-sm text-slate-700">Дизайн-токены</h3>

      {/* Palette presets */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Палитры</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PALETTE_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className={`p-2 rounded-lg border-2 transition-colors ${tokens.preset === key ? "border-orange-400" : "border-slate-200"}`}
              onClick={() => store.updateTokens({ preset: key, ...preset } as any)}
            >
              <div className="flex gap-1 mb-1">
                <div className="w-5 h-5 rounded" style={{ background: preset.primary }} />
                <div className="w-5 h-5 rounded" style={{ background: preset.secondary }} />
                <div className="w-5 h-5 rounded" style={{ background: preset.accent }} />
              </div>
              <span className="text-xs font-medium">{key}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase text-slate-400">Цвета</h4>
        <ColorField label="Primary" value={tokens.primary} onChange={(v) => store.updateTokens({ primary: v })} />
        <ColorField label="Secondary" value={tokens.secondary} onChange={(v) => store.updateTokens({ secondary: v })} />
        <ColorField label="Accent" value={tokens.accent} onChange={(v) => store.updateTokens({ accent: v })} />
        <ColorField label="Фон" value={tokens.bg} onChange={(v) => store.updateTokens({ bg: v })} />
        <ColorField label="Surface" value={tokens.surface} onChange={(v) => store.updateTokens({ surface: v })} />
        <ColorField label="Surface 2" value={tokens.surface2} onChange={(v) => store.updateTokens({ surface2: v })} />
        <ColorField label="Текст" value={tokens.text} onChange={(v) => store.updateTokens({ text: v })} />
        <ColorField label="Текст (muted)" value={tokens.textMuted} onChange={(v) => store.updateTokens({ textMuted: v })} />
        <ColorField label="Граница" value={tokens.border} onChange={(v) => store.updateTokens({ border: v })} />
      </div>

      {/* Radius */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Скругление</h4>
        <div className="flex gap-2">
          {(["sm", "md", "lg", "xl"] as const).map((r) => (
            <button
              key={r}
              className={`px-3 py-1.5 rounded text-xs font-medium ${tokens.radius === r ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"}`}
              onClick={() => store.updateTokens({ radius: r })}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Fonts */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase text-slate-400">Шрифты</h4>
        <FontField label="Заголовки" value={tokens.fontHeading} onChange={(v) => store.updateTokens({ fontHeading: v })} />
        <FontField label="Текст" value={tokens.fontBody} onChange={(v) => store.updateTokens({ fontBody: v })} />
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
      <span className="text-xs font-medium flex-1">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-20 px-1.5 py-1 rounded border border-slate-200 text-xs font-mono" />
    </div>
  );
}

function FontField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium block mb-1 text-slate-600">{label}</span>
      <select className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="Manrope">Manrope</option>
        <option value="Inter">Inter</option>
        <option value="Space Grotesk">Space Grotesk</option>
        <option value="Roboto">Roboto</option>
      </select>
    </label>
  );
}
