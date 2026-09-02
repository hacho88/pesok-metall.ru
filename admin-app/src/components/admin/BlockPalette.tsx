"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { BLOCK_SCHEMAS } from "@/lib/block-schemas";
import { getIcon } from "@/lib/icons";
import type { PageBlock } from "@/types/page-builder";
import { Input } from "@/components/ui/input";

interface BlockPaletteProps {
  onAdd: (type: PageBlock["type"]) => void;
  onDragStart: (type: PageBlock["type"]) => void;
}

const GROUP_LABELS: Record<string, string> = {
  hero: "Hero",
  commerce: "Commerce",
  trust: "Trust",
  content: "Content",
  ai: "AI / Automation",
};

const GROUP_OF: Record<string, string> = {
  MainHeroBanner: "hero",
  CatalogSections: "commerce",
  LiveProductGrid: "commerce",
  InteractiveCalculator: "commerce",
  InvoiceGeneratorCard: "commerce",
  Advantages: "trust",
  Stats: "trust",
  DeliveryZones: "trust",
  Testimonials: "trust",
  Faq: "content",
  AiChatWidget: "ai",
};

export function BlockPalette({ onAdd, onDragStart }: BlockPaletteProps) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = BLOCK_SCHEMAS.filter(
      (s) =>
        !q ||
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
    const order = ["hero", "commerce", "trust", "content", "ai"];
    const map = new Map<string, typeof filtered>();
    for (const s of filtered) {
      const group = GROUP_OF[s.type] ?? "commerce";
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(s);
    }
    return order
      .filter((g) => map.has(g))
      .map((g) => ({ group: g, schemas: map.get(g)! }));
  }, [query]);

  return (
    <aside className="flex w-full shrink-0 flex-col border-b bg-card md:w-72 md:border-b-0 md:border-r">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Блоки</h2>
        <p className="text-xs text-muted-foreground">
          Перетащите на канвас или добавьте кликом
        </p>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск блоков…"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="flex flex-1 gap-3 overflow-x-auto p-3 md:flex-col md:overflow-y-auto">
        {groups.map(({ group, schemas }) => (
          <div key={group} className="shrink-0 md:shrink">
            <p className="mb-1.5 px-1 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
              {GROUP_LABELS[group]}
            </p>
            <div className="space-y-1.5 md:space-y-1">
              {schemas.map((schema) => {
                const Icon = getIcon(schema.icon);
                return (
                  <div
                    key={schema.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", schema.type);
                      onDragStart(schema.type);
                    }}
                    className="group flex shrink-0 cursor-grab items-center gap-2 rounded-lg border bg-card p-2 transition-colors hover:border-primary/50 hover:bg-accent/50 active:cursor-grabbing md:w-full md:items-start md:gap-3 md:p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary md:h-9 md:w-9">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-tight md:text-sm">
                        {schema.label}
                      </p>
                      <p className="mt-0.5 hidden line-clamp-2 text-xs text-muted-foreground md:block">
                        {schema.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAdd(schema.type)}
                      className="rounded-md p-1 text-muted-foreground opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground md:opacity-0 md:group-hover:opacity-100"
                      title={`Добавить «${schema.label}»`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Блоки не найдены
          </p>
        )}
      </div>
    </aside>
  );
}
