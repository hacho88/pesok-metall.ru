"use client";

import { useEffect, useState } from "react";
import {
  ImagePlus,
  Loader2,
  Save,
  Sparkles,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface EditableCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  shortDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  descriptionStatus: string;
  descriptionGeneratedAt: string | null;
  parentName: string | null;
}

export function CategoryDialog({
  category,
  categories = [],
  open,
  onOpenChange,
  onSaved,
}: {
  category: EditableCategory | null;
  categories?: { id: string; name: string; parentName: string | null }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const isEdit = !!category;
  const [form, setForm] = useState<{
    name: string;
    parentId: string;
    imageUrl: string | null;
    description: string | null;
    shortDescription: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    descriptionStatus: string;
    descriptionGeneratedAt: string | null;
  }>({
    name: "",
    parentId: "",
    imageUrl: null,
    description: "",
    shortDescription: "",
    seoTitle: "",
    seoDescription: "",
    descriptionStatus: "none",
    descriptionGeneratedAt: null,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        name: category?.name ?? "",
        parentId: "",
        imageUrl: category?.imageUrl ?? null,
        description: category?.description ?? null,
        shortDescription: category?.shortDescription ?? null,
        seoTitle: category?.seoTitle ?? null,
        seoDescription: category?.seoDescription ?? null,
        descriptionStatus: category?.descriptionStatus ?? "none",
        descriptionGeneratedAt: category?.descriptionGeneratedAt ?? null,
      });
      setError(null);
      setSaved(false);
    }
  }, [category, open]);

  const set = (patch: Record<string, any>) => setForm((f) => ({ ...f, ...patch }));

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/atlas/media", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        set({ imageUrl: data.url });
      } else {
        setError(data.error || "Ошибка загрузки фото");
      }
    } catch {
      setError("Ошибка загрузки фото");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!category) return;
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}/generate-description`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка генерации");
      } else {
        const c = data.category;
        setForm((f) => ({
          ...f,
          description: c.description ?? f.description,
          shortDescription: c.shortDescription ?? f.shortDescription,
          seoTitle: c.seoTitle ?? f.seoTitle,
          seoDescription: c.seoDescription ?? f.seoDescription,
          descriptionStatus: c.descriptionStatus,
          descriptionGeneratedAt: c.descriptionGeneratedAt,
        }));
      }
    } catch {
      setError("Не удалось связаться с сервером");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Введите название категории");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = category
        ? await fetch(`/api/admin/categories/${category.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              parentId: form.parentId || undefined,
              imageUrl: form.imageUrl || undefined,
            }),
          });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onSaved?.();
        if (!category) onOpenChange(false);
      } else {
        const data = await res.json();
        setError(data.error || "Не удалось сохранить");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    if (!window.confirm(`Удалить категорию «${category.name}»? Действие необратимо.`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      if (res.ok) {
        onOpenChange(false);
        onSaved?.();
      } else {
        const data = await res.json();
        setError(data.error || "Не удалось удалить");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setDeleting(false);
    }
  };

  const aiStatus = form.descriptionStatus;
  const generatedAt = form.descriptionGeneratedAt
    ? new Date(form.descriptionGeneratedAt).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] max-w-2xl flex-col gap-0 overflow-hidden rounded-3xl border-2 p-0">
        <DialogHeader className="shrink-0 border-b px-6 pb-4 pr-12 pt-6">
          <DialogTitle className="text-lg font-black tracking-tight">
            {category ? `Категория: ${category.name}` : "Новая категория"}
          </DialogTitle>
          <p className="text-xs font-medium leading-snug text-muted-foreground">
            {category
              ? "Фото для плитки каталога, описание и SEO-мета для продвижения pesok-metall.ru"
              : "Введите название и при необходимости выберите родительскую категорию"}
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-4">
          {!isEdit && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Название категории</Label>
                <Input
                  className="h-12 rounded-xl border-2 font-bold"
                  placeholder="Например: Профнастил"
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Родительская категория</Label>
                <select
                  className="h-12 w-full rounded-xl border-2 bg-card px-3 font-bold"
                  value={form.parentId}
                  onChange={(e) => set({ parentId: e.target.value })}
                >
                  <option value="">— верхний уровень —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.parentName ? `${c.parentName} → ${c.name}` : c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {isEdit && (
          <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
            {/* Фото категории */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Фото категории</Label>
              <label className="group relative block aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 transition-all hover:border-primary/50 hover:bg-primary/5">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt={form.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                    <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
                    <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      Загрузить фото
                    </span>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                />
              </label>
              {form.imageUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => set({ imageUrl: null })}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Убрать фото
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Название категории</Label>
                <Input
                  className="h-12 rounded-xl border-2 font-bold"
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Краткое описание (плитка)</Label>
                <Input
                  className="h-12 rounded-xl border-2 font-bold"
                  placeholder="Одно предложение 90–160 символов"
                  value={form.shortDescription ?? ""}
                  onChange={(e) => set({ shortDescription: e.target.value })}
                />
              </div>
            </div>
          </div>
          )}

          {/* Описание + ИИ */}
          <div className="rounded-2xl border-2 bg-muted/30 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SEO-описание категории</Label>
                {aiStatus === "generated" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-green-700">
                    <Sparkles className="h-2.5 w-2.5" />
                    ИИ{generatedAt ? ` · ${generatedAt}` : ""}
                  </span>
                )}
                {aiStatus === "manual" && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-blue-700">
                    Вручную
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg border-2 border-primary/30 font-black text-primary hover:bg-primary hover:text-white"
                onClick={handleGenerate}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
                {aiLoading ? "ГЕНЕРАЦИЯ…" : "СГЕНЕРИРОВАТЬ ИИ"}
              </Button>
            </div>
            <Textarea
              className="mt-3 min-h-32 rounded-xl border-2 text-sm leading-relaxed"
              placeholder="SEO-текст для страницы категории — напишите вручную или сгенерируйте ИИ"
              value={form.description ?? ""}
              onChange={(e) => set({ description: e.target.value })}
            />
          </div>

          {/* SEO-мета */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SEO Title</Label>
              <Input
                className="h-11 rounded-xl border-2 font-bold"
                value={form.seoTitle ?? ""}
                onChange={(e) => set({ seoTitle: e.target.value })}
                placeholder="Песок — купить в Москве с доставкой"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SEO Description</Label>
              <Input
                className="h-11 rounded-xl border-2 font-bold"
                value={form.seoDescription ?? ""}
                onChange={(e) => set({ seoDescription: e.target.value })}
                placeholder="140–160 знаков с выгодой и призывом"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t bg-card px-6 py-4">
          {isEdit ? (
            <Button
              variant="outline"
              className="h-11 rounded-xl border-2 border-red-200 font-black text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Trash2 className="mr-2 h-5 w-5" />}
              {deleting ? "УДАЛЕНИЕ…" : "УДАЛИТЬ"}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <Button variant="outline" className="h-11 rounded-xl font-bold" onClick={() => onOpenChange(false)}>
              ЗАКРЫТЬ
            </Button>
            <Button
              className="h-11 rounded-xl bg-primary px-8 font-black shadow-xl shadow-primary/20"
              onClick={handleSave}
              disabled={saving}
            >
              {saved ? <CheckCircle2 className="mr-2 h-5 w-5" /> : saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {saved ? "СОХРАНЕНО" : saving ? "СОХРАНЕНИЕ…" : "СОХРАНИТЬ"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
