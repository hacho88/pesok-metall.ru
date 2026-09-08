"use client";

import { useEffect, useState } from "react";
import {
  CloudUpload,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Coins,
  PackageCheck,
  Sparkles,
  Loader2,
  CheckCircle2,
  Scale,
  Ruler,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const UNITS = ["м", "т", "шт", "лист", "кг", "уп", "рулон", "мешок"];

interface ProductDetailsFormProps {
  product: any;
  onSave: (data: any) => void;
  onDelete: (id: string) => void;
}

export function ProductDetailsForm({ product, onSave, onDelete }: ProductDetailsFormProps) {
  const [formData, setFormData] = useState(product);
  const [isOnOrder, setIsOnOrder] = useState(product.isOnOrder || false);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Сброс формы при выборе другого товара
  useEffect(() => {
    setFormData(product);
    setIsOnOrder(product.isOnOrder || false);
    setSaved(false);
    setAiError(null);
  }, [product]);

  const set = (patch: Record<string, any>) => setFormData((f: any) => ({ ...f, ...patch }));

  const handleSave = () => {
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleGenerate = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`/api/products/${product.id}/generate-description`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Ошибка генерации");
      } else {
        setFormData((f: any) => ({
          ...f,
          description: data.description ?? f.description,
          shortDescription: data.shortDescription ?? f.shortDescription,
          seoTitle: data.seoTitle ?? f.seoTitle,
          seoDescription: data.seoDescription ?? f.seoDescription,
          descriptionStatus: data.descriptionStatus,
          descriptionGeneratedAt: data.descriptionGeneratedAt,
          descriptionModel: data.descriptionModel,
        }));
      }
    } catch {
      setAiError("Не удалось связаться с сервером");
    } finally {
      setAiLoading(false);
    }
  };

  const aiStatus = formData.descriptionStatus;
  const generatedAt = formData.descriptionGeneratedAt
    ? new Date(formData.descriptionGeneratedAt).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-6 font-jakarta">
      <div className="sticky top-0 z-10 -mx-5 flex items-center justify-between gap-3 border-b bg-card px-5 pb-4 pt-1 lg:-mx-6 lg:px-6">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black tracking-tight lg:text-xl" title={product.name}>
            {product.name}
          </h2>
          <p className="truncate text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {product.category?.name} · ID: {product.id.slice(0, 8)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-xl font-bold text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onDelete(product.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button className="h-11 rounded-xl bg-primary px-6 font-black shadow-xl shadow-primary/20" onClick={handleSave}>
            {saved ? <CheckCircle2 className="mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
            {saved ? "СОХРАНЕНО" : "СОХРАНИТЬ"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Название */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Название товара</Label>
            <Input 
              className="h-14 rounded-2xl border-2 text-lg font-bold transition-all focus:border-primary focus:ring-0" 
              value={formData.name}
              onChange={(e) => set({ name: e.target.value })}
            />
          </div>

          {/* Цена и склад */}
          <div className={cn(
            "rounded-[1.5rem] border-2 p-5 transition-all",
            isOnOrder ? "bg-amber-50 border-amber-200" : "bg-primary/5 border-primary/10"
          )}>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg",
                  isOnOrder ? "bg-amber-500 shadow-amber-200" : "bg-primary shadow-primary/20"
                )}>
                  {isOnOrder ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </div>
                <div>
                  <p className="text-base font-black tracking-tight">Под заказ</p>
                  <p className="text-xs font-bold text-muted-foreground">Скрыть цену и включить форму запроса</p>
                </div>
              </div>
              <Switch
                checked={isOnOrder}
                onCheckedChange={(val) => {
                  setIsOnOrder(val);
                  set({ isOnOrder: val });
                }}
                className="scale-125 data-[state=checked]:bg-amber-500"
              />
            </div>

            {!isOnOrder && (
              <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    <Coins className="h-3 w-3" />
                    Базовая цена (₽)
                  </Label>
                  <Input 
                    type="number"
                    className="h-12 rounded-xl border-2 text-base font-bold" 
                    value={formData.priceRetailBase ?? ""}
                    onChange={(e) => set({ priceRetailBase: e.target.value === "" ? null : Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    <PackageCheck className="h-3 w-3" />
                    Остаток на складе
                  </Label>
                  <Input 
                    type="number"
                    className="h-12 rounded-xl border-2 text-base font-bold" 
                    value={formData.stock ?? ""}
                    onChange={(e) => set({ stock: e.target.value === "" ? 0 : Number(e.target.value) })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Единица измерения и вес */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <Ruler className="h-3 w-3" />
                Единица измерения
              </Label>
              <Select
                className="h-12 rounded-xl border-2 text-base font-bold"
                value={formData.unit ?? "шт"}
                onChange={(e) => set({ unit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u === "м" ? "м — метр (селект м/т)" : u === "т" ? "т — тонна (селект м/т)" : u}
                  </option>
                ))}
              </Select>
              <p className="text-[11px] font-medium leading-snug text-muted-foreground">
                Для металла с весом метра селект «м/т» — автоматически
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <Scale className="h-3 w-3" />
                Вес единицы (кг)
              </Label>
              <Input
                type="number"
                step="0.001"
                className="h-12 rounded-xl border-2 text-base font-bold"
                value={formData.weightKg ?? ""}
                onChange={(e) => set({ weightKg: e.target.value === "" ? 0 : Number(e.target.value) })}
              />
              <p className="text-[11px] font-medium leading-snug text-muted-foreground">
                Вес метра для металла, вес мешка/листа для штучных
              </p>
            </div>
          </div>

          {/* Описание + ИИ */}
          <div className="rounded-[1.5rem] border-2 bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Описание товара (SEO)</Label>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {aiStatus === "generated" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-green-700">
                      <Sparkles className="h-3 w-3" />
                      Сгенерировано ИИ{generatedAt ? ` · ${generatedAt}` : ""}
                    </span>
                  )}
                  {aiStatus === "manual" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-blue-700">
                      Отредактировано вручную
                    </span>
                  )}
                  {aiStatus === "failed" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-700">
                      Ошибка генерации
                    </span>
                  )}
                  {(!aiStatus || aiStatus === "none") && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Описания нет
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                className="h-10 shrink-0 rounded-xl border-2 border-primary/30 text-xs font-black text-primary hover:bg-primary hover:text-white"
                onClick={handleGenerate}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
                {aiLoading ? "ГЕНЕРАЦИЯ…" : "СГЕНЕРИРОВАТЬ ИИ"}
              </Button>
            </div>

            {aiError && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">{aiError}</p>
            )}

            <Textarea
              className="mt-4 min-h-40 rounded-xl border-2 text-sm leading-relaxed"
              placeholder="Описание появится здесь — напишите вручную или нажмите «Сгенерировать ИИ»"
              value={formData.description ?? ""}
              onChange={(e) => set({ description: e.target.value })}
            />
            <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
              HTML разрешён: &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;.
            </p>
          </div>

          {/* SEO-поля */}
          <div className="rounded-[1.5rem] border-2 bg-muted/30 p-5 space-y-4">
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">SEO-мета (заполняется ИИ или вручную)</Label>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">SEO Title</Label>
              <Input
                className="h-11 rounded-xl border-2 font-bold"
                value={formData.seoTitle ?? ""}
                onChange={(e) => set({ seoTitle: e.target.value })}
                placeholder="Арматура 12 мм А500С — купить в Москве с доставкой"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">SEO Description</Label>
              <Textarea
                className="min-h-16 rounded-xl border-2 text-sm"
                value={formData.seoDescription ?? ""}
                onChange={(e) => set({ seoDescription: e.target.value })}
                placeholder="Арматура А500С от 52 ₽/м. Доставка в день заказа по Москве и МО. Резка в размер."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Краткое описание</Label>
              <Input
                className="h-11 rounded-xl border-2 font-bold"
                value={formData.shortDescription ?? ""}
                onChange={(e) => set({ shortDescription: e.target.value })}
                placeholder="Одно предложение 90–160 символов"
              />
            </div>
          </div>
        </div>

        {/* Фото + атрибуты */}
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Фото товара</Label>
            <div className="group relative aspect-square overflow-hidden rounded-[2.5rem] border-4 border-dashed border-muted-foreground/20 bg-muted/30 transition-all hover:border-primary/50 hover:bg-primary/5">
              {formData.imageLocal || formData.imageUrl ? (
                <img 
                  src={formData.imageLocal || formData.imageUrl} 
                  className="h-full w-full object-contain p-8"
                  alt="Product preview"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <CloudUpload className="h-12 w-12 text-muted-foreground/40 transition-transform group-hover:scale-110 group-hover:text-primary" />
                  <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground/60">Перетащите фото сюда</p>
                </div>
              )}
              <input type="file" className="absolute inset-0 cursor-pointer opacity-0" />
            </div>
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Поддержка JPG, PNG, WebP · Макс 5MB</p>
          </div>

          {/* Характеристики (только просмотр) */}
          {formData.attributes?.length > 0 && (
            <div className="rounded-3xl border-2 bg-muted/30 p-5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Характеристики</Label>
              <dl className="mt-3 space-y-2">
                {formData.attributes.map((a: any) => (
                  <div key={a.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <dt className="shrink-0 font-bold text-muted-foreground">{a.key}</dt>
                    <dd className="truncate font-semibold">{a.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="rounded-3xl border-2 border-primary/20 bg-primary/5 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Цена за тонну</p>
            <p className="mt-1 text-lg font-black">
              {formData.priceRetailBase != null && Number(formData.weightKg) > 0
                ? `${Math.round((Number(formData.priceRetailBase) / Number(formData.weightKg)) * 1000).toLocaleString("ru-RU")} ₽/т`
                : "—"}
            </p>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground">
              Рассчитывается автоматически: цена ÷ вес единицы × 1000
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
