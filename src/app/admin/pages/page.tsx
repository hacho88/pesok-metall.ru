import Link from "next/link";
import { LayoutTemplate, Plus, Settings2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { THEME_OPTIONS } from "@/lib/block-schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const THEME_LABELS = Object.fromEntries(
  THEME_OPTIONS.map((t) => [t.value, t.label])
) as Record<string, string>;

interface AdminPageRow {
  slug: string;
  theme: string;
  blockCount: number;
  updatedAt: Date;
}

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let pages: AdminPageRow[] = [];
  let dbAvailable = true;

  try {
    const rows = await prisma.pageConfig.findMany({ orderBy: { slug: "asc" } });
    pages = rows.map((r) => ({
      slug: r.slug,
      theme: r.theme,
      blockCount: Array.isArray(r.blocks) ? r.blocks.length : 0,
      updatedAt: r.updatedAt,
    }));
  } catch {
    dbAvailable = false;
    pages = [
      {
        slug: "home",
        theme: "industrial-orange",
        blockCount: 10,
        updatedAt: new Date(),
      },
    ];
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Settings2 className="h-6 w-6 text-primary" />
            Конструктор страниц
          </h1>
          <p className="mt-1 text-muted-foreground">
            Визуальный редактор интерфейса: блоки, темы, контент — как в Figma.
          </p>
        </div>
        <Link href="/admin/editor/home">
          <Button>
            <Plus />
            Новая страница
          </Button>
        </Link>
      </div>

      {!dbAvailable && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          База данных недоступна — редактор работает в демо-режиме, изменения
          сохраняются локально в браузере (localStorage).
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {pages.map((page) => (
          <Card key={page.slug} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LayoutTemplate className="h-4 w-4 text-primary" />
                {page.slug}
              </CardTitle>
              <CardDescription>
                {THEME_LABELS[page.theme] ?? page.theme} ·{" "}
                {page.blockCount} блоков
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge variant="secondary">
                Обновлено:{" "}
                {page.updatedAt.toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Badge>
              <Link href={`/admin/editor/${page.slug}`}>
                <Button variant="outline" size="sm">
                  Редактировать
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
