"use client";

import { useEditorStore } from "../editor-store";

export function SidebarPanel() {
  const store = useEditorStore();
  if (!store.config) return null;
  const s = store.config.sidebar;

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold text-sm text-slate-700">Сайдбар (дерево категорий)</h3>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={s.enabled} onChange={(e) => store.updateSidebar({ enabled: e.target.checked })} style={{ accentColor: "#FF6A00" }} />
        <span className="text-sm">Показывать сайдбар</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={s.showCounts} onChange={(e) => store.updateSidebar({ showCounts: e.target.checked })} style={{ accentColor: "#FF6A00" }} />
        <span className="text-sm">Показывать счётчики товаров</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={s.showSearch} onChange={(e) => store.updateSidebar({ showSearch: e.target.checked })} style={{ accentColor: "#FF6A00" }} />
        <span className="text-sm">Показывать поиск</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={s.groups} onChange={(e) => store.updateSidebar({ groups: e.target.checked })} style={{ accentColor: "#FF6A00" }} />
        <span className="text-sm">Группировать по типу</span>
      </label>

      <div className="border-t border-slate-100 pt-3">
        <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Promo-карта</h4>
        <label className="flex items-center gap-2 cursor-pointer mb-2">
          <input type="checkbox" checked={s.promoCard.enabled} onChange={(e) => store.updateSidebar({ promoCard: { ...s.promoCard, enabled: e.target.checked } })} style={{ accentColor: "#FF6A00" }} />
          <span className="text-sm">Показывать promo-карту</span>
        </label>
        <label className="block mb-2">
          <span className="text-xs font-medium block mb-1 text-slate-600">Заголовок</span>
          <input type="text" className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm" value={s.promoCard.title} onChange={(e) => store.updateSidebar({ promoCard: { ...s.promoCard, title: e.target.value } })} />
        </label>
        <label className="block mb-2">
          <span className="text-xs font-medium block mb-1 text-slate-600">Текст</span>
          <input type="text" className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm" value={s.promoCard.text} onChange={(e) => store.updateSidebar({ promoCard: { ...s.promoCard, text: e.target.value } })} />
        </label>
        <label className="block">
          <span className="text-xs font-medium block mb-1 text-slate-600">Ссылка</span>
          <input type="text" className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm" value={s.promoCard.href} onChange={(e) => store.updateSidebar({ promoCard: { ...s.promoCard, href: e.target.value } })} />
        </label>
      </div>
    </div>
  );
}
