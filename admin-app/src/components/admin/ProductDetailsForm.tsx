"use client";

import { useState } from "react";
import { 
  CloudUpload, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  Coins,
  PackageCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductDetailsFormProps {
  product: any;
  onSave: (data: any) => void;
  onDelete: (id: string) => void;
}

export function ProductDetailsForm({ product, onSave, onDelete }: ProductDetailsFormProps) {
  const [formData, setFormData] = useState(product);
  const [isOnOrder, setIsOnOrder] = useState(product.isOnOrder || false);

  return (
    <div className="space-y-8 font-jakarta">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight">{product.name}</h2>
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">ID: {product.id.slice(0, 8)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onDelete(product.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button className="h-12 rounded-xl bg-primary px-8 font-black shadow-xl shadow-primary/20" onClick={() => onSave(formData)}>
            <Save className="mr-2 h-5 w-5" />
            СОХРАНИТЬ
          </Button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {/* Big Title Input */}
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Название товара</Label>
            <Input 
              className="h-16 rounded-2xl border-2 text-xl font-bold transition-all focus:border-primary focus:ring-0" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Pricing Toggle */}
          <div className={cn(
            "rounded-[2rem] border-2 p-8 transition-all",
            isOnOrder ? "bg-amber-50 border-amber-200" : "bg-primary/5 border-primary/10"
          )}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-xl",
                  isOnOrder ? "bg-amber-500 shadow-amber-200" : "bg-primary shadow-primary/20"
                )}>
                  {isOnOrder ? <EyeOff className="h-8 w-8" /> : <Eye className="h-8 w-8" />}
                </div>
                <div>
                  <p className="text-xl font-black tracking-tight">Под заказ</p>
                  <p className="text-sm font-bold text-muted-foreground">Скрыть цену и включить форму запроса</p>
                </div>
              </div>
              <Switch 
                checked={isOnOrder} 
                onCheckedChange={(val) => {
                  setIsOnOrder(val);
                  setFormData({ ...formData, isOnOrder: val });
                }} 
                className="scale-150 data-[state=checked]:bg-amber-500"
              />
            </div>

            {!isOnOrder && (
              <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-top-4">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    <Coins className="h-3 w-3" />
                    Цена за метр (₽)
                  </Label>
                  <Input 
                    type="number"
                    className="h-14 rounded-xl border-2 text-lg font-bold" 
                    value={formData.priceRetailBase || ""}
                    onChange={(e) => setFormData({ ...formData, priceRetailBase: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    <PackageCheck className="h-3 w-3" />
                    Склад (тонн)
                  </Label>
                  <Input 
                    type="number"
                    className="h-14 rounded-xl border-2 text-lg font-bold" 
                    value={formData.stock || ""}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Upload Area */}
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
      </div>
    </div>
  );
}
