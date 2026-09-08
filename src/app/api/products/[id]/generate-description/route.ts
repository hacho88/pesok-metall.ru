import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deepseek, DEEPSEEK_MODELS, isDeepSeekConfigured } from "@/lib/ai/deepseek";

// POST /api/products/[id]/generate-description — ИИ-описание товара под SEO (DeepSeek)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, attributes: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }
    if (!isDeepSeekConfigured()) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY не задан — добавьте ключ в .env и перезапустите сервер" },
        { status: 500 }
      );
    }

    const attrs = product.attributes.map((a) => `${a.key}: ${a.value}`).join("; ");
    const price =
      product.priceRetailBase != null
        ? `${Number(product.priceRetailBase)} ₽ за ${product.unit ?? "шт"}`
        : "цена по запросу";

    const systemPrompt = `Ты — SEO-копирайтер строительного магазина pesok-metall.ru (металлопрокат, песок, щебень; Москва и МО).
Напиши продающее SEO-описание товара для карточки на сайте.

Требования:
- description: 1500–2500 знаков, чистый HTML БЕЗ h1: 2–3 абзаца <p>, один список <ul><li> (преимущества/применение), естественные вхождения ключевых слов, в конце призыв к действию (доставка в день заказа по Москве и МО; для металла — резка в размер).
- shortDescription: одно предложение, 90–160 символов.
- seoTitle: до 60 символов, вид «Название — купить в Москве с доставкой».
- seoDescription: 140–160 знаков, с выгодой и призывом.
- keywords: 5–8 ключевых фраз.

Отвечай строго в JSON: {"description":"","shortDescription":"","seoTitle":"","seoDescription":"","keywords":[""]}`;

    const userPrompt = `Товар: ${product.name}
Категория: ${product.category.name}
Цена: ${price}
Вес единицы: ${Number(product.weightKg)} кг
Характеристики: ${attrs || "нет"}`;

    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODELS.chat,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const raw = response.choices[0]?.message?.content ?? "";
    let parsed: {
      description?: string;
      shortDescription?: string;
      seoTitle?: string;
      seoDescription?: string;
      keywords?: string[];
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      await prisma.product.update({
        where: { id },
        data: { descriptionStatus: "failed" },
      });
      return NextResponse.json(
        { error: "DeepSeek вернул некорректный JSON, попробуйте ещё раз" },
        { status: 502 }
      );
    }

    if (!parsed.description || parsed.description.length < 300) {
      await prisma.product.update({
        where: { id },
        data: { descriptionStatus: "failed" },
      });
      return NextResponse.json(
        { error: "Описание слишком короткое, попробуйте ещё раз" },
        { status: 502 }
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        description: parsed.description,
        shortDescription: parsed.shortDescription ?? null,
        seoTitle: parsed.seoTitle ?? null,
        seoDescription: parsed.seoDescription ?? null,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 10) : [],
        descriptionStatus: "generated",
        descriptionGeneratedAt: new Date(),
        descriptionModel: DEEPSEEK_MODELS.chat,
      },
      include: { category: true, attributes: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("AI Description Error:", error);
    await prisma.product
      .update({ where: { id }, data: { descriptionStatus: "failed" } })
      .catch(() => {});
    return NextResponse.json(
      { error: "Не удалось сгенерировать описание" },
      { status: 500 }
    );
  }
}
