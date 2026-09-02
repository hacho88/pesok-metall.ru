import { NextRequest, NextResponse } from "next/server";
import { deepseek, DEEPSEEK_MODELS, isDeepSeekConfigured } from "@/lib/ai/deepseek";

// POST /api/admin/products/generate-seo
// Body: { name, category, attributes?, price?, unit? }
// Returns: { description: string }
export async function POST(request: NextRequest) {
  try {
    if (!isDeepSeekConfigured()) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY не задан. Добавьте ключ в .env файл." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, category, attributes, price, unit } = body as {
      name: string;
      category: string;
      attributes?: { key: string; value: string }[];
      price?: string | number;
      unit?: string;
    };

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Поле name обязательно" }, { status: 400 });
    }

    const specs = attributes && Array.isArray(attributes) && attributes.length > 0
      ? attributes.filter((a) => a.key?.trim() && a.value?.trim()).map((a) => `${a.key}: ${a.value}`).join(", ")
      : "стандартные характеристики";

    const priceInfo = price ? `Актуальная цена: ${price} ₽${unit ? `/${unit}` : ""}.` : "Цена: по запросу.";

    const systemPrompt = `Ты — профессиональный SEO-копирайтер для B2B строительного маркетплейса pesok-metall.ru.
Твоя задача: написать продающее, профессиональное описание строительного товара для каталога.

ПРАВИЛА:
1. Объём: 500–800 символов (знаков).
2. Стиль: живой, экспертный, без канцелярита. Для строителей и прорабов.
3. Обязательно включи: ключевые строительные термины (ГОСТ, марка, применение), варианты использования (фундамент, монолит, дорожное строительство и т.д.), конверсионные триггеры (доставка в день заказа, соответствие стандартам, оптом и в розницу).
4. НЕ используй заголовки (h1, h2) — только текст абзацами.
5. Выдай ответ в формате JSON: { "description": "текст описания" }`;

    const userPrompt = `Товар: ${name}
Категория: ${category}
Характеристики: ${specs}
${priceInfo}

Напиши SEO-описание для этого товара.`;

    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODELS.chat,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content) as { description?: string };

    if (!parsed.description || parsed.description.trim().length < 100) {
      return NextResponse.json(
        { error: "ИИ вернул недостаточный объём текста. Попробуйте ещё раз." },
        { status: 500 }
      );
    }

    return NextResponse.json({ description: parsed.description.trim() });
  } catch (error) {
    console.error("SEO generation error:", error);
    return NextResponse.json(
      { error: "Не удалось сгенерировать описание", detail: String(error) },
      { status: 500 }
    );
  }
}
