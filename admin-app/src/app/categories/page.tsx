"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, FolderTree, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type AdminCategory,
  type AdminSection,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface TreeNode extends AdminCategory {
  children: TreeNode[];
  depth: number;
}

function buildTree(flat: AdminCategory[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  flat.forEach((c) => map.set(c.id, { ...c, children: [], depth: 0 }));
  const roots: TreeNode[] = [];
  flat.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const setDepth = (nodes: TreeNode[], d: number) => {
    nodes.forEach((n) => {
      n.depth = d;
      setDepth(n.children, d + 1);
    });
  };
  setDepth(roots, 0);
  return roots;
}

function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  const walk = (list: TreeNode[]) => {
    list.forEach((n) => {
      result.push(n);
      if (n.children.length > 0) walk(n.children);
    });
  };
  walk(nodes);
  return result;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [sections, setSections] = useState<AdminSection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const tree = useMemo(() => {
    if (!categories) return [];
    return buildTree(categories);
  }, [categories]);

  const flatTree = useMemo(() => flattenTree(tree), [tree]);

  // Автоматически раскрываем корневые категории
  useEffect(() => {
    if (tree.length > 0 && expanded.size === 0) {
      setExpanded(new Set(tree.map((n) => n.id)));
    }
  }, [tree, expanded.size]);

  const parentOptions = useMemo(() => {
    if (!categories) return [];
    // При редактировании исключаем саму категорию и её потомков из списка возможных родителей
    const excludeIds = new Set<string>();
    if (editing) {
      excludeIds.add(editing.id);
      const addDescendants = (id: string) => {
        categories.filter((c) => c.parentId === id).forEach((c) => {
          excludeIds.add(c.id);
          addDescendants(c.id);
        });
      };
      addDescendants(editing.id);
    }
    return categories.filter((c) => !excludeIds.has(c.id));
  }, [categories, editing]);

  const load = useCallback(async () => {
    try {
      const data = await listCategories();
      setCategories(data.categories);
      setSections(data.sections ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setName("");
    setParentId("");
    setSectionId("");
    setSortOrder(0);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(c: AdminCategory) {
    setEditing(c);
    setName(c.name);
    setSlug(c.slug);
    setParentId(c.parentId || "");
    setSectionId(c.sectionId || "");
    setSortOrder(c.sortOrder);
    setFormError(null);
    setModalOpen(true);
  }

  async function submit() {
    if (!name.trim()) {
      setFormError("Введите название");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await updateCategory(editing.id, {
          name: name.trim(),
          parentId: parentId || null,
          slug: slug.trim() || undefined,
          sectionId: sectionId || null,
          sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        });
      } else {
        await createCategory({
          name: name.trim(),
          parentId: parentId || null,
          sectionId: sectionId || null,
          sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        });
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: AdminCategory) {
    if (!confirm(`Удалить категорию «${c.name}»?`)) return;
    try {
      await deleteCategory(c.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <FolderTree className="h-6 w-6 text-primary" />
            Категории
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Разделы каталога основного сайта
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Добавить категорию
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!categories && !error && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          Загрузка…
        </div>
      )}

      {categories && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Секция</th>
                <th className="px-4 py-3 font-medium">Сорт.</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 text-right font-medium">Товаров</th>
                <th className="px-4 py-3 text-right font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {flatTree.map((c) => {
                const hasChildren = c.children.length > 0;
                const isExpanded = expanded.has(c.id);
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2" style={{ paddingLeft: `${c.depth * 24}px` }}>
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => setExpanded((prev) => {
                              const next = new Set(prev);
                              if (next.has(c.id)) next.delete(c.id);
                              else next.add(c.id);
                              return next;
                            })}
                            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent"
                          >
                            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                          </button>
                        ) : (
                          <span className="w-5" />
                        )}
                        {c.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.sectionName ?? <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.sortOrder}</td>
                    <td className="px-4 py-3 text-muted-foreground">/{c.slug}</td>
                    <td className="px-4 py-3 text-right">{c.productCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)} title="Редактировать">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(c)} title="Удалить">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editing ? "Редактировать категорию" : "Новая категория"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Название *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Арматура"
                  autoFocus
                />
              </div>
              {editing && (
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="armatura"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Родительская категория</Label>
                <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
                  <option value="">— корневая —</option>
                  {parentOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Секция каталога</Label>
                <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                  <option value="">— без секции —</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Порядок сортировки</Label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">Чем меньше число — тем выше в списке</p>
              </div>
              {formError && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                  {formError}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
                Отмена
              </Button>
              <Button onClick={submit} disabled={saving}>
                {saving && <Loader2 className="animate-spin" />}
                {editing ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
