"use client";

import { useEffect, useState } from "react";
import { getMarketingSettings, updateMarketingBanner, updateMarketingSettings, getPageConfig } from "@/lib/api";
import { 
  Megaphone, 
  Layout, 
  BarChart3, 
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BannerForm } from "./BannerForm";
import { AdvertisingForm } from "./AdvertisingForm";
import { cn } from "@/lib/utils";

export default function MarketingPage() {
  const [stats, setStats] = useState([
    { label: "Клики", value: "1,280", trend: "up", color: "green" },
    { label: "Лиды", value: "12", trend: "stable", color: "yellow" },
    { label: "Конверсия", value: "4.2%", trend: "down", color: "red" },
  ]);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    getPageConfig("home").then(data => setConfig(data.config)).catch(console.error);
  }, []);

  return (
    <div className="space-y-10 font-jakarta">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <Megaphone className="h-8 w-8 text-primary" />
            Маркетинг и Аналитика
          </h1>
          <p className="mt-1 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
            Управление промо-акциями и рекламным бюджетом
          </p>
        </div>
      </div>

      {/* Traffic Light Analytics */}
      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden rounded-3xl border-2 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-8">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{stat.label}</span>
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    stat.color === "green" ? "bg-green-100 text-green-600" : 
                    stat.color === "yellow" ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"
                  )}>
                    {stat.trend === "up" ? <ArrowUp className="h-4 w-4" /> : 
                     stat.trend === "down" ? <ArrowDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  </div>
               </div>
               <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tighter">{stat.value}</span>
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    stat.color === "green" ? "bg-green-50 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : 
                    stat.color === "yellow" ? "bg-yellow-50 shadow-[0_0_8px_rgba(234,179,8,0.6)]" : "bg-red-50 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                  )} />
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Banner Control */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <Layout className="h-5 w-5" />
             </div>
             <h2 className="text-xl font-black tracking-tight uppercase">Главный баннер</h2>
          </div>
          <Card className="rounded-[2.5rem] border-2 shadow-sm">
            <CardContent className="p-10">
              {config ? <BannerForm config={config} /> : <div className="h-64 animate-pulse bg-muted rounded-2xl" />}
            </CardContent>
          </Card>
        </section>

        {/* Ad Control */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <BarChart3 className="h-5 w-5" />
             </div>
             <h2 className="text-xl font-black tracking-tight uppercase">Рекламный Автопилот</h2>
          </div>
          <Card className="rounded-[2.5rem] border-2 shadow-sm">
            <CardContent className="p-10">
              <AdvertisingForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
