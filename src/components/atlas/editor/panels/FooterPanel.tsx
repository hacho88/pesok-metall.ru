"use client";

import { useEditorStore } from "../editor-store";
import { Plus, Trash2 } from "lucide-react";

export function FooterPanel() {
  const store = useEditorStore();
  if (!store.config) return null;
  const f = store.config.footer;

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold text-sm text-slate-700">Футер</h3>

      <div>
        <label className="text-xs font-medium block mb-1 text-slate-600">Реквизиты</label>
        <input type="text" className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm" value={f.requisites} onChange={(e) => store.updateFooter({ requisites: e.target.value })} />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1 text-slate-600">Копирайт</label>
        <input type="text" className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm" value={f.copyright} onChange={(e) => store.updateFooter({ copyright: e.target.value })} />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={f.showZones} onChange={(e) => store.updateFooter({ showZones: e.target.checked })} style={{ accentColor: "#FF6A00" }} />
        <span className="text-sm">Показывать зоны доставки</span>
      </label>

      <div className="border-t border-slate-100 pt-3">
        <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Колонки</h4>
        <div className="space-y-2">
          {f.columns.map((col, ci) => (
            <div key={ci} className="p-2 rounded border border-slate-200">
              <div className="flex items-center gap-1 mb-1">
                <input className="flex-1 px-2 py-1 rounded border border-slate-200 text-sm font-medium" value={col.title} onChange={(e) => {
                  const columns = [...f.columns]; columns[ci] = { ...col, title: e.target.value }; store.updateFooter({ columns });
                }} />
                <button className="text-slate-400 hover:text-red-500" onClick={() => store.updateFooter({ columns: f.columns.filter((_, j) => j !== ci) })}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-1">
                {col.links.map((link, li) => (
                  <div key={li} className="flex gap-1">
                    <input className="flex-1 px-1.5 py-1 rounded border border-slate-200 text-xs" value={link.label} placeholder="Название" onChange={(e) => {
                      const columns = [...f.columns]; columns[ci].links[li] = { ...link, label: e.target.value }; store.updateFooter({ columns });
                    }} />
                    <input className="w-20 px-1.5 py-1 rounded border border-slate-200 text-xs" value={link.href} placeholder="/shop" onChange={(e) => {
                      const columns = [...f.columns]; columns[ci].links[li] = { ...link, href: e.target.value }; store.updateFooter({ columns });
                    }} />
                    <button className="text-slate-400 hover:text-red-500" onClick={() => {
                      const columns = [...f.columns]; columns[ci] = { ...col, links: col.links.filter((_, j) => j !== li) }; store.updateFooter({ columns });
                    }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button className="flex items-center gap-1 text-xs text-orange-600" onClick={() => {
                  const columns = [...f.columns]; columns[ci] = { ...col, links: [...col.links, { label: "", href: "/shop", children: [] }] }; store.updateFooter({ columns });
                }}>
                  <Plus size={12} /> Ссылка
                </button>
              </div>
            </div>
          ))}
          <button className="flex items-center gap-1 text-xs text-orange-600" onClick={() => store.updateFooter({ columns: [...f.columns, { title: "Новая колонка", links: [] }] })}>
            <Plus size={14} /> Добавить колонку
          </button>
        </div>
      </div>
    </div>
  );
}
