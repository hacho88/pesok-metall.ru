"use client";

import { useState, useEffect } from "react";
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Eye, EyeOff, Plus } from "lucide-react";
import { useEditorStore } from "./editor-store";
import { AtlasTokensProvider } from "../tokens/AtlasTokensProvider";
import { SectionShell } from "../renderer/SectionShell";
import { getSectionComponent, getAllSections } from "../sections";
import type { Section } from "@/lib/atlas/config-schema";
import { nanoid } from "nanoid";

export function EditorCanvas() {
  const store = useEditorStore();
  const [resolved, setResolved] = useState<Record<string, unknown>>({});
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sections: Section[] = store.activePage === "home" ? (store.config?.pages.home.sections ?? []) :
    store.activePage === "product" ? (store.config?.pages.product.sections ?? []) :
    store.activePage === "search" ? (store.config?.pages.search.sectionsAfter ?? []) :
    store.activePage === "cart" ? (store.config?.pages.cart.sectionsAfter ?? []) :
    [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Resolve section data
  useEffect(() => {
    if (sections.length === 0) {
      setResolved({});
      return;
    }
    (async () => {
      try {
        const resp = await fetch("/api/atlas/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections: sections }),
        });
        if (resp.ok) {
          const data = await resp.json();
          setResolved(data.resolved);
        }
      } catch {}
    })();
  }, [JSON.stringify(sections.map((s) => s.type))]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    store.reorderSections(oldIndex, newIndex);
  };

  const addSection = (type: string) => {
    const entry = getSectionComponent(type);
    if (!entry) return;
    const newSection: Section = {
      id: `${type}-${nanoid(6)}`,
      type: type as any,
      props: {},
      settings: { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
    };
    store.addSection(newSection);
    setShowAddMenu(false);
  };

  if (!store.config) return null;

  return (
    <div className="min-h-full">
      {/* Atlas preview wrapper */}
      <AtlasTokensProvider tokens={store.config.tokens}>
        <div style={{ minHeight: "100%" }}>
          {/* Fake header preview */}
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
            <div className="font-bold text-lg" style={{ color: "var(--atlas-text)" }}>{store.config.header.logoText}</div>
            <div className="flex-1 h-10 rounded-lg" style={{ background: "var(--atlas-surface-2)" }} />
            <div className="w-24 h-8 rounded-lg" style={{ background: "var(--atlas-primary)" }} />
          </div>

          {/* Sections */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section, index) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  index={index}
                  total={sections.length}
                  data={resolved[section.id]}
                  isSelected={store.selectedSectionId === section.id}
                  onSelect={() => store.selectSection(section.id)}
                  onRemove={() => store.removeSection(section.id)}
                  onDuplicate={() => store.duplicateSection(section.id)}
                  onMoveUp={() => store.moveSection(section.id, "up")}
                  onMoveDown={() => store.moveSection(section.id, "down")}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add section button */}
          <div className="p-4 flex justify-center">
            {showAddMenu ? (
              <AddSectionMenu onAdd={addSection} onClose={() => setShowAddMenu(false)} />
            ) : (
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
                onClick={() => setShowAddMenu(true)}
              >
                <Plus size={18} /> Р”РѕР±Р°РІРёС‚СЊ СЃРµРєС†РёСЋ
              </button>
            )}
          </div>
        </div>
      </AtlasTokensProvider>
    </div>
  );
}

function SortableSection({
  section, index, total, data, isSelected, onSelect, onRemove, onDuplicate, onMoveUp, onMoveDown,
}: {
  section: Section;
  index: number;
  total: number;
  data: unknown;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const entry = getSectionComponent(section.type);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hidden = !section.settings.visibility.desktop || !section.settings.visibility.tablet || !section.settings.visibility.mobile;

  return (
    <div ref={setNodeRef} style={style} className="relative group" onClick={onSelect}>
      {/* Section toolbar (overlay) */}
      <div
        className={`absolute left-0 top-0 z-20 flex items-center gap-1 px-2 py-1 rounded-br-lg transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        style={{ background: isSelected ? "var(--atlas-primary)" : "rgba(0,0,0,0.6)" }}
      >
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-white p-0.5" onClick={(e) => e.stopPropagation()}>
          <GripVertical size={16} />
        </button>
        <span className="text-xs text-white font-medium px-1">{entry?.label ?? section.type}</span>
        <div className="w-px h-4 bg-white/30 mx-1" />
        <button className="text-white p-0.5 hover:bg-white/20 rounded" onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={index === 0}>
          <ChevronUp size={14} />
        </button>
        <button className="text-white p-0.5 hover:bg-white/20 rounded" onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={index === total - 1}>
          <ChevronDown size={14} />
        </button>
        <button className="text-white p-0.5 hover:bg-white/20 rounded" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
          <Copy size={14} />
        </button>
        <button className="text-white p-0.5 hover:bg-red-400 rounded" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
          <Trash2 size={14} />
        </button>
        {hidden && <EyeOff size={14} className="text-white/60" />}
      </div>

      {/* Selection border */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all ${isSelected ? "ring-2" : "ring-0 group-hover:ring-1"}`}
        style={{
          boxShadow: isSelected ? `inset 0 0 0 2px var(--atlas-primary)` : "group-hover:inset 0 0 0 1px rgba(0,0,0,0.15)",
        }}
      />

      {/* Render section */}
      <SectionShell settings={section.settings}>
        {entry ? (
          <entry.Component props={section.props} data={data} />
        ) : (
          <div className="p-4 bg-slate-100 rounded text-sm text-slate-500">
            РќРµРёР·РІРµСЃС‚РЅР°СЏ СЃРµРєС†РёСЏ: {section.type}
          </div>
        )}
      </SectionShell>
    </div>
  );
}

function AddSectionMenu({ onAdd, onClose }: { onAdd: (type: string) => void; onClose: () => void }) {
  const all = getAllSections();
  const groups = ["hero", "catalog", "trust", "content", "tools", "product"] as const;
  const groupLabels: Record<string, string> = {
    hero: "Hero", catalog: "РљР°С‚Р°Р»РѕРі", trust: "Р”РѕРІРµСЂРёРµ", content: "РљРѕРЅС‚РµРЅС‚", tools: "РРЅСЃС‚СЂСѓРјРµРЅС‚С‹", product: "РўРѕРІР°СЂ",
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Р”РѕР±Р°РІРёС‚СЊ СЃРµРєС†РёСЋ</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">вњ•</button>
      </div>
      {groups.map((group) => (
        <div key={group} className="mb-3">
          <div className="text-xs font-semibold uppercase text-slate-400 mb-1">{groupLabels[group]}</div>
          <div className="grid grid-cols-3 gap-2">
            {all.filter((s) => s.group === group).map((s) => (
              <button
                key={s.type}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-slate-200 hover:border-orange-400 hover:bg-orange-50 transition-colors text-center"
                onClick={() => onAdd(s.type)}
              >
                <span className="text-xs font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

