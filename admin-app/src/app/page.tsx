"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowRight,
  PenTool,
  Truck,
  Megaphone,
} from "lucide-react";
import {
  listProducts,
  listCategories,
  listLeads,
  listPages,
  API_BASE,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Stats {
  products: number;
  categories: number;
  leads: number;
  pages: number;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  status: string;
  createdAt: string;
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      listProducts().catch(() => ({ total: 0 })),
      listCategories().catch(() => ({ categories: [], sections: [] })),
      listLeads().catch(() => ({ leads: [], total: 0 })),
      listPages().catch(() => ({ pages: [] })),
    ])
      .then(([productsRes, catRes, leadsRes, pagesRes]) => {
        setStats({
          products: (productsRes as any).total ?? 0,
          categories: (catRes as any).categories?.length ?? 0,
          leads: (leadsRes as any).total ?? 0,
          pages: (pagesRes as any).pages?.length ?? 0,
        });
        setRecentLeads((leadsRes as any).leads ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const statCards = [
    { label: "Товары", value: stats?.products ?? "—", icon: Package, href: "/products", color: "text-blue-600" },
    { label: "Категории", value: stats?.categories ?? "—", icon: FolderTree, href: "/categories", color: "text-green-600" },
    { label: "Заказы", value: stats?.leads ?? "—", icon: ShoppingCart, href: "/orders", color: "text-orange-600" },
    { label: "Лиды", value: stats?.leads ?? "—", icon: Users, href: "/leads", color: "text-purple-600" },
  ];

  const quickActions = [
    { label: "Товары", icon: Package, href: "/products", desc: "Управление каталогом" },
    { label: "Категории", icon: FolderTree, href: "/categories", desc: "Структура каталога" },
    { label: "Конструктор", icon: PenTool, href: "/editor/home", desc: "Редактор страниц" },
    { label: "AI Блог", icon: PenTool, href: "/blog", desc: "Генерация статей" },
    { label: "Автопарк", icon: Truck, href: "/fleet", desc: "Логистика" },
    { label: "Реклама", icon: Megaphone, href: "/advertising", desc: "Кампании" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          PESOK.METALL — панель управления. API: <span className="font-mono text-xs">{API_BASE}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          Ошибка загрузки: {error}. Проверьте, что основной сайт запущен на порту 3001.
        </div>
      )}

      {/* Статистика */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-3xl font-black tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Быстрые действия */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-bold">Быстрые действия</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Последние лиды */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Последние заявки</h2>
          <Link href="/leads">
            <Button variant="outline" size="sm">Все заявки</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Заявок пока нет
              </div>
            ) : (
              <div className="divide-y">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{lead.name || "Без имени"}</p>
                      <p className="text-sm text-muted-foreground">{lead.phone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                        {lead.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
