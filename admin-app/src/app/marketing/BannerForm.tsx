"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Image as ImageIcon } from "lucide-react";
import { updateMarketingBanner } from "@/lib/api";

export function BannerForm({ config }: { config: any }) {
  const bannerBlock = config?.blocks?.find((b: any) => b.type === "MainHeroBanner");
  const [formData, setFormData] = useState({
    title: bannerBlock?.title || "",
    subtitle: bannerBlock?.subtitle || "",
    ctaLabel: bannerBlock?.ctaLabel || "",
    imageUrl: bannerBlock?.imageUrl || "",
  });

  const handleUpdate = async () => {
    try {
      await updateMarketingBanner(formData);
      alert("Баннер обновлен!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
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
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Текст кнопки</Label>
          <Input 
            value={formData.ctaLabel} 
            onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
            className="h-12 rounded-xl border-2 font-bold"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Фоновое изображение (URL)</Label>
          <Input 
            value={formData.imageUrl} 
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            className="h-12 rounded-xl border-2"
          />
        </div>
      </div>
      <div className="pt-4">
        <Button 
          onClick={handleUpdate}
          className="w-full h-14 rounded-full bg-primary font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
           ОБНОВИТЬ БАННЕР
        </Button>
      </div>
    </div>
  );
}
