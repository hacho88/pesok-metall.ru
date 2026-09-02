"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Loader2,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  getPageConfig,
  savePageConfig,
  API_BASE,
  type AdminProduct,
  type AdminCategory,
  type ProductType,
} from "@/lib/api";
import type { PageConfig, ThemePreset } from "@/types/page-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const TYPE_LABELS: Record<ProductType, string> = {
  METALL: "Металлопрокат",
  BAG_30KG: "Мешок 30 кг",
  BIG_BAG_1TON: "Биг-бэг 1 т",
  GENERAL_CONSTRUCTION: "Общестрой",
};

const IDEAL_THEME: ThemePreset = "ideal";

interface ProductDraft {
  name: string;
  categoryId: string;
  type: ProductType;
  priceRetailBase: string;
  isOnOrder: boolean;
  stock: string;
  unit: string;
}

const EMPTY_DRAFT: ProductDraft = {
  name: "",
  categoryId: "",
  type: "METALL",
  priceRetailBase: "",
  isOnOrder: false,
  stock: "0",
  unit: "",
};

export default function IdealControlCenter() {
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "in" | "order">("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT);
  const [createOpen, setCreateOpen] = useState(false);
  const [savingProduct, setSavingProduct] = useState<string | null>(null);
  const [savingBlocks, setSavingBlocks] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [page, p, c] = await Promise.all([
        getPageConfig("home").catch(() => null),
        listProducts(),
        listCategories(),
      ]);
      setConfig(page?.config ?? null);
      setProducts(p.products);
      setCategories(c.categories);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function applyIdeal() {
    if (!config) return;
    setBusy(true);
    setError(null);
    try {
      await savePageConfig({ ...config, theme: IDEAL_THEME });
      setConfig({ ...config, theme: IDEAL_THEME });
      setNotice("Тема «Идеал» применена к главной странице");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function moveBlock(index: number, dir: -1 | 1) {
    if (!config) return;
    const blocks = [...config.blocks];
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    const next = { ...config, blocks };
    setConfig(next);
    setSavingBlocks(true);
    setError(null);
    try {
      await savePageConfig(next);
      setNotice("Порядок блоков сохранён");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingBlocks(false);
    }
  }

  async function removeProduct(p: AdminProduct) {
    if (!confirm(`Удалить товар «${p.name}»?`)) return;
    setBusy(true);
    setError(null);
    try {
      await deleteProduct(p.id);
      setProducts((prev) => prev?.filter((x) => x.id !== p.id) ?? null);
      setNotice("Товар удалён");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function quickSave(p: AdminProduct, patch: Partial<AdminProduct>) {
    const next = { ...p, ...patch };
    setSavingProduct(p.id);
    setError(null);
    try {
      await updateProduct(p.id, {
        name: next.name,
        categoryId: next.categoryId,
        type: next.type,
        priceRetailBase: next.priceRetailBase || null,
        isOnOrder: next.isOnOrder,
        stock: next.stock,
        unit: next.unit || null,
      });
      setProducts((prev) =>
        prev?.map((x) => (x.id === p.id ? next : x)) ?? null
      );
      setNotice("Товар сохранён");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingProduct(null);
    }
  }

  async function createFromDraft() {
    if (!draft.name.trim() || !draft.categoryId) {
      setError("Заполните название и категорию");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createProduct({
        name: draft.name,
        categoryId: draft.categoryId,
        type: draft.type,
        priceRetailBase: draft.priceRetailBase || null,
        isOnOrder: draft.isOnOrder,
        stock: draft.stock || 0,
        unit: draft.unit || null,
      });
      setCreateOpen(false);
      setDraft(EMPTY_DRAFT);
      setNotice("Товар создан");
      const p = await listProducts();
      setProducts(p.products);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const filtered = (products ?? []).filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === "in" && p.isOnOrder) return false;
    if (statusFilter === "order" && !p.isOnOrder) return false;
    if (categoryFilter && p.categoryId !== categoryFilter) return false;
    return true;
  });

  const catName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Шапка */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight">
            <Sparkles className="h-6 w-6 text-primary" />
            Ideal Control Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Премиальный командный центр: тема, интерфейс, товары. API:{" "}
            <span className="font-mono text-xs">{API_BASE}</span>
          </p>
        </div>
        <a
          href={API_BASE}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          Открыть сайт
        </a>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
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

      {/* Быстрые действия */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAction
          icon={<Plus className="h-5 w-5" />}
          title="Добавить товар"
          subtitle="Быстрое создание позиции"
          onClick={() => setCreateOpen(true)}
          accent
        />
        <QuickAction
          icon={<Package className="h-5 w-5" />}
          title="Редактировать товары"
          subtitle="Полный каталог с фильтрами"
          href="/products"
        />
        <QuickAction
          icon={<Wand2 className="h-5 w-5" />}
          title="Применить тему «Идеал»"
          subtitle={
            config
              ? `Сейчас: ${config.theme}`
              : "Тема главной не загружена"
          }
          onClick={applyIdeal}
          loading={busy}
          disabled={!config || config.theme === IDEAL_THEME}
        />
        <QuickAction
          icon={<Pencil className="h-5 w-5" />}
          title="Редактировать главную"
          subtitle="Визуальный редактор блоков"
          href="/editor/home"
        />
        <QuickAction
          icon={<Sparkles className="h-5 w-5" />}
          title="Сгенерировать страницу"
          subtitle="Сборка по промпту с ИИ"
          href="/editor/home"
        />
        <QuickAction
          icon={<ExternalLink className="h-5 w-5" />}
          title="Открыть витрину"
          subtitle="Публичный сайт в новой вкладке"
          href={API_BASE}
          external
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Виджет товаров */}
        <section className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Package className="h-5 w-5 text-primary" />
                Товары
              </h2>
              <p className="text-xs text-muted-foreground">
                Быстрое редактирование без перезагрузки
              </p>
            </div>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus />
              Добавить
            </Button>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-52 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию…"
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "in" | "order")
              }
              className="w-40"
            >
              <option value="all">Все статусы</option>
              <option value="in">В наличии</option>
              <option value="order">Под заказ</option>
            </Select>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-48"
            >
              <option value="">Все категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {!products ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" />
              Загрузка товаров…
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Ничего не найдено
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.slice(0, 10).map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border bg-background p-2.5 transition-colors hover:border-primary/30"
                >
                  <div className="min-w-0 flex-1 basis-48">
                    <Input
                      defaultValue={p.name}
                      onBlur={(e) => {
                        if (e.target.value !== p.name)
                          quickSave(p, { name: e.target.value });
                      }}
                      className="h-9 border-transparent bg-transparent font-medium hover:border-input"
                    />
                    <p className="mt-0.5 px-1 text-xs text-muted-foreground">
                      /{p.slug} · {catName(p.categoryId)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      defaultValue={p.priceRetailBase ?? ""}
                      placeholder="Цена"
                      onBlur={(e) => {
                        if (e.target.value !== (p.priceRetailBase ?? ""))
                          quickSave(p, { priceRetailBase: e.target.value });
                      }}
                      className="h-9 w-28"
                      disabled={p.isOnOrder}
                    />
                    <Input
                      type="number"
                      min={0}
                      defaultValue={String(p.stock)}
                      onBlur={(e) => {
                        if (e.target.value !== String(p.stock))
                          quickSave(p, { stock: Number(e.target.value) });
                      }}
                      className="h-9 w-20"
                      title="Остаток"
                    />
                    <label className="flex h-9 items-center gap-1.5 rounded-lg border px-2 text-xs font-medium text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={p.isOnOrder}
                        onChange={(e) =>
                          quickSave(p, { isOnOrder: e.target.checked })
                        }
                        className="h-3.5 w-3.5"
                      />
                      заказ
                    </label>
                    <Link href={`/catalog?product=${p.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        title="Открыть в каталоге"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive"
                      onClick={() => removeProduct(p)}
                      title="Удалить"
                      disabled={busy}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {savingProduct === p.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Виджет интерфейса */}
        <section className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Wand2 className="h-5 w-5 text-primary" />
                Интерфейс
              </h2>
              <p className="text-xs text-muted-foreground">
                Активная тема и блоки главной
              </p>
            </div>
            <Link href="/editor/home">
              <Button variant="outline" size="sm">
                Редактор
              </Button>
            </Link>
          </div>

          {!config ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" />
              Загрузка конфигурации…
            </div>
          ) : (
            <>
              <div className="mb-4 rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Тема главной страницы
                    </p>
                    <p className="text-sm font-bold">
                      {config.theme === IDEAL_THEME ? (
                        <span className="text-primary">Идеал ✓</span>
                      ) : (
                        config.theme
                      )}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={applyIdeal}
                    disabled={config.theme === IDEAL_THEME || busy}
                  >
                    {busy ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Sparkles />
                    )}
                    {config.theme === IDEAL_THEME
                      ? "Применена"
                      : "Применить Идеал"}
                  </Button>
                </div>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Блоки ({config.blocks.length})
                </p>
                {savingBlocks && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Сохранение…
                  </span>
                )}
              </div>
              <ol className="space-y-1.5">
                {config.blocks.map((block, i) => (
                  <li
                    key={`${block.type}-${i}`}
                    className="flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {block.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveBlock(i, -1)}
                      disabled={i === 0 || savingBlocks}
                      className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                      title="Выше"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(i, 1)}
                      disabled={i === config.blocks.length - 1 || savingBlocks}
                      className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                      title="Ниже"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {config.blocks.length === 0 && (
                  <li className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                    Страница пуста — откройте редактор
                  </li>
                )}
              </ol>
            </>
          )}
        </section>
      </div>

      {/* Модалка создания товара */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="my-8 w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Plus className="h-5 w-5 text-primary" />
                Новый товар
              </h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Название *</Label>
                <Input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({ ...draft, name: e.target.value })
                  }
                  placeholder="Арматура А500С 12 мм"
                />
              </div>
              <div className="space-y-2">
                <Label>Категория *</Label>
                <Select
                  value={draft.categoryId}
                  onChange={(e) =>
                    setDraft({ ...draft, categoryId: e.target.value })
                  }
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
                  value={draft.type}
                  onChange={(e) =>
                    setDraft({ ...draft, type: e.target.value as ProductType })
                  }
                >
                  {(Object.keys(TYPE_LABELS) as ProductType[]).map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Цена, ₽</Label>
                <Input
                  type="number"
                  min={0}
                  value={draft.priceRetailBase}
                  onChange={(e) =>
                    setDraft({ ...draft, priceRetailBase: e.target.value })
                  }
                  placeholder="0"
                  disabled={draft.isOnOrder}
                />
              </div>
              <div className="space-y-2">
                <Label>Остаток</Label>
                <Input
                  type="number"
                  min={0}
                  value={draft.stock}
                  onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Единица</Label>
                <Input
                  value={draft.unit}
                  onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
                  placeholder="м / т / шт / лист"
                />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={draft.isOnOrder}
                  onChange={(e) =>
                    setDraft({ ...draft, isOnOrder: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                Товар «под заказ» (без цены)
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={busy}
              >
                Отмена
              </Button>
              <Button onClick={createFromDraft} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <Save />}
                Создать
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
  onClick,
  href,
  external,
  loading,
  disabled,
  accent,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  loading?: boolean;
  disabled?: boolean;
  accent?: boolean;
}) {
  const cls = `group flex items-center gap-4 rounded-2xl border p-4 text-left shadow-sm transition-all ${
    accent
      ? "border-primary/30 bg-primary/5 hover:border-primary/60 hover:shadow-md"
      : "bg-card hover:border-primary/40 hover:shadow-md"
  } ${disabled ? "opacity-50" : ""}`;
  const inner = (
    <>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          accent
            ? "bg-primary text-primary-foreground"
            : "bg-primary/10 text-primary"
        }`}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-tight">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {subtitle}
        </p>
      </div>
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className={cls}
      >
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cls}
    >
      {inner}
    </button>
  );
}
