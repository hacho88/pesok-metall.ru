"use client";

import { Plus } from "lucide-react";
import { BLOCK_SCHEMAS } from "@/lib/block-schemas";
import { getIcon } from "@/lib/icons";
import type { PageBlock } from "@/types/page-builder";

interface BlockPaletteProps {
  onAdd: (type: PageBlock["type"]) => void;
  onDragStart: (type: PageBlock["type"]) => void;
}

export function BlockPalette({ onAdd, onDragStart }: BlockPaletteProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Блоки</h2>
        <p className="text-xs text-muted-foreground">
          Перетащите на канвас или добавьте кликом
        </p>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {BLOCK_SCHEMAS.map((schema) => {
          const Icon = getIcon(schema.icon);
          return (
            <div
              key={schema.type}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", schema.type);
                onDragStart(schema.type);
              }}
              className="group flex cursor-grab items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-accent/50 active:cursor-grabbing"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{schema.label}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {schema.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAdd(schema.type)}
                className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-primary hover:text-primary-foreground group-hover:opacity-100"
                title={`Добавить «${schema.label}»`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
