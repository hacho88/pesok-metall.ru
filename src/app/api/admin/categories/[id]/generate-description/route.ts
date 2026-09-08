import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deepseek, DEEPSEEK_MODELS, isDeepSeekConfigured } from "@/lib/ai/deepseek";

// POST /api/admin/categories/[id]/generate-description — ИИ-описание категории под SEO (DeepSeek)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
        parent: { select: { name: true } },
      },
    });
    if (!category) {
      return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });
    }
    if (!isDeepSeekConfigured()) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY не задан — добавьте ключ в .env и перезапустите сервер" },
        { status: 500 }
      );
    }

    const children = await prisma.category.findMany({
      where: { parentId: category.id },
      select: { name: true },
      orderBy: { sortOrder: "asc" },
    });

    const systemPrompt = `Ты — ведущий SEO-маркетолог магазина pesok-metall.ru (металлопрокат, песок, щебень; Москва и МО).
Напиши продающий SEO-текст для страницы категории, чтобы вывести её в топ Яндекса и продвигать pesok-metall.ru.

Требования:
- description: 2000–3500 знаков, чистый HTML БЕЗ h1: 2–4 абзаца <p>, один-два списка <ul><li> (ассортимент, преимущества покупки именно здесь), естественные вхождения ключей («купить {название} в Москве», «{название} цена»), упоминание доставки в день заказа по Москве и МО, для металла — резка в размер и ГОСТ. В конце призыв к действию.
- shortDescription: одно предложение, 90–160 символов.
- seoTitle: до 60 символов, вид «{Название} — купить в Москве с доставкой | pesok-metall.ru» (если влезает).
- seoDescription: 140–160 знаков с выгодой и призывом.
- keywords: 5–8 ключевых фраз.

Отвечай строго в JSON: {"description":"","shortDescription":"","seoTitle":"","seoDescription":"","keywords":[""]}`;

    const userPrompt = `Категория: ${category.name}${category.parent ? ` (раздел: ${category.parent.name})` : ""}
Подкатегории: ${children.map((c) => c.name).join(", ") || "нет"}
Товаров в категории: ${category._count.products}`;

    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODELS.chat,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2500,
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
      await prisma.category.update({
        where: { id },
        data: { descriptionStatus: "failed" },
      });
      return NextResponse.json(
        { error: "DeepSeek вернул некорректный JSON, попробуйте ещё раз" },
        { status: 502 }
      );
    }

    if (!parsed.description || parsed.description.length < 300) {
      await prisma.category.update({
        where: { id },
        data: { descriptionStatus: "failed" },
      });
      return NextResponse.json(
        { error: "Описание слишком короткое, попробуйте ещё раз" },
        { status: 502 }
      );
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        description: parsed.description,
        shortDescription: parsed.shortDescription ?? null,
        seoTitle: parsed.seoTitle ?? null,
        seoDescription: parsed.seoDescription ?? null,
        descriptionStatus: "generated",
        descriptionGeneratedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, category: updated });
  } catch (error) {
    console.error("AI Category Description Error:", error);
    await prisma.category
      .update({ where: { id }, data: { descriptionStatus: "failed" } })
      .catch(() => {});
    return NextResponse.json(
      { error: "Не удалось сгенерировать описание" },
      { status: 500 }
    );
  }
}
