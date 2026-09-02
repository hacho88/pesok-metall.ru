import { deepseek, DEEPSEEK_MODELS, requireDeepSeek } from "@/lib/ai/deepseek";
import { sanitizeDescription, hasReplacementChars } from "@/lib/atlas/sanitize";
import type { Prisma } from "@prisma/client";

type CategoryRow = Prisma.CategoryGetPayload<{ include: { _count: { select: { products: true } } } }>;

const SYSTEM_PROMPT = `Ты — технический копирайтер поставщика металлопроката и сыпучих строительных материалов в Москве и Московской области (магазин pesok-metall.ru). Пишешь точные, полезные описания категорий товаров для интернет-магазина. Правила: русский язык; живой профессиональный стиль без канцелярита, воды и рекламных штампов; не называй цены; не упоминай конкурентов и другие сайты. Ответ — строго JSON без markdown.`;

export interface GeneratedCategoryDescription {
  shortDescription: string;
  descriptionHtml: string;
  seoTitle: string;
  seoDescription: string;
}

export async function generateCategoryDescription(
  category: CategoryRow,
  sampleProducts: string[]
): Promise<GeneratedCategoryDescription> {
  requireDeepSeek();

  const userPrompt = `Напиши описание для категории интернет-магазина.

Категория: ${category.name}
Количество товаров: ${category._count.products}
Примеры товаров: ${sampleProducts.join(", ")}

Требуемый JSON:
{
  "shortDescription": "1 предложение, ≤160 символов: что входит в категорию",
  "descriptionHtml": "<p>вводный абзац: что входит в категорию</p><h3>Как выбрать</h3><p>...</p><h3>Применение</h3><ul>...</ul><h3>Частые вопросы</h3><h4>вопрос</h4><p>ответ</p> ×2",
  "seoTitle": "≤70 символов",
  "seoDescription": "≤160 символов"
}

Ограничения: текст descriptionHtml 600–1200 символов без тегов. Разрешённые теги: p, h3, h4, ul, ol, li, strong, em. Не выдумывай характеристики.`;

  const resp = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.chat,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 1500,
  });

  const content = resp.choices[0]?.message?.content || "";
  const parsed = JSON.parse(content) as GeneratedCategoryDescription;

  if (!parsed.shortDescription || parsed.shortDescription.length > 160) {
    throw new Error("shortDescription invalid");
  }
  if (!parsed.descriptionHtml || parsed.descriptionHtml.length < 300) {
    throw new Error("descriptionHtml too short");
  }
  if (hasReplacementChars(parsed.descriptionHtml)) {
    throw new Error("U+FFFD in description");
  }
  if (!parsed.seoTitle || parsed.seoTitle.length > 70) {
    throw new Error("seoTitle invalid");
  }
  if (!parsed.seoDescription || parsed.seoDescription.length > 160) {
    throw new Error("seoDescription invalid");
  }

  parsed.descriptionHtml = sanitizeDescription(parsed.descriptionHtml);
  return parsed;
}
