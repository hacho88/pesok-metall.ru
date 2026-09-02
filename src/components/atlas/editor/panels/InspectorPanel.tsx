"use client";

import { useEditorStore } from "../editor-store";
import { getSectionComponent } from "../../sections";
import type { SectionSettings } from "@/lib/atlas/config-schema";
import { Sparkles } from "lucide-react";

export function InspectorPanel() {
  const store = useEditorStore();
  if (!store.config) return null;

  const sections = store.activePage === "home" ? store.config.pages.home.sections :
    store.activePage === "product" ? store.config.pages.product.sections :
    store.activePage === "search" ? store.config.pages.search.sectionsAfter :
    store.activePage === "cart" ? store.config.pages.cart.sectionsAfter : [];

  const section = sections.find((s) => s.id === store.selectedSectionId);

  if (!section) {
    return (
      <div className="p-4 text-center text-sm text-slate-400 mt-8">
        Выберите секцию на холсте, чтобы редактировать её свойства
      </div>
    );
  }

  const entry = getSectionComponent(section.type);
  const updateProps = (props: Record<string, unknown>) => {
    store.updateSection(section.id, { props: { ...section.props, ...props } });
  };
  const updateSettings = (settings: Partial<SectionSettings>) => {
    store.updateSection(section.id, { settings: { ...section.settings, ...settings } });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-bold text-sm text-slate-700">{entry?.label ?? section.type}</h3>
        <p className="text-xs text-slate-400 mt-0.5">ID: {section.id}</p>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase text-slate-400">Отступы</h4>
        <div className="grid grid-cols-2 gap-2">
          <SelectField label="Сверху" value={section.settings.paddingTop} onChange={(v) => updateSettings({ paddingTop: v as any })} options={[
            { value: "none", label: "Нет" }, { value: "sm", label: "Малый" }, { value: "md", label: "Средний" }, { value: "lg", label: "Большой" },
          ]} />
          <SelectField label="Снизу" value={section.settings.paddingBottom} onChange={(v) => updateSettings({ paddingBottom: v as any })} options={[
            { value: "none", label: "Нет" }, { value: "sm", label: "Малый" }, { value: "md", label: "Средний" }, { value: "lg", label: "Большой" },
          ]} />
        </div>

        <SelectField label="Фон" value={section.settings.background} onChange={(v) => updateSettings({ background: v as any })} options={[
          { value: "none", label: "По умолчанию" }, { value: "surface", label: "Белый" }, { value: "muted", label: "Серый" }, { value: "brand", label: "Тёмный" }, { value: "dark", label: "Чёрный" },
        ]} />

        <SelectField label="Контейнер" value={section.settings.container} onChange={(v) => updateSettings({ container: v as any })} options={[
          { value: "default", label: "Стандартный" }, { value: "wide", label: "Широкий" }, { value: "full", label: "На весь экран" },
        ]} />

        <div>
          <label className="text-xs font-medium block mb-1 text-slate-600">Видимость</label>
          <div className="flex gap-2">
            <ToggleChip label="Десктоп" active={section.settings.visibility.desktop} onChange={(v) => updateSettings({ visibility: { ...section.settings.visibility, desktop: v } })} />
            <ToggleChip label="Планшет" active={section.settings.visibility.tablet} onChange={(v) => updateSettings({ visibility: { ...section.settings.visibility, tablet: v } })} />
            <ToggleChip label="Мобильный" active={section.settings.visibility.mobile} onChange={(v) => updateSettings({ visibility: { ...section.settings.visibility, mobile: v } })} />
          </div>
        </div>
      </div>

      {/* Section-specific props */}
      <div className="border-t border-slate-100 pt-3">
        <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Содержимое</h4>
        <SectionPropsEditor section={section} updateProps={updateProps} />
      </div>

      {/* AI improve */}
      <button
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-purple-200 text-purple-600 text-sm font-medium hover:bg-purple-50"
        onClick={async () => {
          try {
            const resp = await fetch("/api/atlas/ai/improve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ section }),
            });
            if (resp.ok) {
              const data = await resp.json();
              if (data.props) updateProps(data.props);
            }
          } catch {}
        }}
      >
        <Sparkles size={16} /> Улучшить тексты с AI
      </button>
    </div>
  );
}

function SectionPropsEditor({ section, updateProps }: { section: any; updateProps: (props: Record<string, unknown>) => void }) {
  const props = section.props || {};
  const type = section.type;

  // Generic text fields based on section type
  const textFields: Record<string, { key: string; label: string; multiline?: boolean; type?: string; options?: string[] }[]> = {
    HeroSlider: [{ key: "autoplay", label: "Автопрокрутка", type: "boolean" }],
    PromoStrip: [],
    CategoryTiles: [{ key: "limit", label: "Количество", type: "number" }, { key: "variant", label: "Вариант", type: "select", options: ["grid", "list"] }],
    FeaturedProducts: [
      { key: "title", label: "Заголовок" },
      { key: "source", label: "Источник", type: "select", options: ["bestsellers", "newest", "onOrder", "category"] },
      { key: "limit", label: "Количество", type: "number" },
      { key: "variant", label: "Вид", type: "select", options: ["grid", "carousel"] },
    ],
    PriceBoard: [{ key: "title", label: "Заголовок" }],
    Advantages: [{ key: "variant", label: "Вариант", type: "select", options: ["cards", "list"] }],
    Calculator: [{ key: "title", label: "Заголовок" }],
    DeliveryZones: [{ key: "title", label: "Заголовок" }, { key: "limit", label: "Количество", type: "number" }],
    Steps: [{ key: "title", label: "Заголовок" }],
    BlogTeasers: [{ key: "title", label: "Заголовок" }, { key: "limit", label: "Количество", type: "number" }],
    Faq: [{ key: "title", label: "Заголовок" }],
    CtaBanner: [{ key: "title", label: "Заголовок" }, { key: "text", label: "Текст", multiline: true }, { key: "ctaLabel", label: "Текст кнопки" }],
    Contacts: [{ key: "title", label: "Заголовок" }, { key: "address", label: "Адрес" }, { key: "email", label: "Email" }, { key: "workHours", label: "Часы работы" }, { key: "mapUrl", label: "URL карты" }],
    RichText: [{ key: "title", label: "Заголовок" }, { key: "html", label: "HTML", multiline: true }],
    Spacer: [{ key: "height", label: "Высота (px)", type: "number" }],
    Divider: [{ key: "variant", label: "Вариант", type: "select", options: ["line", "dots"] }],
  };

  const fields = textFields[type] ?? [];

  return (
    <div className="space-y-2">
      {fields.map((field: any) => (
        <div key={field.key}>
          <label className="text-xs font-medium block mb-1 text-slate-600">{field.label}</label>
          {field.type === "select" ? (
            <select
              className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm"
              value={String(props[field.key] ?? "")}
              onChange={(e) => updateProps({ [field.key]: e.target.value })}
            >
              {field.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : field.type === "number" ? (
            <input
              type="number"
              className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm"
              value={Number(props[field.key] ?? 0)}
              onChange={(e) => updateProps({ [field.key]: Number(e.target.value) })}
            />
          ) : field.type === "boolean" ? (
            <input
              type="checkbox"
              checked={Boolean(props[field.key] ?? true)}
              onChange={(e) => updateProps({ [field.key]: e.target.checked })}
            />
          ) : field.multiline ? (
            <textarea
              className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm font-mono"
              rows={4}
              value={String(props[field.key] ?? "")}
              onChange={(e) => updateProps({ [field.key]: e.target.value })}
            />
          ) : (
            <input
              type="text"
              className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm"
              value={String(props[field.key] ?? "")}
              onChange={(e) => updateProps({ [field.key]: e.target.value })}
            />
          )}
        </div>
      ))}
      {fields.length === 0 && (
        <p className="text-xs text-slate-400">У этой секции нет редактируемых текстовых полей. Данные загружаются автоматически.</p>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="text-xs font-medium block mb-1 text-slate-600">{label}</span>
      <select className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </label>
  );
}

function ToggleChip({ label, active, onChange }: { label: string; active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`px-2 py-1 rounded text-xs font-medium ${active ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-400"}`}
      onClick={() => onChange(!active)}
    >
      {label}
    </button>
  );
}
