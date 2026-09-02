"use client";

import { useEditorStore } from "../editor-store";

export function PagesPanel() {
  const store = useEditorStore();
  if (!store.config) return null;

  const pages = [
    { key: "home", label: "Главная", icon: "🏠" },
    { key: "category", label: "Категория", icon: "📂" },
    { key: "product", label: "Товар", icon: "📦" },
    { key: "search", label: "Поиск", icon: "🔍" },
    { key: "cart", label: "Корзина", icon: "🛒" },
  ];

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold text-sm text-slate-700">Страницы</h3>
      <p className="text-xs text-slate-500">Выберите страницу для редактирования секций</p>

      <div className="space-y-1">
        {pages.map((page) => (
          <button
            key={page.key}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors ${store.activePage === page.key ? "bg-orange-50 text-orange-700 border border-orange-200" : "hover:bg-slate-50 border border-transparent"}`}
            onClick={() => store.setActivePage(page.key as any)}
          >
            <span>{page.icon}</span>
            {page.label}
            {store.activePage === page.key && <span className="ml-auto text-xs">●</span>}
          </button>
        ))}
      </div>

      {/* Page-specific settings */}
      {store.activePage === "home" && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <h4 className="text-xs font-semibold uppercase text-slate-400">Настройки главной</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={store.config.pages.home.sidebar} onChange={(e) => {
              const config = { ...store.config!, pages: { ...store.config!.pages, home: { ...store.config!.pages.home, sidebar: e.target.checked } } };
              useEditorStore.setState({ config, dirty: true });
            }} style={{ accentColor: "#FF6A00" }} />
            <span className="text-sm">Показывать сайдбар</span>
          </label>
        </div>
      )}

      {store.activePage === "category" && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <h4 className="text-xs font-semibold uppercase text-slate-400">Настройки категории</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={store.config.pages.category.sidebar} onChange={(e) => {
              const config = { ...store.config!, pages: { ...store.config!.pages, category: { ...store.config!.pages.category, sidebar: e.target.checked } } };
              useEditorStore.setState({ config, dirty: true });
            }} style={{ accentColor: "#FF6A00" }} />
            <span className="text-sm">Показывать сайдбар</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={store.config.pages.category.showSubcategoryTiles} onChange={(e) => {
              const config = { ...store.config!, pages: { ...store.config!.pages, category: { ...store.config!.pages.category, showSubcategoryTiles: e.target.checked } } };
              useEditorStore.setState({ config, dirty: true });
            }} style={{ accentColor: "#FF6A00" }} />
            <span className="text-sm">Плитки подкатегорий</span>
          </label>
          <div>
            <label className="text-xs font-medium block mb-1 text-slate-600">Товаров на странице</label>
            <input type="number" className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm" value={store.config.pages.category.perPage} onChange={(e) => {
              const config = { ...store.config!, pages: { ...store.config!.pages, category: { ...store.config!.pages.category, perPage: Number(e.target.value) } } };
              useEditorStore.setState({ config, dirty: true });
            }} />
          </div>
        </div>
      )}

      {store.activePage === "product" && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <h4 className="text-xs font-semibold uppercase text-slate-400">Настройки товара</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={store.config.pages.product.buyBox.showOneClick} onChange={(e) => {
              const config = { ...store.config!, pages: { ...store.config!.pages, product: { ...store.config!.pages.product, buyBox: { ...store.config!.pages.product.buyBox, showOneClick: e.target.checked } } } };
              useEditorStore.setState({ config, dirty: true });
            }} style={{ accentColor: "#FF6A00" }} />
            <span className="text-sm">Купить в 1 клик</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={store.config.pages.product.buyBox.showRequestQuote} onChange={(e) => {
              const config = { ...store.config!, pages: { ...store.config!.pages, product: { ...store.config!.pages.product, buyBox: { ...store.config!.pages.product.buyBox, showRequestQuote: e.target.checked } } } };
              useEditorStore.setState({ config, dirty: true });
            }} style={{ accentColor: "#FF6A00" }} />
            <span className="text-sm">Запросить КП</span>
          </label>
        </div>
      )}
    </div>
  );
}
