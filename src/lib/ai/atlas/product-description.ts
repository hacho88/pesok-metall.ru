import { deepseek, DEEPSEEK_MODELS, requireDeepSeek } from "@/lib/ai/deepseek";
import { sanitizeDescription, hasReplacementChars } from "@/lib/atlas/sanitize";
import type { Prisma } from "@prisma/client";

type ProductRow = Prisma.ProductGetPayload<{ include: { category: true; attributes: true } }>;

const SYSTEM_PROMPT = `Ты — технический копирайтер поставщика металлопроката и сыпучих строительных материалов в Москве и Московской области (магазин pesok-metall.ru). Пишешь точные, полезные описания товаров для интернет-магазина. Правила: русский язык; живой профессиональный стиль без канцелярита, воды и рекламных штампов; НЕ выдумывай характеристики, ГОСТы, размеры и цифры — используй только переданные данные; не называй цены; не упоминай конкурентов, другие сайты и бренды-источники; не пиши превосходных степеней о компании. Ответ — строго JSON без markdown.`;

export interface GeneratedProductDescription {
  shortDescription: string;
  descriptionHtml: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
}

export async function generateProductDescription(product: ProductRow): Promise<GeneratedProductDescription> {
  requireDeepSeek();

  const attrs = product.attributes.map((a) => `${a.key}: ${a.value}`).join(", ");
  const typeLabel = typeToLabel(product.type);
  const unit = product.unit || "шт";
  const weightInfo = Number(product.weightKg) ? `Вес единицы: ${product.weightKg} кг` : "";
  const onOrderInfo = product.isOnOrder ? "Товар поставляется под заказ (1–3 дня)." : "Товар в наличии на складе.";

  const userPrompt = `Напиши описание для товара интернет-магазина.

Товар: ${product.name}
Категория: ${product.category?.name || "Категория не указана"}
Тип: ${typeLabel}
Единица измерения цены: ${unit}
${weightInfo}
Атрибуты: ${attrs}
Наличие: ${onOrderInfo}
Регион: Москва и Московская область

Требуемый JSON:
{
  "shortDescription": "1 предложение, 90–160 символов: что это и для чего",
  "descriptionHtml": "<p>вводный абзац: назначение, где применяется</p><h3>Характеристики</h3><ul>...только из переданных атрибутов...</ul><h3>Применение</h3><ul>3–5 пунктов</ul><h3>Преимущества</h3><ul>3–4 пункта о свойствах материала/профиля</ul><h3>Доставка и хранение</h3><p>доставка в день заказа по Москве и МО, самовывоз со склада, условия хранения; для под заказ — поставка 1–3 дня; для сыпучих — фасовка по unit</p><h3>Частые вопросы</h3><h4>вопрос</h4><p>ответ</p> ×2–3",
  "seoTitle": "≤70 символов",
  "seoDescription": "≤160 символов",
  "keywords": ["5–8 ключевых фраз"]
}

Ограничения: текст descriptionHtml 1200–2200 символов без тегов. Разрешённые теги: p, h3, h4, ul, ol, li, strong, em, table, thead, tbody, tr, th, td. Не выдумывай ГОСТы и цифры, которых нет во входных данных.`;

  const resp = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.chat,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = resp.choices[0]?.message?.content || "";
  const parsed = JSON.parse(content) as GeneratedProductDescription;

  // Валидация
  if (!parsed.shortDescription || parsed.shortDescription.length < 50) {
    throw new Error("shortDescription too short");
  }
  if (!parsed.descriptionHtml || parsed.descriptionHtml.length < 500) {
    throw new Error("descriptionHtml too short");
  }
  if (hasReplacementChars(parsed.descriptionHtml)) {
    throw new Error("U+FFFD in description");
  }
  if (parsed.descriptionHtml.toLowerCase().includes("city-met")) {
    throw new Error("mentions city-met");
  }
  if (parsed.descriptionHtml.toLowerCase().includes("конкурент")) {
    throw new Error("mentions конкурент");
  }
  if (!parsed.seoTitle || parsed.seoTitle.length > 70) {
    throw new Error("seoTitle invalid");
  }
  if (!parsed.seoDescription || parsed.seoDescription.length > 160) {
    throw new Error("seoDescription invalid");
  }
  if (!Array.isArray(parsed.keywords) || parsed.keywords.length < 3) {
    throw new Error("keywords invalid");
  }

  // Санитизация
  parsed.descriptionHtml = sanitizeDescription(parsed.descriptionHtml);

  return parsed;
}

function typeToLabel(type: string): string {
  switch (type) {
    case "METALL": return "Металлопрокат";
    case "BAG_30KG": return "Сыпучие в мешках 30 кг";
    case "BIG_BAG_1TON": return "Сыпучие в биг-бегах 1 т";
    default: return "Стройматериалы";
  }
}
