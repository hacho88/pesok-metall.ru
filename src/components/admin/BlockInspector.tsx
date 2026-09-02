"use client";

import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import { getBlockSchema } from "@/lib/block-schemas";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { PageBlock } from "@/types/page-builder";

interface BlockInspectorProps {
  block: PageBlock;
  index: number;
  total: number;
  onChange: (block: PageBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (dir: -1 | 1) => void;
}

interface ItemFieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select";
  options?: { value: string; label: string }[];
}

const ITEM_FIELDS: Partial<Record<PageBlock["type"], ItemFieldConfig[]>> = {
  Advantages: [
    { key: "icon", label: "Иконка", type: "select", options: [
      { value: "truck", label: "Грузовик" },
      { value: "clock", label: "Часы" },
      { value: "shield", label: "Щит" },
      { value: "badge", label: "Значок" },
      { value: "package", label: "Пакет" },
      { value: "calculator", label: "Калькулятор" },
      { value: "scale", label: "Весы" },
      { value: "wallet", label: "Кошелёк" },
      { value: "zap", label: "Молния" },
      { value: "check", label: "Галочка" },
    ] },
    { key: "title", label: "Заголовок", type: "text" },
    { key: "description", label: "Описание", type: "textarea" },
  ],
  Stats: [
    { key: "value", label: "Значение", type: "text" },
    { key: "label", label: "Подпись", type: "text" },
  ],
  Faq: [
    { key: "question", label: "Вопрос", type: "text" },
    { key: "answer", label: "Ответ", type: "textarea" },
  ],
  Testimonials: [
    { key: "name", label: "Имя", type: "text" },
    { key: "role", label: "Роль / город", type: "text" },
    { key: "text", label: "Текст отзыва", type: "textarea" },
    { key: "rating", label: "Рейтинг (1-5)", type: "number" },
  ],
};

export function BlockInspector({
  block,
  index,
  total,
  onChange,
  onDelete,
  onDuplicate,
  onMove,
}: BlockInspectorProps) {
  const schema = getBlockSchema(block.type);
  if (!schema) return null;

  const Icon = getIcon(schema.icon);
  const itemFields = ITEM_FIELDS[block.type];

  function updateField(key: string, value: unknown) {
    onChange({ ...block, [key]: value } as PageBlock);
  }

  function updateItem(itemIndex: number, key: string, value: unknown) {
    const items = (block as unknown as Record<string, unknown[]>).items ?? [];
    const next = items.map((item, i) =>
      i === itemIndex ? { ...(item as object), [key]: value } : item
    );
    updateField("items", next);
  }

  function addItem() {
    const items = (block as unknown as Record<string, unknown[]>).items ?? [];
    const emptyItem = Object.fromEntries(
      (itemFields ?? []).map((f) => [
        f.key,
        f.type === "number" ? 0 : f.type === "select" ? f.options?.[0]?.value ?? "" : "",
      ])
    );
    updateField("items", [...items, emptyItem]);
  }

  function removeItem(itemIndex: number) {
    const items = (block as unknown as Record<string, unknown[]>).items ?? [];
    updateField("items", items.filter((_, i) => i !== itemIndex));
  }

  function updateZone(zoneIndex: number, value: string) {
    const zones = (block as unknown as Record<string, string[]>).zones ?? [];
    updateField("zones", zones.map((z, i) => (i === zoneIndex ? value : z)));
  }

  function addZone() {
    const zones = (block as unknown as Record<string, string[]>).zones ?? [];
    updateField("zones", [...zones, "Новый город"]);
  }

  function removeZone(zoneIndex: number) {
    const zones = (block as unknown as Record<string, string[]>).zones ?? [];
    updateField("zones", zones.filter((_, i) => i !== zoneIndex));
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l bg-card">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight">{schema.label}</h2>
            <p className="text-xs text-muted-foreground">
              Блок {index + 1} из {total}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(-1)} disabled={index === 0} title="Вверх">
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(1)} disabled={index === total - 1} title="Вниз">
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate} title="Дублировать">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete} title="Удалить">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {schema.fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={`field-${field.key}`}>{field.label}</Label>
            {field.type === "textarea" ? (
              <Textarea
                id={`field-${field.key}`}
                value={String((block as unknown as Record<string, unknown>)[field.key] ?? "")}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            ) : field.type === "number" ? (
              <Input
                id={`field-${field.key}`}
                type="number"
                value={Number((block as unknown as Record<string, unknown>)[field.key] ?? 0)}
                onChange={(e) => updateField(field.key, Number(e.target.value))}
              />
            ) : field.type === "select" ? (
              <Select
                id={`field-${field.key}`}
                value={String((block as unknown as Record<string, unknown>)[field.key] ?? "")}
                onChange={(e) => updateField(field.key, e.target.value)}
              >
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                id={`field-${field.key}`}
                value={String((block as unknown as Record<string, unknown>)[field.key] ?? "")}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            )}
            {field.help && (
              <p className="text-xs text-muted-foreground">{field.help}</p>
            )}
          </div>
        ))}

        {/* Редактор коллекций */}
        {itemFields && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Элементы</Label>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus />
                Добавить
              </Button>
            </div>
            {(block as unknown as Record<string, unknown[]>).items?.map((item, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Элемент {i + 1}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => removeItem(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {itemFields.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs">{f.label}</Label>
                    {f.type === "textarea" ? (
                      <Textarea
                        value={String((item as Record<string, unknown>)[f.key] ?? "")}
                        onChange={(e) => updateItem(i, f.key, e.target.value)}
                      />
                    ) : f.type === "number" ? (
                      <Input
                        type="number"
                        value={Number((item as Record<string, unknown>)[f.key] ?? 0)}
                        onChange={(e) => updateItem(i, f.key, Number(e.target.value))}
                      />
                    ) : f.type === "select" ? (
                      <Select
                        value={String((item as Record<string, unknown>)[f.key] ?? "")}
                        onChange={(e) => updateItem(i, f.key, e.target.value)}
                      >
                        {f.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        value={String((item as Record<string, unknown>)[f.key] ?? "")}
                        onChange={(e) => updateItem(i, f.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Редактор зон доставки */}
        {block.type === "DeliveryZones" && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Города</Label>
              <Button variant="outline" size="sm" onClick={addZone}>
                <Plus />
                Добавить
              </Button>
            </div>
            {(block as unknown as Record<string, string[]>).zones?.map((zone, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={zone}
                  onChange={(e) => updateZone(i, e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-destructive"
                  onClick={() => removeZone(i)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
