"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Save } from "lucide-react";

export function MainHeroBannerForm({ config }: { config: any }) {
  const bannerBlock = config?.blocks?.find((b: any) => b.type === "MainHeroBanner");
  const [formData, setFormData] = useState({
    title: bannerBlock?.title || "",
    subtitle: bannerBlock?.subtitle || "",
    ctaLabel: bannerBlock?.ctaLabel || "",
    imageUrl: bannerBlock?.imageUrl || "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/marketing/banner", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/atlas/media", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) setFormData((f) => ({ ...f, imageUrl: data.url }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Заголовок промо</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="h-12 rounded-xl border-2 font-bold"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Описание</Label>
        <Textarea
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          className="min-h-[100px] rounded-xl border-2 font-medium"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Текст кнопки</Label>
        <Input
          value={formData.ctaLabel}
          onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
          className="h-12 rounded-xl border-2 font-bold"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Фоновое изображение</Label>
        <div
          className="relative flex h-28 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 transition-colors hover:border-primary/50"
          onClick={() => document.getElementById("mainhero-file")?.click()}
        >
          {formData.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={formData.imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="px-4 text-center text-xs font-bold text-muted-foreground/60">
              {uploading ? "Загрузка…" : "Нажмите, чтобы загрузить фон"}
            </span>
          )}
          {uploading && formData.imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>
        <input
          id="mainhero-file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            uploadImage(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {formData.imageUrl && (
          <button
            className="text-[11px] font-bold text-red-600 hover:underline"
            onClick={() => setFormData({ ...formData, imageUrl: "" })}
          >
            Убрать фото
          </button>
        )}
      </div>
      <div className="pt-2">
        <Button
          onClick={handleUpdate}
          disabled={saving}
          className="h-12 w-full rounded-xl bg-primary font-black shadow-lg shadow-primary/20"
        >
          {saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saved ? "СОХРАНЕНО" : saving ? "СОХРАНЕНИЕ…" : "ОБНОВИТЬ БАННЕР"}
        </Button>
      </div>
    </div>
  );
}
