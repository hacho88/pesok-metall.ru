"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Rocket, Wallet, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { getMarketingSettings, updateMarketingSettings } from "@/lib/api";

export function AdvertisingForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dailyBudget: 5000,
    maxBid: 150,
    autopilot: true,
  });

  useEffect(() => {
    getMarketingSettings()
      .then(data => setFormData(data))
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateMarketingSettings(formData);
      alert("Настройки маркетинга сохранены!");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className={cn(
        "rounded-3xl border-2 p-6 transition-all",
        formData.autopilot ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-border"
      )}>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg",
                formData.autopilot ? "bg-primary animate-pulse shadow-primary/30" : "bg-muted-foreground shadow-none"
              )}>
                 <Rocket className="h-6 w-6" />
              </div>
              <div>
                 <p className="text-lg font-black tracking-tight uppercase">DeepSeek Autopilot</p>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">ИИ сам управляет ставками</p>
              </div>
           </div>
           <Switch 
             checked={formData.autopilot} 
             onCheckedChange={(val) => setFormData({ ...formData, autopilot: val })} 
             className="scale-125"
           />
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            <Wallet className="h-3 w-3" />
            Дневной бюджет (₽)
          </Label>
          <Input 
            type="number" 
            value={formData.dailyBudget}
            onChange={(e) => setFormData({ ...formData, dailyBudget: Number(e.target.value) })}
            placeholder="5000" 
            className="h-14 rounded-xl border-2 text-lg font-bold"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            <Target className="h-3 w-3" />
            Максимальная ставка (₽)
          </Label>
          <Input 
            type="number" 
            value={formData.maxBid}
            onChange={(e) => setFormData({ ...formData, maxBid: Number(e.target.value) })}
            placeholder="150" 
            className="h-14 rounded-xl border-2 text-lg font-bold"
          />
        </div>
      </div>

      <Button 
        onClick={handleSave}
        disabled={loading}
        className="w-full h-14 rounded-full bg-foreground text-background font-black transition-all hover:bg-primary hover:text-white hover:scale-105"
      >
         {loading ? "СОХРАНЕНИЕ..." : "СОХРАНИТЬ НАСТРОЙКИ"}
      </Button>
    </div>
  );
}
