"use client";

import { useMemo, useState } from "react";
import { FolderPlus, Search } from "lucide-react";
import { CatalogTree } from "@/components/admin/CatalogTree";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewProductDialog } from "./NewProductDialog";
import { CategoryDialog, type EditableCategory } from "./CategoryDialog";

interface TreeItem {
  id: string;
  name: string;
  type: "category" | "product";
  children?: TreeItem[];
}

/** Фильтр дерева: категория остаётся, если совпадает сама или любой потомок */
function filterTree(items: TreeItem[], q: string): TreeItem[] {
  const query = q.trim().toLowerCase();
  if (!query) return items;
  const result: TreeItem[] = [];
  for (const item of items) {
    if (item.type === "product") {
      if (item.name.toLowerCase().includes(query)) result.push(item);
    } else {
      const matchedChildren = item.children ? filterTree(item.children, query) : [];
      if (item.name.toLowerCase().includes(query) || matchedChildren.length > 0) {
        result.push({ ...item, children: matchedChildren });
      }
    }
  }
  return result;
}

export function CatalogTreeWrapper({
  initialItems,
  categories,
}: {
  initialItems: any[];
  categories: EditableCategory[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [addCategoryId, setAddCategoryId] = useState<string | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

  const items = useMemo(() => filterTree(initialItems, query), [initialItems, query]);
  const editCategory = categories.find((c) => c.id === editCategoryId) ?? null;

  const handleMove = async (itemId: string, newCategoryId: string) => {
    try {
      const res = await fetch(`/api/products/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: newCategoryId }),
      });
      if (res.ok) {
        // Refresh page to show updated tree
        window.location.reload();
      }
    } catch (error) {
      console.error("Move Error:", error);
    }
  };

  // Sync with global state or URL in real app
  const handleSelect = (item: any) => {
    setSelectedId(item.id);
    if (item.type === "product") {
      window.dispatchEvent(new CustomEvent("product-selected", { detail: item.id }));
    }
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex shrink-0 gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск в каталоге..."
            className="pl-9 h-11 rounded-xl border-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          className="h-11 shrink-0 rounded-xl bg-primary font-black shadow-lg shadow-primary/20"
          onClick={() => setCreateCategoryOpen(true)}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Категория
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.length > 0 ? (
          <CatalogTree
            items={items}
            selectedId={selectedId}
            onSelect={handleSelect}
            onMove={handleMove}
            onAddProduct={(categoryId) => setAddCategoryId(categoryId)}
            onEditCategory={(categoryId) => setEditCategoryId(categoryId)}
          />
        ) : (
          <p className="py-10 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground/40">
            Ничего не найдено
          </p>
        )}
      </div>

      {/* Диалог добавления товара в категорию (с быстрым «+ Добавить ещё») */}
      <NewProductDialog
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          parentName: c.parentName,
        }))}
        open={addCategoryId !== null}
        onOpenChange={(v) => {
          if (!v) setAddCategoryId(null);
        }}
        presetCategoryId={addCategoryId ?? undefined}
      />

      {/* Диалог создания/редактирования категории */}
      <CategoryDialog
        category={createCategoryOpen ? null : editCategory}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          parentName: c.parentName,
        }))}
        open={createCategoryOpen || editCategoryId !== null}
        onOpenChange={(v) => {
          if (!v) {
            setCreateCategoryOpen(false);
            setEditCategoryId(null);
          }
        }}
        onSaved={() => window.location.reload()}
      />
    </div>
  );
}
