"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  generateSeoDescription,
  listCategories,
  type AdminProduct,
  type AdminCategory,
  type ProductType,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { API_BASE } from "@/lib/api";

const TYPE_LABELS: Record<ProductType, string> = {
  METALL: "Металлопрокат",
  BAG_30KG: "Мешок 30 кг",
  BIG_BAG_1TON: "Биг-бэг 1 т",
  GENERAL_CONSTRUCTION: "Общестрой",
};

/** Превью фото товара: локальный файл приоритетнее внешнего URL */
function ProductThumb({ product }: { product: AdminProduct }) {
  const src = product.imageLocal
    ? `${API_BASE}${product.imageLocal}`
    : product.imageUrl;
  if (!src) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Package className="h-5 w-5" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={product.name}
      className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-border"
      loading="lazy"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
        const fallback = (e.currentTarget as HTMLImageElement).nextElementSibling;
        if (fallback) fallback.classList.remove("hidden");
      }}
    />
  );
}

interface ProductForm {
  name: string;
  categoryId: string;
  type: ProductType;
  priceRetailBase: string;
  priceCost: string;
  isOnOrder: boolean;
  weightKg: string;
  unit: string;
  stock: string;
  imageUrl: string;
  description: string;
  attributes: { key: string; value: string }[];
}

const EMPTY_FORM: ProductForm = {
  name: "",
  categoryId: "",
  type: "METALL",
  priceRetailBase: "",
  priceCost: "",
  isOnOrder: false,
  weightKg: "1",
  unit: "",
  stock: "0",
  imageUrl: "",
  description: "",
  attributes: [{ key: "", value: "" }],
};

function toForm(p: AdminProduct): ProductForm {
  return {
    name: p.name,
    categoryId: p.categoryId,
    type: p.type,
    priceRetailBase: p.priceRetailBase ?? "",
    priceCost: p.priceCost ?? "",
    isOnOrder: p.isOnOrder,
    weightKg: p.weightKg,
    unit: p.unit ?? "",
    stock: String(p.stock),
    imageUrl: p.imageUrl ?? "",
    description: (p as any).description ?? "",
    attributes:
      p.attributes.length > 0 ? p.attributes : [{ key: "", value: "" }],
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "order">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [generatingSeo, setGeneratingSeo] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        listProducts({ search: search || undefined, categoryId: categoryId || undefined, type: type || undefined }),
        listCategories(),
      ]);
      setProducts(p.products);
      setTotal(p.total);
      setCategories(c.categories);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [search, categoryId, type]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(p: AdminProduct) {
    setEditing(p);
    setForm(toForm(p));
    setFormError(null);
    setModalOpen(true);
  }

  async function handleGenerateSeo() {
    if (!form.name.trim()) {
      setFormError("Сначала введите название товара");
      return;
    }
    const cat = categories.find((c) => c.id === form.categoryId);
    setGeneratingSeo(true);
    setFormError(null);
    try {
      const result = await generateSeoDescription({
        name: form.name,
        category: cat?.name || "Стройматериалы",
        attributes: form.attributes.filter((a) => a.key.trim() && a.value.trim()),
        price: form.priceRetailBase,
        unit: form.unit,
      });
      setForm({ ...form, description: result.description });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e));
    } finally {
      setGeneratingSeo(false);
    }
  }

  async function submit() {
    if (!form.name.trim() || !form.categoryId) {
      setFormError("Заполните название и выберите категорию");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name,
        categoryId: form.categoryId,
        type: form.type,
        priceRetailBase: form.priceRetailBase || null,
        priceCost: form.priceCost || null,
        isOnOrder: form.isOnOrder,
        weightKg: form.weightKg || 1,
        unit: form.unit || null,
        stock: form.stock || 0,
        imageUrl: form.imageUrl || null,
        attributes: form.attributes.filter((a) => a.key.trim() && a.value.trim()),
      };
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: AdminProduct) {
    if (!confirm(`Удалить товар «${p.name}»?`)) return;
    try {
      await deleteProduct(p.id);
      setNotice(`Товар «${p.name}» удалён`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function bulkRemove() {
    if (selected.size === 0) return;
    if (!confirm(`Удалить выбранные товары (${selected.size})?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await Promise.all([...selected].map((id) => deleteProduct(id)));
      setNotice(`Удалено товаров: ${selected.size}`);
      setSelected(new Set());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeleting(false);
    }
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const visibleProducts = (products ?? []).filter((p) => {
    if (stockFilter === "in" && p.isOnOrder) return false;
    if (stockFilter === "order" && !p.isOnOrder) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Package className="h-6 w-6 text-primary" />
            Товары
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} позиций в каталоге
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Добавить товар
        </Button>
      </div>

      {/* Фильтры */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию…"
            className="pl-9"
          />
        </div>
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-52">
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-44">
          <option value="">Все типы</option>
          {(Object.keys(TYPE_LABELS) as ProductType[]).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        <Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as "all" | "in" | "order")} className="w-44">
          <option value="all">В наличии и под заказ</option>
          <option value="in">Только в наличии</option>
          <option value="order">Только под заказ</option>
        </Select>
      </div>

      {notice && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            {notice}
          </span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-sm font-semibold">
            Выбрано товаров: {selected.size}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
              Снять выделение
            </Button>
            <Button variant="destructive" size="sm" onClick={bulkRemove} disabled={deleting}>
              {deleting && <Loader2 className="animate-spin" />}
              <Trash2 />
              Удалить выбранные
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!products && !error && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          Загрузка товаров…
        </div>
      )}

      {products && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleProducts.length > 0 && selected.size === visibleProducts.length}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? new Set(visibleProducts.map((p) => p.id))
                          : new Set()
                      )
                    }
                  />
                </th>
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="px-4 py-3 font-medium">Категория</th>
                <th className="px-4 py-3 font-medium">Тип</th>
                <th className="px-4 py-3 text-right font-medium">Цена</th>
                <th className="px-4 py-3 text-right font-medium">Остаток</th>
                <th className="px-4 py-3 text-right font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((p) => (
                <tr key={p.id} className={`border-b last:border-0 hover:bg-muted/20 ${selected.has(p.id) ? "bg-primary/5" : ""}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelected(p.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductThumb product={p} />
                      <div className="min-w-0">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.categoryName}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {TYPE_LABELS[p.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.isOnOrder ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                        под заказ
                      </span>
                    ) : (
                      <span className="font-medium">
                        {p.priceRetailBase ? `${p.priceRetailBase} ₽` : "—"}
                        {p.unit ? `/${p.unit}` : ""}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Редактировать">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(p)} title="Удалить">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    Ничего не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Модалка товара */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="my-8 w-full max-w-2xl rounded-xl border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editing ? "Редактировать товар" : "Новый товар"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Название *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Арматура А500С 12 мм"
                />
              </div>
              <div className="space-y-2">
                <Label>Категория *</Label>
                <Select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">— выберите —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Тип</Label>
                <Select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ProductType })}
                >
                  {(Object.keys(TYPE_LABELS) as ProductType[]).map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Розничная цена, ₽</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.priceRetailBase}
                  onChange={(e) => setForm({ ...form, priceRetailBase: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Себестоимость, ₽</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.priceCost}
                  onChange={(e) => setForm({ ...form, priceCost: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Вес единицы, кг</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Единица измерения</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="м / т / шт / лист"
                />
              </div>
              <div className="space-y-2">
                <Label>Остаток, шт</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ссылка на фото</Label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isOnOrder}
                  onChange={(e) => setForm({ ...form, isOnOrder: e.target.checked })}
                  className="h-4 w-4"
                />
                Товар «под заказ» (без цены)
              </label>
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>SEO-описание товара</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSeo}
                    disabled={generatingSeo}
                    className="gap-2"
                  >
                    {generatingSeo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {generatingSeo ? "Генерация..." : "Заполнить ИИ"}
                  </Button>
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Профессиональное SEO-описание товара..."
                  rows={5}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {form.description && (
                  <p className="text-xs text-muted-foreground">{form.description.length} знаков</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Характеристики</Label>
                {form.attributes.map((attr, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={attr.key}
                      onChange={(e) => {
                        const next = [...form.attributes];
                        next[i] = { ...next[i], key: e.target.value };
                        setForm({ ...form, attributes: next });
                      }}
                      placeholder="Ключ (например: diameter)"
                      className="w-1/2"
                    />
                    <Input
                      value={attr.value}
                      onChange={(e) => {
                        const next = [...form.attributes];
                        next[i] = { ...next[i], value: e.target.value };
                        setForm({ ...form, attributes: next });
                      }}
                      placeholder="Значение (например: 12мм)"
                      className="w-1/2"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setForm({
                          ...form,
                          attributes: form.attributes.filter((_, j) => j !== i),
                        })
                      }
                      disabled={form.attributes.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm({
                      ...form,
                      attributes: [...form.attributes, { key: "", value: "" }],
                    })
                  }
                >
                  <Plus />
                  Добавить характеристику
                </Button>
              </div>
            </div>

            {formError && (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                {formError}
              </div>
            )}

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
