"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import {
  DEFAULT_HERO_CONFIG,
  FONT_WEIGHTS,
  HERO_LAYOUT_LABELS,
  type HeroAlign,
  type HeroButtonElement,
  type HeroConfig,
  type HeroElement,
  type HeroHeadingElement,
  type HeroLayout,
  type HeroParagraphElement,
  type HeroBackgroundType,
  normalizeHeroConfig,
  zeroSpacing,
} from "./types";
import {
  ColorField,
  Field,
  Select,
  Slider,
  SpacingEditor,
  TextInput,
  UploadButton,
} from "./controls";

const BG_TYPES: { value: HeroBackgroundType; label: string }[] = [
  { value: "solid", label: "Цвет" },
  { value: "gradient", label: "Градиент" },
  { value: "image", label: "Картинка" },
  { value: "video", label: "Видео" },
];

const ELEMENT_LABELS: Record<HeroElement["type"], string> = {
  heading: "Заголовок (H1)",
  paragraph: "Подзаголовок",
  button: "Кнопка (CTA)",
  media: "Медиа",
};

function Accordion({
  title,
  children,
  open = false,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="group rounded-xl border border-border bg-card">
      <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-3 text-sm font-black uppercase tracking-wider text-foreground marker:content-none">
        {title}
        <span className="text-muted-foreground transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>
      <div className="space-y-3 border-t border-border/60 p-4">{children}</div>
    </details>
  );
}

function TypographyControls({
  fontSize,
  fontWeight,
  align,
  color,
  onChange,
}: {
  fontSize: number;
  fontWeight: number;
  align?: HeroAlign;
  color?: string;
  onChange: (p: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2.5">
      <Slider
        label="Размер шрифта"
        min={10}
        max={72}
        value={fontSize}
        suffix="px"
        onChange={(fontSize) => onChange({ fontSize })}
      />
      <Field label="Насыщенность (font-weight)">
        <Select
          value={String(fontWeight)}
          options={FONT_WEIGHTS.map((w) => ({ value: String(w), label: String(w) }))}
          onChange={(v) => onChange({ fontWeight: Number(v) })}
        />
      </Field>
      {color !== undefined && (
        <ColorField
          label="Цвет текста"
          value={color}
          onChange={(color) => onChange({ color })}
        />
      )}
      {align !== undefined && (
        <Field label="Выравнивание">
          <Select
            value={align}
            options={[
              { value: "left", label: "По левому краю" },
              { value: "center", label: "По центру" },
              { value: "right", label: "По правому краю" },
            ]}
            onChange={(align) => onChange({ align })}
          />
        </Field>
      )}
    </div>
  );
}

export function HeroAdmin({
  config,
  setConfig,
}: {
  config: HeroConfig;
  setConfig: (c: HeroConfig) => void;
}) {
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const saveConfig = async () => {
    setSaveState("saving");
    try {
      const res = await fetch("/api/admin/hero-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("error");
    }
  };

  const patchBg = (p: Partial<HeroConfig["background"]>) =>
    setConfig({ ...config, background: { ...config.background, ...p } });

  const setElements = (elements: HeroElement[]) =>
    setConfig({ ...config, elements });

  const updateElement = (id: string, p: Record<string, unknown>) =>
    setConfig({
      ...config,
      elements: config.elements.map((el) =>
        el.id === id ? ({ ...el, ...p } as HeroElement) : el,
      ),
    });

  const removeElement = (id: string) =>
    setConfig({ ...config, elements: config.elements.filter((e) => e.id !== id) });

  const moveElement = (index: number, dir: -1 | 1) => {
    const next = [...config.elements];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setElements(next);
  };

  const addElement = (type: HeroElement["type"]) => {
    const id = Math.random().toString(36).slice(2, 10);
    let el: HeroElement;
    if (type === "heading") {
      el = {
        id,
        type: "heading",
        text: "Новый заголовок",
        fontSize: 40,
        fontWeight: 900,
        color: "#ffffff",
        align: "left",
        margin: { top: 0, right: 0, bottom: 12, left: 0 },
        padding: zeroSpacing(),
      } satisfies HeroHeadingElement;
    } else if (type === "paragraph") {
      el = {
        id,
        type: "paragraph",
        text: "Новый текст",
        fontSize: 16,
        fontWeight: 400,
        color: "#e2e8f0",
        align: "left" as HeroAlign,
        margin: zeroSpacing(),
        padding: zeroSpacing(),
      } satisfies HeroParagraphElement;
    } else if (type === "button") {
      el = {
        id,
        type: "button",
        text: "Кнопка",
        href: "/shop",
        bgColor: "#2563eb",
        textColor: "#ffffff",
        hoverBgColor: "#1d4ed8",
        hoverScale: 1.05,
        fontSize: 15,
        fontWeight: 700,
        borderRadius: 12,
        align: "left" as HeroAlign,
        margin: zeroSpacing(),
        padding: zeroSpacing(),
      } satisfies HeroButtonElement;
    } else {
      el = {
        id,
        type: "media",
        mediaType: "image",
        src: "",
        width: 100,
        height: 280,
        objectFit: "cover" as const,
        borderRadius: 16,
        align: "center" as HeroAlign,
        margin: zeroSpacing(),
        padding: zeroSpacing(),
      };
    }
    setElements([...config.elements, el]);
  };

  const buttonCount = config.elements.filter((e) => e.type === "button").length;

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonDraft);
      setConfig(normalizeHeroConfig(parsed));
      setJsonError(null);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : String(e));
    }
  };

  const copyJson = () =>
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));

  return (
    <aside className="flex w-[400px] shrink-0 flex-col border-r bg-muted/30">
      <div className="flex items-center justify-between border-b bg-card px-4 py-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider">
            Hero-конфигуратор
          </h2>
          <p className="text-xs text-muted-foreground">
            Изменения применяются мгновенно
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href="/"
            target="_blank"
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            Главная ↗
          </a>
          <button
            type="button"
            onClick={saveConfig}
            disabled={saveState === "saving"}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-colors ${
              saveState === "saved"
                ? "bg-emerald-600"
                : saveState === "error"
                  ? "bg-red-600"
                  : "bg-primary hover:opacity-90"
            } disabled:opacity-60`}
          >
            {saveState === "saved"
              ? "Сохранено ✓"
              : saveState === "error"
                ? "Ошибка"
                : saveState === "saving"
                  ? "Сохранение…"
                  : "Сохранить"}
          </button>
          <button
            type="button"
            onClick={() => setConfig(DEFAULT_HERO_CONFIG)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            Сброс
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        <Accordion title="Фон" open>
          <div className="grid grid-cols-4 gap-1.5">
            {BG_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => patchBg({ type: t.value })}
                className={`rounded-lg border px-2 py-2 text-xs font-bold transition-colors ${
                  config.background.type === t.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {config.background.type === "solid" && (
            <ColorField
              label="Цвет фона"
              value={config.background.color}
              onChange={(color) => patchBg({ color })}
            />
          )}

          {config.background.type === "gradient" && (
            <>
              <ColorField
                label="Градиент: от"
                value={config.background.gradientFrom}
                onChange={(gradientFrom) => patchBg({ gradientFrom })}
              />
              <ColorField
                label="Градиент: до"
                value={config.background.gradientTo}
                onChange={(gradientTo) => patchBg({ gradientTo })}
              />
              <Slider
                label="Угол градиента"
                min={0}
                max={360}
                value={config.background.gradientAngle}
                suffix="°"
                onChange={(gradientAngle) => patchBg({ gradientAngle })}
              />
            </>
          )}

          {config.background.type === "image" && (
            <Field label="Ссылка на картинку">
              <div className="flex gap-2">
                <TextInput
                  value={config.background.imageUrl}
                  placeholder="https://... или /uploads/..."
                  onChange={(imageUrl) => patchBg({ imageUrl })}
                />
                <UploadButton onUploaded={(url) => patchBg({ imageUrl: url })} />
              </div>
            </Field>
          )}

          {config.background.type === "video" && (
            <Field label="Ссылка на видео (.mp4)">
              <TextInput
                value={config.background.videoUrl}
                placeholder="https://.../video.mp4"
                onChange={(videoUrl) => patchBg({ videoUrl })}
              />
            </Field>
          )}

          <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
              Затемнение (Overlay)
            </p>
            <div className="space-y-3">
              <ColorField
                label="Цвет маски"
                value={config.background.overlayColor}
                onChange={(overlayColor) => patchBg({ overlayColor })}
              />
              <Slider
                label="Непрозрачность"
                min={0}
                max={100}
                value={config.background.overlayOpacity}
                suffix="%"
                onChange={(overlayOpacity) => patchBg({ overlayOpacity })}
              />
            </div>
          </div>
        </Accordion>

        <Accordion title="Макет и размеры">
          <Field label="Раскладка блока">
            <Select
              value={config.layout}
              onChange={(layout) => setConfig({ ...config, layout })}
              options={Object.entries(HERO_LAYOUT_LABELS).map(([value, label]) => ({
                value: value as HeroLayout,
                label,
              }))}
            />
          </Field>
          <Slider
            label="Минимальная высота"
            min={280}
            max={900}
            step={10}
            value={config.minHeight}
            suffix="px"
            onChange={(minHeight) => setConfig({ ...config, minHeight })}
          />
        </Accordion>

        <Accordion title="Элементы" open>
          <div className="space-y-2">
            {config.elements.map((el, idx) => (
              <details
                key={el.id}
                className="rounded-xl border border-border bg-background"
              >
                <summary className="flex cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm font-bold marker:content-none">
                  <span className="flex-1 truncate">
                    {ELEMENT_LABELS[el.type]}
                    {el.type !== "media" && el.type !== "button" ? ` — ${el.text.slice(0, 24)}` : ""}
                    {el.type === "button" ? ` — ${el.text}` : ""}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <button
                      type="button"
                      aria-label="Выше"
                      disabled={idx === 0}
                      className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent disabled:opacity-30"
                      onClick={(e) => {
                        e.preventDefault();
                        moveElement(idx, -1);
                      }}
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Ниже"
                      disabled={idx === config.elements.length - 1}
                      className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent disabled:opacity-30"
                      onClick={(e) => {
                        e.preventDefault();
                        moveElement(idx, 1);
                      }}
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Удалить"
                      className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                      onClick={(e) => {
                        e.preventDefault();
                        removeElement(el.id);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </span>
                </summary>

                <div className="space-y-3 border-t border-border/60 p-3">
                  {el.type === "heading" || el.type === "paragraph" ? (
                    <>
                      <Field label={el.type === "heading" ? "Текст заголовка" : "Текст"}>
                        <textarea
                          rows={2}
                          value={el.text}
                          onChange={(e) => updateElement(el.id, { text: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                      </Field>
                      <TypographyControls
                        fontSize={el.fontSize}
                        fontWeight={el.fontWeight}
                        align={el.align}
                        color={el.color}
                        onChange={(p) => updateElement(el.id, p)}
                      />
                    </>
                  ) : null}

                  {el.type === "button" ? (
                    <>
                      <Field label="Текст кнопки">
                        <TextInput
                          value={el.text}
                          onChange={(text) => updateElement(el.id, { text })}
                        />
                      </Field>
                      <Field label="Ссылка (href)">
                        <TextInput
                          value={el.href}
                          onChange={(href) => updateElement(el.id, { href })}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-2">
                        <ColorField
                          label="Фон"
                          value={el.bgColor}
                          onChange={(bgColor) => updateElement(el.id, { bgColor })}
                        />
                        <ColorField
                          label="Текст"
                          value={el.textColor}
                          onChange={(textColor) => updateElement(el.id, { textColor })}
                        />
                      </div>
                      <ColorField
                        label="Фон при наведении"
                        value={el.hoverBgColor}
                        onChange={(hoverBgColor) => updateElement(el.id, { hoverBgColor })}
                      />
                      <Slider
                        label="Скругление"
                        min={0}
                        max={32}
                        value={el.borderRadius}
                        suffix="px"
                        onChange={(borderRadius) => updateElement(el.id, { borderRadius })}
                      />
                      <Slider
                        label="Увеличение при hover"
                        min={1}
                        max={1.3}
                        step={0.01}
                        value={el.hoverScale}
                        suffix="×"
                        onChange={(hoverScale) => updateElement(el.id, { hoverScale })}
                      />
                      <TypographyControls
                        fontSize={el.fontSize}
                        fontWeight={el.fontWeight}
                        align={el.align}
                        onChange={(p) => updateElement(el.id, p)}
                      />
                    </>
                  ) : null}

                  {el.type === "media" ? (
                    <>
                      <Field label="Тип медиа">
                        <Select
                          value={el.mediaType}
                          options={[
                            { value: "image", label: "Картинка" },
                            { value: "video", label: "Видео" },
                          ]}
                          onChange={(mediaType) => updateElement(el.id, { mediaType })}
                        />
                      </Field>
                      <Field label="Ссылка на медиа">
                        <div className="flex gap-2">
                          <TextInput
                            value={el.src}
                            placeholder="https://... или /materials/..."
                            onChange={(src) => updateElement(el.id, { src })}
                          />
                          <UploadButton
                            accept={el.mediaType === "video" ? "video/mp4" : "image/*"}
                            onUploaded={(url) => updateElement(el.id, { src: url })}
                          />
                        </div>
                      </Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Slider
                          label="Ширина"
                          min={10}
                          max={100}
                          value={el.width}
                          suffix="%"
                          onChange={(width) => updateElement(el.id, { width })}
                        />
                        <Slider
                          label="Высота"
                          min={80}
                          max={640}
                          value={el.height}
                          suffix="px"
                          onChange={(height) => updateElement(el.id, { height })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Заполнение">
                          <Select
                            value={el.objectFit}
                            options={[
                              { value: "cover", label: "Cover (заполнить)" },
                              { value: "contain", label: "Contain" },
                            ]}
                            onChange={(objectFit) => updateElement(el.id, { objectFit })}
                          />
                        </Field>
                        <Slider
                          label="Скругление"
                          min={0}
                          max={48}
                          value={el.borderRadius}
                          suffix="px"
                          onChange={(borderRadius) => updateElement(el.id, { borderRadius })}
                        />
                      </div>
                    </>
                  ) : null}

                  <div className="grid grid-cols-1 gap-3 border-t border-border/60 pt-3">
                    <SpacingEditor
                      label="Margin"
                      value={el.margin}
                      onChange={(margin) => updateElement(el.id, { margin })}
                    />
                    <SpacingEditor
                      label="Padding"
                      value={el.padding}
                      onChange={(padding) => updateElement(el.id, { padding })}
                    />
                  </div>
                </div>
              </details>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => addElement("heading")}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Plus className="size-3.5" /> Заголовок
            </button>
            <button
              type="button"
              onClick={() => addElement("paragraph")}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Plus className="size-3.5" /> Подзаголовок
            </button>
            <button
              type="button"
              disabled={buttonCount >= 2}
              onClick={() => addElement("button")}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="size-3.5" /> Кнопка ({buttonCount}/2)
            </button>
            <button
              type="button"
              onClick={() => addElement("media")}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Plus className="size-3.5" /> Медиа
            </button>
          </div>
        </Accordion>

        <Accordion title="JSON-конфиг">
          <div className="space-y-2">
            <textarea
              rows={10}
              value={jsonDraft}
              placeholder="Нажмите «Вставить текущий», отредактируйте и примените"
              onChange={(e) => setJsonDraft(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-2 font-mono text-[11px] outline-none focus:border-primary"
            />
            {jsonError && (
              <p className="text-xs font-semibold text-red-600">Ошибка: {jsonError}</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setJsonDraft(JSON.stringify(config, null, 2));
                  setJsonError(null);
                }}
                className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold transition-colors hover:border-primary/40 hover:text-primary"
              >
                Вставить текущий
              </button>
              <button
                type="button"
                onClick={applyJson}
                className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Применить JSON
              </button>
              <button
                type="button"
                onClick={copyJson}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Copy className="size-3.5" /> Копировать
              </button>
            </div>
          </div>
        </Accordion>
      </div>
    </aside>
  );
}
