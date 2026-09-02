"use client";

import { useEditorStore } from "../editor-store";
import { getSectionComponent, getAllSections } from "../../sections";
import { GripVertical, Eye, EyeOff, Trash2, Copy, Plus } from "lucide-react";
import { nanoid } from "nanoid";
import type { Section } from "@/lib/atlas/config-schema";

export function SectionsPanel() {
  const store = useEditorStore();
  if (!store.config) return null;

  const sections = store.activePage === "home" ? store.config.pages.home.sections :
    store.activePage === "product" ? store.config.pages.product.sections :
    store.activePage === "search" ? store.config.pages.search.sectionsAfter :
    store.activePage === "cart" ? store.config.pages.cart.sectionsAfter : [];

  const all = getAllSections();

  const addSection = (type: string) => {
    const newSection: Section = {
      id: `${type}-${nanoid(6)}`,
      type: type as any,
      props: {},
      settings: { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
    };
    store.addSection(newSection);
  };

  return (
    <div className="p-4">
      <h3 className="font-bold text-sm mb-3 text-slate-700">Секции страницы: {store.activePage}</h3>

      {/* Current sections list */}
      <div className="space-y-1 mb-4">
        {sections.map((section, i) => {
          const entry = getSectionComponent(section.type);
          const isSelected = store.selectedSectionId === section.id;
          return (
            <div
              key={section.id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-orange-50 border border-orange-200" : "hover:bg-slate-50 border border-transparent"}`}
              onClick={() => store.selectSection(section.id)}
            >
              <GripVertical size={14} className="text-slate-300" />
              <span className="flex-1 text-sm font-medium truncate">{entry?.label ?? section.type}</span>
              {(!section.settings.visibility.desktop || !section.settings.visibility.mobile) && (
                <EyeOff size={14} className="text-slate-400" />
              )}
              <button className="text-slate-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); store.removeSection(section.id); }}>
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
        {sections.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400">Нет секций. Добавьте ниже.</div>
        )}
      </div>

      {/* Add section */}
      <div className="border-t border-slate-100 pt-3">
        <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Добавить секцию</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {all.map((s) => (
            <button
              key={s.type}
              className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-left"
              onClick={() => addSection(s.type)}
            >
              <Plus size={14} className="text-slate-400" />
              <span className="text-xs font-medium truncate">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
