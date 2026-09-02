"use client";

import { useEffect, useState } from "react";
import {
  Layout, Palette, Settings, Eye, Save, Upload, Undo, Redo, RotateCcw,
  Sparkles, History, PanelLeft,
  Grid3x3, FileText, ChevronDown, Check, ExternalLink, PanelTop, PanelBottom,
} from "lucide-react";
import { useEditorStore } from "./editor-store";
import { EditorCanvas } from "./EditorCanvas";
import { SectionsPanel } from "./panels/SectionsPanel";
import { InspectorPanel } from "./panels/InspectorPanel";
import { TokensPanel } from "./panels/TokensPanel";
import { HeaderPanel } from "./panels/HeaderPanel";
import { SidebarPanel } from "./panels/SidebarPanel";
import { FooterPanel } from "./panels/FooterPanel";
import { PagesPanel } from "./panels/PagesPanel";
import { AIPanel } from "./panels/AIPanel";
import { VersionsPanel } from "./panels/VersionsPanel";

export function AtlasEditor() {
  const store = useEditorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("/api/atlas/config");
        if (!resp.ok) throw new Error("Failed to load config");
        const data = await resp.json();
        store.setConfig(data.draft);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-slate-500">Загрузка редактора Atlas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-red-500">Ошибка: {error}</div>
      </div>
    );
  }

  if (!store.config) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-slate-500">Конфиг не найден</div>
      </div>
    );
  }

  const panelComponents: Record<string, React.ReactNode> = {
    sections: <SectionsPanel />,
    inspector: <InspectorPanel />,
    tokens: <TokensPanel />,
    header: <HeaderPanel />,
    sidebar: <SidebarPanel />,
    footer: <FooterPanel />,
    pages: <PagesPanel />,
    ai: <AIPanel />,
    versions: <VersionsPanel />,
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Top toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-bold">A</div>
          Atlas Editor
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Page selector */}
        <select
          value={store.activePage}
          onChange={(e) => store.setActivePage(e.target.value as any)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium bg-white"
        >
          <option value="home">Главная</option>
          <option value="category">Категория</option>
          <option value="product">Товар</option>
          <option value="search">Поиск</option>
          <option value="cart">Корзина</option>
        </select>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Undo/redo */}
        <button
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"
          onClick={store.undo}
          disabled={!store.canUndo()}
          title="Отменить"
        >
          <Undo size={18} />
        </button>
        <button
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"
          onClick={store.redo}
          disabled={!store.canRedo()}
          title="Повторить"
        >
          <Redo size={18} />
        </button>
        <button
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"
          onClick={store.reset}
          disabled={!store.dirty}
          title="Сбросить изменения"
        >
          <RotateCcw size={18} />
        </button>

        {store.dirty && (
          <span className="text-xs text-amber-600 font-medium ml-2">● Не сохранено</span>
        )}

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          <a
            href="/api/atlas/preview?target=/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50"
          >
            <Eye size={16} /> Предпросмотр
            <ExternalLink size={12} />
          </a>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50"
            onClick={() => store.save()}
            disabled={store.saving || !store.dirty}
          >
            <Save size={16} /> Сохранить
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
            onClick={() => setPublishModalOpen(true)}
            disabled={store.saving}
          >
            <Upload size={16} /> Опубликовать
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — tools */}
        <div className="w-12 bg-white border-r border-slate-200 flex flex-col items-center py-2 gap-1 shrink-0">
          <ToolButton icon={<Grid3x3 size={20} />} label="Секции" active={store.activePanel === "sections"} onClick={() => store.setActivePanel("sections")} />
          <ToolButton icon={<Settings size={20} />} label="Инспектор" active={store.activePanel === "inspector"} onClick={() => store.setActivePanel("inspector")} />
          <ToolButton icon={<Palette size={20} />} label="Дизайн" active={store.activePanel === "tokens"} onClick={() => store.setActivePanel("tokens")} />
          <ToolButton icon={<PanelTop size={20} />} label="Шапка" active={store.activePanel === "header"} onClick={() => store.setActivePanel("header")} />
          <ToolButton icon={<PanelLeft size={20} />} label="Сайдбар" active={store.activePanel === "sidebar"} onClick={() => store.setActivePanel("sidebar")} />
          <ToolButton icon={<PanelBottom size={20} />} label="Футер" active={store.activePanel === "footer"} onClick={() => store.setActivePanel("footer")} />
          <ToolButton icon={<Layout size={20} />} label="Страницы" active={store.activePanel === "pages"} onClick={() => store.setActivePanel("pages")} />
          <ToolButton icon={<Sparkles size={20} />} label="AI" active={store.activePanel === "ai"} onClick={() => store.setActivePanel("ai")} />
          <ToolButton icon={<History size={20} />} label="Версии" active={store.activePanel === "versions"} onClick={() => store.setActivePanel("versions")} />
        </div>

        {/* Panel content */}
        <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto shrink-0">
          {panelComponents[store.activePanel]}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto bg-slate-200">
          <EditorCanvas />
        </div>
      </div>

      {/* Publish modal */}
      {publishModalOpen && (
        <PublishModal
          onClose={() => setPublishModalOpen(false)}
          onPublish={async (note) => {
            await store.publish(note);
            setPublishModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ToolButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors group relative ${active ? "bg-orange-50 text-orange-600" : "text-slate-500 hover:bg-slate-100"}`}
      onClick={onClick}
      title={label}
    >
      {icon}
      <span className="absolute left-12 px-2 py-1 rounded bg-slate-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {label}
      </span>
    </button>
  );
}

function PublishModal({ onClose, onPublish }: { onClose: () => void; onPublish: (note: string) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    await onPublish(note);
    setPublishing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">Опубликовать изменения</h3>
        <p className="text-sm text-slate-600 mb-4">
          Опубликованные изменения сразу появятся на сайте. Текущая версия будет сохранена в истории.
        </p>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Примечание к версии (необязательно)"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mb-4"
        />
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50" onClick={onClose}>
            Отмена
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? "Публикация..." : "Опубликовать"}
          </button>
        </div>
      </div>
    </div>
  );
}
