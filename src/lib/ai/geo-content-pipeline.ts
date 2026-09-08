import { deepseek, DEEPSEEK_MODELS, requireDeepSeek } from "./deepseek";
import { prisma } from "@/lib/prisma";
import { ProductType } from "@prisma/client";

export interface LocalizedContent {
  seoTitle: string;
  seoDescription: string;
  aiText: string;
}

function packagingDescription(productType: string): string {
  switch (productType) {
    case ProductType.BAG_30KG:
      return "Мешки по 30 кг (удобно для ручной переноски, точечного ремонта и подъема на этаж)";
    case ProductType.BIG_BAG_1TON:
      return "Биг-Беги по 1 тонне (прочные промышленные мягкие контейнеры со стропами под кран-манипулятор)";
    case ProductType.METALL:
      return "Металлопрокат по метрам напрямую со склада Сити-Металл";
    default:
      return "Строительные материалы с доставкой";
  }
}

export async function generateLocalizedContent(
  productName: string,
  productType: string,
  zoneName: string,
  specs: string
): Promise<LocalizedContent> {
  requireDeepSeek();

  const systemPrompt = `Ты — ведущий AI-маркетолог и SEO-эксперт в строительной нише Москвы и Московской области.
Твоя цель — написать коммерчески привлекательное, продающее и на 100% уникальное описание товара для локального поддомена конкретного города/района, чтобы Яндекс вывел страницу в топ.
Сайт: pesok-metall.ru
Локация: Москва, район/город ${zoneName}.
Товар: ${productName}.
Характеристики: ${specs}.
Тип упаковки: ${packagingDescription(productType)}.

ПРАВИЛА ГЕНЕРАЦИИ:
1. Пиши живым языком. Никаких штампов вроде "высокое качество по доступным ценам". Текст должен выглядеть так, будто его написал местный строитель-эксперт.
2. Органично вставь LSI-ключи: "доставка в ${zoneName} в день заказа", "купить в розницу и оптом", "соответствует ГОСТ".
3. Сделай понятный маркированный список преимуществ использования этой фасовки именно для строек в ${zoneName}.
4. В конце сделай призыв к действию (CTA): использовать интерактивный ИИ-калькулятор на странице для точного перевода объема в мешки и автоподбора грузовой машины.
Выдай ответ строго в формате JSON с полями: seoTitle, seoDescription, aiText.`;

  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.chat, // DeepSeek-V3
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Сгенерируй JSON-описание для товара ${productName} в городе/районе ${zoneName}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 1200,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content) as Partial<LocalizedContent>;

  return {
    seoTitle: parsed.seoTitle || `${productName} — купить с доставкой в ${zoneName}`,
    seoDescription:
      parsed.seoDescription ||
      `${productName} с доставкой в ${zoneName} в день заказа. Розница и опт, соответствует ГОСТ.`,
    aiText: parsed.aiText || "",
  };
}

// Конвейер: при парсинге нового товара обходит все GeoZone и генерирует уникальный контент
export async function runGeoContentPipeline(productId: string): Promise<number> {
  requireDeepSeek();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { attributes: true },
  });

  if (!product) {
    throw new Error(`Товар ${productId} не найден`);
  }
  if (product.priceRetailBase == null) {
    throw new Error(`Товар «${product.name}» без цены («под заказ») — geo-контент не генерируется`);
  }

  const zones = await prisma.geoZone.findMany({ orderBy: { name: "asc" } });
  const specs = product.attributes
    .map((a) => `${a.key}: ${a.value}`)
    .join(", ");

  let generated = 0;
  for (const zone of zones) {
    const content = await generateLocalizedContent(
      product.name,
      product.type,
      zone.name,
      specs
    );

    const localPrice =
      Number(product.priceRetailBase) * Number(zone.deliveryTariffMultiplier);

    await prisma.geoProductData.upsert({
      where: {
        geoZoneId_productId: { geoZoneId: zone.id, productId: product.id },
      },
      update: {
        seoTitle: content.seoTitle,
        seoDescription: content.seoDescription,
        aiDescription: content.aiText,
        localPrice,
      },
      create: {
        geoZoneId: zone.id,
        productId: product.id,
        seoTitle: content.seoTitle,
        seoDescription: content.seoDescription,
        aiDescription: content.aiText,
        localPrice,
      },
    });
    generated += 1;
  }

  return generated;
}

// Автопилот: генерирует гео-контент для товаров без geo-данных
// и для товаров, у которых geo-тексты — шаблонные (пустой aiDescription после бэкфилла)
export async function runGeoContentPipelineForAll(): Promise<number> {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { geoData: { none: {} } },
        { geoData: { some: { aiDescription: "" } } },
      ],
    },
    select: { id: true },
    take: 20, // порция за один запуск крона — не перегружаем DeepSeek
  });

  let total = 0;
  for (const p of products) {
    try {
      total += await runGeoContentPipeline(p.id);
    } catch (error) {
      console.error(`Ошибка гео-конвейера для товара ${p.id}:`, error);
    }
  }
  return total;
}
