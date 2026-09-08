import { prisma } from "@/lib/prisma";
import { 
  Megaphone, 
  BarChart3, 
  Send,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdvertisingForm } from "./AdvertisingForm";
import { ChannelsConnect } from "./ChannelsConnect";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  const settings = await prisma.shopSettings.findFirst();

  // Calculate conversion rate trend (mocked for demo)
  const stats = [
    { label: "Клики", value: "1,280", trend: "up", color: "green" },
    { label: "Лиды", value: leads.length.toString(), trend: "stable", color: "yellow" },
    { label: "Конверсия", value: "4.2%", trend: "down", color: "red" },
  ];

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
                    stat.color === "green" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : 
                    stat.color === "yellow" ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                  )} />
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

      {/* Подключение каналов: MAX + Email */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <Send className="h-5 w-5" />
           </div>
           <div>
             <h2 className="text-xl font-black tracking-tight uppercase">Подключение каналов</h2>
             <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
               Заказы приходят в мессенджер MAX и на электронную почту
             </p>
           </div>
        </div>
        <Card className="rounded-[2.5rem] border-2 shadow-sm">
          <CardContent className="p-10">
            <ChannelsConnect
              initial={{
                maxBotToken: settings?.maxBotToken ?? null,
                maxChatId: settings?.maxChatId ?? null,
                notifyEmail: settings?.notifyEmail ?? null,
                smtpHost: settings?.smtpHost ?? null,
                smtpPort: settings?.smtpPort?.toString() ?? "",
                smtpUser: settings?.smtpUser ?? null,
                smtpPass: settings?.smtpPass ?? null,
                smtpFrom: settings?.smtpFrom ?? null,
              }}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

import { cn } from "@/lib/utils";
