"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutTemplate, Loader2, Plus, Settings2 } from "lucide-react";
import { listPages, API_BASE, type AdminPageRow } from "@/lib/api";
import { THEME_OPTIONS } from "@/lib/block-schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const THEME_LABELS = Object.fromEntries(
  THEME_OPTIONS.map((t) => [t.value, t.label])
) as Record<string, string>;

export default function AdminHomePage() {
  const [pages, setPages] = useState<AdminPageRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPages()
      .then((data) => setPages(data.pages))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Settings2 className="h-6 w-6 text-primary" />
            Конструктор страниц
          </h1>
          <p className="mt-1 text-muted-foreground">
            Визуальный редактор интерфейса: блоки, темы, контент, генерация по
            промпту. API: <span className="font-mono text-xs">{API_BASE}</span>
          </p>
        </div>
        <Link href="/editor/home">
          <Button>
            <Plus />
            Новая страница
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          Не удалось загрузить страницы: {error}. Проверьте, что основной сайт
          запущен и в admin-app/.env задан NEXT_PUBLIC_API_URL.
        </div>
      )}

      {!pages && !error && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          Загрузка страниц…
        </div>
      )}

      {pages && (
        <div className="grid gap-4 sm:grid-cols-2">
          {pages.map((page) => (
            <Card key={page.slug} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <LayoutTemplate className="h-4 w-4 text-primary" />
                  {page.slug}
                </CardTitle>
                <CardDescription>
                  {THEME_LABELS[page.theme] ?? page.theme} · {page.blockCount}{" "}
                  блоков
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge variant="secondary">
                  Обновлено:{" "}
                  {new Date(page.updatedAt).toLocaleDateString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Badge>
                <Link href={`/editor/${page.slug}`}>
                  <Button variant="outline" size="sm">
                    Редактировать
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
