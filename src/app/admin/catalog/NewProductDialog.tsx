"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const UNITS = ["м", "т", "шт", "лист", "кг", "уп", "рулон", "мешок"];

const PRODUCT_TYPES = [
  { value: "METALL", label: "Металлопрокат" },
  { value: "BAG_30KG", label: "Сыпучее в мешке 30 кг" },
  { value: "BIG_BAG_1TON", label: "Сыпучее в биг-беге 1 т" },
  { value: "GENERAL_CONSTRUCTION", label: "Общестроительный товар" },
];

export interface FlatCategory {
  id: string;
  name: string;
  parentName: string | null;
}

const EMPTY_FORM = {
  categoryId: "",
  name: "",
  priceRetailBase: "",
  unit: "шт",
  weightKg: "",
  stock: "",
  type: "METALL",
};

export function NewProductDialog({
  categories,
  open: controlledOpen,
  onOpenChange,
  presetCategoryId,
}: {
  categories: { id: string; name: string; parentName: string | null }[];
  /** Управляемый режим: открыт из «+» на категории в дереве */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  presetCategoryId?: string;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
    // После добавления товара обновляем дерево
    if (!v && createdName) window.location.reload();
  };

  // Предзаполнение категории при открытии из «+» на категории
  useEffect(() => {
    if (open && presetCategoryId) {
      setForm((f) => ({ ...f, categoryId: presetCategoryId }));
      setCreatedName(null);
      setError(null);
    }
  }, [open, presetCategoryId]);

  const set = (patch: Record<string, any>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    if (!form.name.trim() || !form.categoryId) {
      setError("Укажите категорию и название товара");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const product = await res.json();
        setCreatedName(product.name);
        // Категория и единица остаются — быстро добавляем следующий товар
        setForm((f) => ({ ...f, name: "", priceRetailBase: "", weightKg: "", stock: "" }));
      } else {
        const data = await res.json();
        setError(data.error || "Не удалось создать товар");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  const body = (
    <DialogContent className="flex max-h-[92dvh] max-w-lg flex-col gap-0 overflow-hidden rounded-3xl border-2 p-0">
      <DialogHeader className="shrink-0 border-b px-6 pb-4 pr-12 pt-6">
        <DialogTitle className="text-lg font-black tracking-tight">
          {createdName ? "Товар добавлен" : "Новый товар"}
        </DialogTitle>
        <DialogDescription className="text-xs font-medium leading-snug text-muted-foreground">
          {createdName
            ? `«${createdName}» создан. Можно добавить следующий товар в эту же категорию.`
            : "Создайте товар, выберите категорию и задайте цену — остальное можно заполнить позже."}
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Категория *</Label>
          <Select
            className="h-11 rounded-xl border-2 font-bold"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="" disabled>Выберите категорию</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentName ? `${c.parentName} → ${c.name}` : c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Название *</Label>
          <Input
            className="h-11 rounded-xl border-2 font-bold"
            placeholder="Арматура 14 мм. А500С"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Цена (₽)</Label>
            <Input
              type="number"
              className="h-11 rounded-xl border-2 font-bold"
              placeholder="52"
              value={form.priceRetailBase}
              onChange={(e) => setForm({ ...form, priceRetailBase: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Единица</Label>
            <Select
              className="h-11 rounded-xl border-2 font-bold"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Вес единицы (кг)</Label>
            <Input
              type="number"
              step="0.001"
              className="h-11 rounded-xl border-2 font-bold"
              placeholder="0.888"
              value={form.weightKg}
              onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Остаток</Label>
            <Input
              type="number"
              className="h-11 rounded-xl border-2 font-bold"
              placeholder="100"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Тип товара</Label>
          <Select
            className="h-11 rounded-xl border-2 font-bold"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">{error}</p>
        )}
      </div>

      <DialogFooter className="shrink-0 gap-2 border-t bg-card px-6 py-4">
        {createdName ? (
          <>
            <Button variant="outline" className="h-11 rounded-xl font-bold" onClick={() => setOpen(false)}>
              ГОТОВО
            </Button>
            <Button
              className="h-11 rounded-xl bg-primary font-black shadow-xl shadow-primary/20"
              onClick={submit}
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
              {saving ? "СОЗДАЁТСЯ…" : "ДОБАВИТЬ ЕЩЁ"}
            </Button>
          </>
        ) : (
          <Button
            className="h-11 w-full rounded-xl bg-primary font-black shadow-xl shadow-primary/20"
            onClick={submit}
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
            {saving ? "СОЗДАЁТСЯ…" : "СОЗДАТЬ ТОВАР"}
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );

  // Управляемый режим (из «+» на категории в дереве)
  if (isControlled) {
    return <Dialog open={open} onOpenChange={setOpen}>{body}</Dialog>;
  }

  // Обычный режим (кнопка «Новый товар» в шапке)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-primary h-11 px-6 font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <Plus className="mr-2 h-4 w-4" />
          НОВЫЙ ТОВАР
        </Button>
      </DialogTrigger>
      {body}
    </Dialog>
  );
}
