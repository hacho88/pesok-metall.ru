"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Loader2,
  Monitor,
  MonitorSmartphone,
  Save,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
} from "lucide-react";
import { BlockPalette } from "@/components/admin/BlockPalette";
import { BlockInspector } from "@/components/admin/BlockInspector";
import { PromptGenerator } from "@/components/admin/PromptGenerator";
import { PreviewBlock } from "@/components/admin/PreviewRenderer";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { THEME_CLASSES } from "@/lib/page-builder";
import { THEME_OPTIONS, createBlock } from "@/lib/block-schemas";
import { cn } from "@/lib/utils";
import type { PageBlock, PageConfig, ThemePreset } from "@/types/page-builder";

type DeviceMode = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: "max-w-7xl",
  tablet: "max-w-3xl",
  mobile: "max-w-sm",
};

const DEVICE_ICONS: Record<DeviceMode, typeof Monitor> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

interface PageEditorProps {
  initialConfig: PageConfig;
}

export function PageEditor({ initialConfig }: PageEditorProps) {
  const [config, setConfig] = useState<PageConfig>(initialConfig);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragType, setDragType] = useState<PageBlock["type"] | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);

  // Если БД недоступна, редактор сохраняет конфиг в localStorage — восстанавливаем его
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`page-config:${initialConfig.slug}`);
      if (saved) {
        const parsed = JSON.parse(saved) as PageConfig;
        if (parsed && Array.isArray(parsed.blocks)) {
          setConfig(parsed);
        }
      }
    } catch {
      // localStorage недоступен — работаем с серверным конфигом
    }
  }, [initialConfig.slug]);

  const themeClass = THEME_CLASSES[config.theme] ?? THEME_CLASSES["industrial-orange"];

  const updateBlock = useCallback((index: number, block: PageBlock) => {
    setConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b, i) => (i === index ? block : b)),
    }));
    setSaveState("idle");
  }, []);

  const addBlock = useCallback((type: PageBlock["type"], atIndex?: number) => {
    const block = createBlock(type);
    setConfig((prev) => {
      const blocks = [...prev.blocks];
      const insertAt = atIndex ?? blocks.length;
      blocks.splice(insertAt, 0, block);
      return { ...prev, blocks };
    });
    setSelectedIndex(atIndex ?? config.blocks.length);
    setSaveState("idle");
  }, [config.blocks.length]);

  const removeBlock = useCallback((index: number) => {
    setConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index),
    }));
    setSelectedIndex(null);
    setSaveState("idle");
  }, []);

  const duplicateBlock = useCallback((index: number) => {
    setConfig((prev) => {
      const blocks = [...prev.blocks];
      blocks.splice(index + 1, 0, { ...blocks[index] });
      return { ...prev, blocks };
    });
    setSelectedIndex(index + 1);
    setSaveState("idle");
  }, []);

  const moveBlock = useCallback((index: number, dir: -1 | 1) => {
    setConfig((prev) => {
      const blocks = [...prev.blocks];
      const target = index + dir;
      if (target < 0 || target >= blocks.length) return prev;
      [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
      return { ...prev, blocks };
    });
    setSelectedIndex(index + dir);
    setSaveState("idle");
  }, []);

  const handleDrop = useCallback(
    (targetIndex: number) => {
      if (dragType) {
        addBlock(dragType, targetIndex);
      } else if (dragIndex !== null && dragIndex !== targetIndex) {
        setConfig((prev) => {
          const blocks = [...prev.blocks];
          const [moved] = blocks.splice(dragIndex, 1);
          blocks.splice(targetIndex, 0, moved);
          return { ...prev, blocks };
        });
        setSelectedIndex(targetIndex);
        setSaveState("idle");
      }
      setDragIndex(null);
      setDragType(null);
    },
    [addBlock, dragIndex, dragType]
  );

  async function save() {
    setSaving(true);
    setSaveState("idle");
    try {
      const response = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: config.slug,
          theme: config.theme,
          blocks: config.blocks,
        }),
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      setSaveState("saved");
    } catch {
      // БД недоступна — сохраняем локально, чтобы работа не пропала
      try {
        localStorage.setItem(
          `page-config:${config.slug}`,
          JSON.stringify(config)
        );
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    } finally {
      setSaving(false);
    }
  }

  const DeviceIcon = DEVICE_ICONS[device];

  return (
    <div className="flex h-screen flex-col bg-muted/40">
      {/* Верхняя панель */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-card px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Страницы
          </Link>
          <div className="h-5 w-px bg-border" />
          <div>
            <p className="text-sm font-semibold leading-tight">{config.slug}</p>
            <p className="text-xs text-muted-foreground">
              {config.blocks.length} блоков
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Генерация по промпту */}
          <Button
            variant="outline"
            onClick={() => setPromptOpen(true)}
            title="Собрать страницу из текстового описания"
          >
            <Sparkles />
            По промпту
          </Button>

          {/* Тема */}
          <Select
            value={config.theme}
            onChange={(e) => {
              setConfig({ ...config, theme: e.target.value as ThemePreset });
              setSaveState("idle");
            }}
            className="w-44"
          >
            {THEME_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>

          {/* Устройства */}
          <div className="flex items-center gap-0.5 rounded-lg border bg-background p-0.5">
            {(Object.keys(DEVICE_WIDTHS) as DeviceMode[]).map((mode) => {
              const Icon = DEVICE_ICONS[mode];
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDevice(mode)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                    device === mode
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title={mode}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          {/* Сохранение */}
          <Button onClick={save} disabled={saving} className="min-w-32">
            {saving ? (
              <Loader2 className="animate-spin" />
            ) : saveState === "saved" ? (
              <Check />
            ) : (
              <Save />
            )}
            {saving ? "Сохранение..." : saveState === "saved" ? "Сохранено" : "Сохранить"}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <BlockPalette
          onAdd={(type) => addBlock(type)}
          onDragStart={(type) => setDragType(type)}
        />

        {/* Канвас */}
        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          <div
            className={cn(
              "mx-auto space-y-6 rounded-xl bg-background p-6 shadow-sm ring-1 ring-border transition-all",
              DEVICE_WIDTHS[device]
            )}
          >
            <div className={themeClass}>
              {config.blocks.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-24 text-center">
                  <MonitorSmartphone className="h-12 w-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">
                    Страница пуста. Перетащите блоки из палитры слева.
                  </p>
                </div>
              ) : (
                config.blocks.map((block, index) => {
                  const isSelected = selectedIndex === index;
                  return (
                    <div
                      key={`${block.type}-${index}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(index));
                        setDragIndex(index);
                        setDragType(null);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDrop(index);
                      }}
                      onClick={() => setSelectedIndex(index)}
                      className={cn(
                        "group relative cursor-pointer rounded-lg transition-all",
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:ring-2 hover:ring-primary/40 hover:ring-offset-2"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute -top-3 left-3 z-10 flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground shadow">
                          <span>{block.type}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBlock(index);
                            }}
                            className="ml-1 rounded p-0.5 hover:bg-primary-foreground/20"
                            title="Удалить блок"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <PreviewBlock block={block} />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>

        {/* Инспектор */}
        {selectedIndex !== null && config.blocks[selectedIndex] ? (
          <BlockInspector
            block={config.blocks[selectedIndex]}
            index={selectedIndex}
            total={config.blocks.length}
            onChange={(block) => updateBlock(selectedIndex, block)}
            onDelete={() => removeBlock(selectedIndex)}
            onDuplicate={() => duplicateBlock(selectedIndex)}
            onMove={(dir) => moveBlock(selectedIndex, dir)}
          />
        ) : (
          <aside className="flex w-80 shrink-0 flex-col items-center justify-center gap-2 border-l bg-card p-6 text-center">
            <MonitorSmartphone className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Выберите блок на канвасе, чтобы редактировать его свойства
            </p>
          </aside>
        )}
      </div>

      <PromptGenerator
        open={promptOpen}
        slug={config.slug}
        theme={config.theme}
        onClose={() => setPromptOpen(false)}
        onGenerated={(generated) => {
          setConfig((prev) => ({ ...prev, theme: generated.theme, blocks: generated.blocks }));
          setSelectedIndex(null);
          setSaveState("idle");
        }}
      />
    </div>
  );
}
