// Генерация конфига страницы (PageConfig) из текстового промпта через DeepSeek
import { deepseek, DEEPSEEK_MODELS, requireDeepSeek } from "@/lib/ai/deepseek";
import { BLOCK_SCHEMAS, getBlockSchema } from "@/lib/block-schemas";
import { ICON_MAP } from "@/lib/icons";
import type { PageBlock, PageConfig, ThemePreset } from "@/types/page-builder";

const THEMES: ThemePreset[] = [
  "industrial-orange",
  "clean-minimal",
  "warm-sand",
  "cool-sky",
  "emerald-light",
  "rose-blush",
  "violet-mist",
  "amber-sunset",
  "teal-fresh",
  "paper-mono",
  "lime-fresh",
  "peach-cream",
  "b2b-dark-slate",
  "midnight-navy",
  "graphite-dark",
  "forest-dark",
  "royal-purple",
  "crimson-dark",
  "ocean-deep",
  "neon-dark",
  "sunset-dark",
  "wine-dark",
  "steel-dark",
  "copper-dark",
];

const MAX_BLOCKS = 12;
const MAX_ITEMS = 6;

// Описание каталога блоков для промпта — модель должна знать поля и ограничения
const BLOCK_CATALOG = BLOCK_SCHEMAS.map((s) => {
  const fields = s.fields
    .map((f) => {
      const opts = f.options ? ` (варианты: ${f.options.map((o) => o.value).join(", ")})` : "";
      return `${f.key}: ${f.type}${opts}`;
    })
    .join(", ");
  const items = s.defaultProps.items
    ? `, items: массив объектов с полями ${Object.keys(
        (s.defaultProps.items as object[])[0] ?? {}
      ).join(", ")}`
    : "";
  return `- ${s.type} — ${s.description}. Поля: ${fields}${items}`;
}).join("\n");

const SYSTEM_PROMPT = `Ты — дизайнер-конструктор лендингов для интернет-магазина pesok-metall.ru (металлопрокат и сыпучие материалы: арматура, трубы, листы, сетка, песок, щебень; доставка по Москве и МО в день заказа; розница и опт).

По промпту пользователя составь конфиг страницы: выбери подходящие блоки, заполни их контентом на русском языке (маркетинговые тексты, конкретные цифры, реальные города МО: Москва, Балашиха, Подольск, Люберцы, Митино).

Доступные темы: ${THEMES.join(", ")}.

Каталог блоков:
${BLOCK_CATALOG}

Ограничения:
- Верни ТОЛЬКО JSON без пояснений, в формате {"theme": "...", "blocks": [...]}.
- blocks — массив от 3 до ${MAX_BLOCKS} блоков, порядок = порядок на странице (баннер первым, чат/счёт последними).
- Не выдумывай типы блоков — только из каталога.
- Заполни все обязательные поля каждого блока.
- items: не более 4 для Advantages и Stats, не более 6 для Faq и Testimonials.
- rating в Testimonials — число от 1 до 5.
- limit в LiveProductGrid — число от 1 до 12.
- Тексты должны быть грамматически корректными, без канцелярита, с правильными склонениями городов («в Балашихе», «доставка в Балашиху»).`;

interface RawBlock {
  type?: string;
  [key: string]: unknown;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  return items.length > 0 ? items : fallback;
}

function normalizeItems(
  value: unknown,
  keys: string[],
  max: number,
  fallback: Record<string, unknown>[]
): Record<string, unknown>[] {
  if (!Array.isArray(value)) return fallback;
  const items = value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .slice(0, max)
    .map((item) => {
      const next: Record<string, unknown> = {};
      for (const key of keys) {
        const raw = item[key];
        next[key] =
          key === "rating"
            ? asNumber(raw, 1, 5, 5)
            : typeof raw === "string" && raw.trim()
              ? raw.trim()
              : "";
      }
      return next;
    })
    .filter((item) => Object.values(item).some((v) => v !== ""));
  return items.length > 0 ? items : fallback;
}

// Приводит ответ модели к валидному PageConfig: только известные блоки, дефолты для пустых полей
export function normalizeConfig(raw: unknown, slug: string): PageConfig {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const theme = THEMES.includes(obj.theme as ThemePreset)
    ? (obj.theme as ThemePreset)
    : "industrial-orange";

  const blocks: PageBlock[] = [];
  if (Array.isArray(obj.blocks)) {
    for (const rawBlock of obj.blocks.slice(0, MAX_BLOCKS)) {
      const rb = (rawBlock ?? {}) as RawBlock;
      const schema = getBlockSchema(rb.type as PageBlock["type"]);
      if (!schema) continue;

      const defaults = schema.defaultProps;
      const block: Record<string, unknown> = { type: schema.type };

      for (const field of schema.fields) {
        const raw = rb[field.key];
        if (field.type === "number") {
          block[field.key] = asNumber(raw, 1, 12, Number(defaults[field.key] ?? 1));
        } else {
          block[field.key] = asString(raw, String(defaults[field.key] ?? ""));
        }
      }

      // Блоки с массивами items
      if (schema.type === "Advantages") {
        const keys = ["icon", "title", "description"];
        const fallback = (defaults.items as Record<string, unknown>[]).map((it) => ({
          ...it,
          title: asString(rb.title, String(it.title)),
          description: asString(rb.description, String(it.description)),
        }));
        block.items = normalizeItems(rb.items, keys, 4, fallback).map((item) => ({
          ...item,
          icon: typeof item.icon === "string" && ICON_MAP[item.icon.toLowerCase()]
            ? item.icon.toLowerCase()
            : "truck",
        }));
        block.title = asString(rb.title, String(defaults.title ?? ""));
        block.subtitle = asString(rb.subtitle, String(defaults.subtitle ?? ""));
      } else if (schema.type === "Stats") {
        block.items = normalizeItems(rb.items, ["value", "label"], 4, defaults.items as Record<string, unknown>[]);
      } else if (schema.type === "Faq") {
        block.items = normalizeItems(rb.items, ["question", "answer"], MAX_ITEMS, defaults.items as Record<string, unknown>[]);
      } else if (schema.type === "Testimonials") {
        block.items = normalizeItems(rb.items, ["name", "role", "text", "rating"], MAX_ITEMS, defaults.items as Record<string, unknown>[]);
      } else if (schema.type === "DeliveryZones") {
        block.zones = asStringArray(rb.zones, defaults.zones as string[]);
      } else if (schema.type === "LiveProductGrid") {
        block.limit = asNumber(rb.limit, 1, 12, Number(defaults.limit ?? 8));
      }

      blocks.push(block as unknown as PageBlock);
    }
  }

  return { slug, theme, blocks };
}

// Генерация конфига страницы по промпту
export async function generatePageConfig(
  prompt: string,
  slug: string,
  theme?: ThemePreset
): Promise<PageConfig> {
  requireDeepSeek();

  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.chat,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Промпт: ${prompt}\n${
          theme ? `Желаемая тема: ${theme}.` : "Тему выбери сам, подходящую под задачу."
        }\nВерни JSON конфига страницы.`,
      },
    ],
    temperature: 0.8,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Модель вернула пустой ответ");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Модель могла обернуть JSON в ```json ... ``` — пробуем вырезать
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!match) throw new Error("Модель вернула невалидный JSON");
    parsed = JSON.parse(match[1]);
  }

  const config = normalizeConfig(parsed, slug);
  if (config.blocks.length === 0) {
    throw new Error("Модель не выбрала ни одного блока — попробуйте уточнить промпт");
  }
  return config;
}
