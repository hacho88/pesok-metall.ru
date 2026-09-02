"use client";

import { useEditorStore } from "../editor-store";
import { Plus, Trash2 } from "lucide-react";

export function HeaderPanel() {
  const store = useEditorStore();
  if (!store.config) return null;
  const h = store.config.header;

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold text-sm text-slate-700">Шапка сайта</h3>

      <TextField label="Логотип (текст)" value={h.logoText} onChange={(v) => store.updateHeader({ logoText: v })} />
      <TextField label="Email" value={h.email} onChange={(v) => store.updateHeader({ email: v })} />
      <TextField label="Часы работы" value={h.workHours} onChange={(v) => store.updateHeader({ workHours: v })} />
      <TextField label="Placeholder поиска" value={h.searchPlaceholder} onChange={(v) => store.updateHeader({ searchPlaceholder: v })} />

      <div>
        <label className="text-xs font-medium block mb-1 text-slate-600">Телефоны</label>
        <div className="space-y-1">
          {h.phones.map((phone, i) => (
            <div key={i} className="flex gap-1">
              <input className="flex-1 px-2 py-1.5 rounded border border-slate-200 text-sm" value={phone} onChange={(e) => {
                const phones = [...h.phones]; phones[i] = e.target.value; store.updateHeader({ phones });
              }} />
              <button className="text-slate-400 hover:text-red-500 p-1" onClick={() => store.updateHeader({ phones: h.phones.filter((_, j) => j !== i) })}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="flex items-center gap-1 text-xs text-orange-600" onClick={() => store.updateHeader({ phones: [...h.phones, ""] })}>
            <Plus size={14} /> Добавить телефон
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium block mb-1 text-slate-600">Меню</label>
        <div className="space-y-1">
          {h.menu.map((item, i) => (
            <div key={i} className="flex gap-1">
              <input className="flex-1 px-2 py-1.5 rounded border border-slate-200 text-sm" value={item.label} placeholder="Название" onChange={(e) => {
                const menu = [...h.menu]; menu[i] = { ...menu[i], label: e.target.value }; store.updateHeader({ menu });
              }} />
              <input className="w-24 px-2 py-1.5 rounded border border-slate-200 text-sm" value={item.href} placeholder="/shop" onChange={(e) => {
                const menu = [...h.menu]; menu[i] = { ...menu[i], href: e.target.value }; store.updateHeader({ menu });
              }} />
              <button className="text-slate-400 hover:text-red-500 p-1" onClick={() => store.updateHeader({ menu: h.menu.filter((_, j) => j !== i) })}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="flex items-center gap-1 text-xs text-orange-600" onClick={() => store.updateHeader({ menu: [...h.menu, { label: "", href: "/shop", children: [] }] })}>
            <Plus size={14} /> Добавить пункт
          </button>
        </div>
      </div>

      <ToggleField label="Показывать корзину" value={h.showCart} onChange={(v) => store.updateHeader({ showCart: v })} />
      <ToggleField label="Показывать выбор города" value={h.showCitySelector} onChange={(v) => store.updateHeader({ showCitySelector: v })} />
      <ToggleField label="Верхняя полоса" value={h.topStrip.enabled} onChange={(v) => store.updateHeader({ topStrip: { ...h.topStrip, enabled: v } })} />
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium block mb-1 text-slate-600">{label}</span>
      <input type="text" className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} style={{ accentColor: "#FF6A00" }} />
      <span className="text-sm">{label}</span>
    </label>
  );
}
