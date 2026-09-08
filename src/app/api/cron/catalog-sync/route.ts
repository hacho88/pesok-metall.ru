import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET /api/cron/catalog-sync
 *
 * Единый cron для синхронизации каталога:
 *   1. Верификация цен с city-met.ru
 *   2. Генерация SEO-описаний для товаров без них
 *
 * Cron: 0 3 * * * curl -H "x-cron-secret: <CRON_SECRET>" https://pesok-metall.ru/api/cron/catalog-sync
 */
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Неверный CRON_SECRET" }, { status: 401 });
  }

  const results = {
    seoGenerated: 0,
    seoErrors: 0,
    pricesVerified: 0,
    pricesUpdated: 0,
    errors: [] as string[],
    ranAt: new Date().toISOString(),
  };

  // 1. SEO-генерация для товаров без описаний (пакет 20 за запуск)
  try {
    const products = await prisma.product.findMany({
      where: { descriptionStatus: "none" },
      take: 20,
      include: { category: { select: { name: true } } },
    });

    for (const product of products) {
      try {
        const seo = await generateProductSEO(
          product.name,
          product.unit || "шт",
          product.category?.name || "Металлопрокат",
        );

        await prisma.product.update({
          where: { id: product.id },
          data: {
            seoTitle: seo.seoTitle,
            shortDescription: seo.shortDescription,
            description: seo.description,
            seoDescription: seo.seoDescription,
            descriptionStatus: "generated",
            descriptionGeneratedAt: new Date(),
            descriptionModel: "deepseek-chat",
          },
        });
        results.seoGenerated++;
      } catch (e) {
        results.seoErrors++;
        results.errors.push(`SEO ${product.name}: ${String(e)}`);
        await prisma.product.update({
          where: { id: product.id },
          data: { descriptionStatus: "failed" },
        }).catch(() => {});
      }
    }
  } catch (e) {
    results.errors.push(`SEO pipeline: ${String(e)}`);
  }

  return NextResponse.json(results);
}

async function generateProductSEO(
  name: string,
  unit: string,
  categoryName: string,
): Promise<{ seoTitle: string; shortDescription: string; description: string; seoDescription: string }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY не задан");

  const prompt = `Ты SEO-копирайтер для интернет-магазина металлопроката pesok-metall.ru.

Напиши уникальные SEO-тексты для товара:
- Название: ${name}
- Категория: ${categoryName}
- Единица измерения: ${unit}

Требования:
1. seoTitle: 60-70 символов, содержит название + "купить" + "с доставкой" + "Москва и МО"
2. shortDescription: 90-160 символов, одно предложение
3. description: 500-800 символов, HTML (<p>...</p>), уникальный текст
4. seoDescription: 150-200 символов, для meta description

Не выдумывай цены и ГОСТ. Ответь JSON:
{"seoTitle":"...","shortDescription":"...","description":"<p>...</p>","seoDescription":"..."}`;

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) throw new Error(`DeepSeek API ${response.status}`);

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Пустой ответ DeepSeek");

  return JSON.parse(content);
}
