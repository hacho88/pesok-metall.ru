import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/geo-zones/generate?id=... — DeepSeek пишет SEO для геозоны
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Нет id" }, { status: 400 });

    const zone = await prisma.geoZone.findUnique({
      where: { id },
      include: { products: { take: 5, include: { product: true } } },
    });
    if (!zone) return NextResponse.json({ error: "Зона не найдена" }, { status: 404 });

    const zoneType = zone.isRegion ? "город Московской области" : "район Москвы";
    const sampleProducts = zone.products
      .slice(0, 5)
      .map((p) => `${p.product.name} — ${Math.round(Number(p.localPrice))} ₽${p.product.unit ? `/${p.product.unit}` : ""}`)
      .join("; ");

    const prompt = `Напиши SEO-контент для страницы доставки стройматериалов в ${zone.name} (${zoneType}).
Коэффициент доставки: ×${zone.deliveryTariffMultiplier} к базовому тарифу.
Примеры локальных цен: ${sampleProducts || "нет данных"}.

Верни строго JSON:
{
  "seoTitle": "заголовок до 70 символов, с ключом «${zone.name}»",
  "seoDescription": "описание до 160 символов для поисковиков",
  "aiDescription": "уникальный SEO-текст 300-500 слов для страницы /geo/${zone.slug}: упомяни ${zone.name}, локальный коэффициент доставки ×${zone.deliveryTariffMultiplier}, примеры цен, специфику логистики в этом районе, призыв заказать"
}`;

    const { generateGeoSeo } = await import("@/lib/ai/geo-seo-generator");
    const result = await generateGeoSeo(prompt);

    const updated = await prisma.geoZone.update({
      where: { id },
      data: {
        seoTitle: result.seoTitle,
        seoDescription: result.seoDescription,
        aiDescription: result.aiDescription,
      },
    });

    return NextResponse.json({
      seoTitle: updated.seoTitle,
      seoDescription: updated.seoDescription,
      aiDescription: updated.aiDescription,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Не удалось сгенерировать" }, { status: 500 });
  }
}
