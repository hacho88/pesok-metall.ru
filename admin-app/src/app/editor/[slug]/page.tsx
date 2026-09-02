"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageEditor } from "@/components/admin/PageEditor";
import { getPageConfig } from "@/lib/api";
import type { PageConfig } from "@/types/page-builder";

const FALLBACK_CONFIG: PageConfig = {
  slug: "home",
  theme: "industrial-orange",
  blocks: [],
};

export default function EditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getPageConfig(slug)
      .then((data) => setConfig(data.config))
      .catch((e) => {
        // Страницы ещё нет в БД — открываем пустой редактор
        setConfig({ ...FALLBACK_CONFIG, slug });
        setError(e instanceof Error ? e.message : String(e));
      });
  }, [slug]);

  if (!config) {
    return (
      <div className="flex h-[80vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" />
        Загрузка конфига…
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          Конфиг не найден на сервере — открыт пустой редактор ({error}). После
          сохранения страница будет создана.
        </div>
      )}
      <PageEditor initialConfig={config} />
    </>
  );
}
