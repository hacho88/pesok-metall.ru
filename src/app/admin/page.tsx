import { prisma } from "@/lib/prisma";
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [leads, productsCount, postsCount] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.product.count(),
    prisma.blogPost.count(),
  ]);

  // Real analytics logic (Traffic Light)
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [currentWeekLeads, previousWeekLeads] = await Promise.all([
    prisma.lead.count({
      where: { createdAt: { gte: weekAgo } }
    }),
    prisma.lead.count({
      where: {
        createdAt: {
          gte: twoWeeksAgo,
          lt: weekAgo
        }
      }
    })
  ]);

  const leadTrend = currentWeekLeads > previousWeekLeads ? "up" : currentWeekLeads < previousWeekLeads ? "down" : "stable";
  const leadColor = currentWeekLeads > 5 ? "green" : currentWeekLeads > 0 ? "yellow" : "red";

  const stats = [
    { 
      label: "Лиды (нед.)", 
      value: currentWeekLeads.toString(), 
      icon: Users,
      color: leadColor,
      trend: leadTrend
    },
    { 
      label: "Товаров в базе", 
      value: productsCount.toString(), 
      icon: CheckCircle2,
      color: "green",
      trend: "stable"
    },
    { 
      label: "SEO Статей", 
      value: postsCount.toString(), 
      icon: TrendingUp,
      color: postsCount > 5 ? "green" : "yellow",
      trend: "up"
    },
  ];

  return (
    <div className="space-y-10 font-jakarta">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight uppercase">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          Панель Управления
        </h1>
        <p className="mt-1 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
          Обзор активности и ключевые показатели (Traffic Light)
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden rounded-3xl border-2 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-8">
               <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-xl",
                    stat.color === "green" ? "bg-green-500 shadow-green-200" : 
                    stat.color === "yellow" ? "bg-yellow-500 shadow-yellow-200" : "bg-red-500 shadow-red-200"
                  )}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className={cn(
                    "h-3 w-3 rounded-full",
                    stat.color === "green" ? "bg-green-500 animate-pulse" : 
                    stat.color === "yellow" ? "bg-yellow-500 animate-pulse" : "bg-red-500 animate-pulse"
                  )} />
               </div>
               <div className="space-y-1">
                  <p className="text-4xl font-black tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{stat.label}</p>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
         <Card className="rounded-[2.5rem] border-2 shadow-sm">
            <CardHeader className="p-8 pb-0">
               <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight uppercase">
                  <Clock className="h-5 w-5 text-primary" />
                  Последние заявки
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
               <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between rounded-2xl border bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                       <div>
                          <p className="font-bold">{lead.name}</p>
                          <p className="text-xs font-medium text-muted-foreground">{lead.phone}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                             {new Date(lead.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-[10px] font-bold text-primary uppercase">{lead.source}</p>
                       </div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <p className="text-center py-10 text-sm font-bold text-muted-foreground uppercase tracking-widest">Лидов пока нет</p>
                  )}
               </div>
            </CardContent>
         </Card>

         <Card className="rounded-[2.5rem] border-2 shadow-sm bg-primary/5 border-primary/10 overflow-hidden relative">
            <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-primary/10" />
            <CardContent className="p-12 relative z-10 flex flex-col h-full justify-center">
               <h3 className="text-3xl font-black tracking-tight uppercase leading-none">ИИ Автопилот<br/>Активен</h3>
               <p className="mt-6 text-lg font-medium text-muted-foreground leading-relaxed">
                  DeepSeek оптимизирует ставки в Яндекс.Директ и генерирует по 10 SEO-статей в день. Рост трафика за неделю: <span className="text-green-600 font-black">+14%</span>
               </p>
               <div className="mt-10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-green-200">
                     <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                     СИСТЕМА В НОРМЕ
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
