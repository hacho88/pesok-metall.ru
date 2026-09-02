import { deepseek, DEEPSEEK_MODELS, requireDeepSeek } from "./deepseek";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { inZone, toZone } from "@/lib/geo";

export interface GeoArticleResult {
  id: string;
  title: string;
  chars: number;
  zoneSlug: string;
}

// Генерирует уникальную локализованную статью для конкретной гео-зоны
export async function generateGeoArticle(zoneSlug: string): Promise<GeoArticleResult> {
  requireDeepSeek();

  const zone = await prisma.geoZone.findUnique({
    where: { slug: zoneSlug },
    include: {
      products: {
        take: 5,
        include: { product: true },
        orderBy: { localPrice: "asc" },
      },
    },
  });
  if (!zone) throw new Error(`Geo zone not found: ${zoneSlug}`);

  const sampleProducts = zone.products
    .map((gp) => `${gp.product.name} — ${Math.round(Number(gp.localPrice))} ₽`)
    .join("; ");

  const systemPrompt = `Ты — эксперт-копирайтер и инженер-строитель компании pesok-metall.ru (металлопрокат, песок, щебень, бетон с доставкой по Москве и МО).
Твоя задача: написать уникальную, глубоко локализованную статью для города/района ${zone.name}.

ПРАВИЛА:
1. Минимум 4000 знаков — обязательное требование.
2. Структура: H1, введение, 3-5 разделов H2, списки, таблица с ценами, заключение.
3. Обязательно упомяни: доставку в ${inZone(zone.name)} в день заказа, локальный тариф доставки (коэффициент ×${zone.deliveryTariffMultiplier}), специфику логистики в ${toZone(zone.name)} (удалённость от МКАД, пробки, особенности разгрузки).
4. Включи примеры цен для ${toZone(zone.name)}: ${sampleProducts || "арматура, песок, щебень"}.
5. Стиль: живой, экспертный, без канцелярита. Для строителей, прорабов и частных застройщиков.
6. Внутренние ссылки: /geo/${zone.slug}, /metall, /pesok-scheben, /blog.
7. Выдай ответ СТРОГО в формате JSON.

Формат ответа:
{
  "title": "Заголовок статьи (H1), с упоминанием ${zone.name}",
  "content": "Полный HTML-текст (h2, p, ul, li, table, strong). МИНИМУМ 4000 ЗНАКОВ!",
  "seoTitle": "SEO Title (60-70 знаков)",
  "seoDescription": "Meta Description (140-160 знаков)"
}`;

  const userPrompt = `Напиши локализованную статью для ${toZone(zone.name)} (${zone.isRegion ? "город Московской области" : "район Москвы"}).
Контекст:
- Регион: ${zone.name}, коэффициент доставки ×${zone.deliveryTariffMultiplier}
- Товары и локальные цены: ${sampleProducts || "арматура, песок мытый, щебень гранитный"}
- Особенности: доставка в день заказа, соответствие ГОСТ, собственный автопарк.

Верни JSON: title, content (HTML, минимум 4000 знаков), seoTitle, seoDescription.`;

  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.chat,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 4000,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");

  if (!result.content || result.content.length < 2500) {
    const padding = `
    <h2>Доставка стройматериалов в ${toZone(zone.name)}</h2>
    <p>Для точного расчёта стоимости доставки ${zone.name === "Москва" ? "по Москве" : `в ${toZone(zone.name)}`} используйте наш интерактивный калькулятор на сайте. Цена зависит от объёма заказа, типа машины и удалённости объекта.</p>
    <ul>
      <li>Доставка в ${toZone(zone.name)} в день заказа</li>
      <li>Соответствие всех материалов ГОСТ</li>
      <li>Розничные и оптовые цены</li>
      <li>Собственный автопарк: от Газели до манипулятора и самосвала</li>
      <li>Локальный тариф доставки ×${zone.deliveryTariffMultiplier}</li>
    </ul>
    <p>Оставьте заявку на сайте — менеджер свяжется с вами в течение 15 минут и подтвердит детали доставки в ${toZone(zone.name)}.</p>`;
    result.content = (result.content || "") + padding;
  }

  const slug = `${slugify(result.title || `доставка стройматериалов в ${zone.name}`)}-${Math.floor(Math.random() * 10000)}`;
  const post = await prisma.blogPost.create({
    data: {
      title: result.title || `Доставка стройматериалов в ${toZone(zone.name)}`,
      slug,
      content: result.content,
      seoTitle: result.seoTitle,
      seoDescription: result.seoDescription,
      geoZoneId: zone.id,
    },
  });

  return { id: post.id, title: post.title, chars: post.content.length, zoneSlug: zone.slug };
}

// Генерирует статьи для всех гео-зон (по одной на зону)
export async function generateAllGeoArticles(): Promise<{
  generated: number;
  results: GeoArticleResult[];
  errors: Array<{ zone: string; error: string }>;
}> {
  const zones = await prisma.geoZone.findMany({ orderBy: { name: "asc" } });
  const results: GeoArticleResult[] = [];
  const errors: Array<{ zone: string; error: string }> = [];

  for (const zone of zones) {
    try {
      const result = await generateGeoArticle(zone.slug);
      results.push(result);
      console.log(`  ✓ ${zone.name}: ${result.title} (${result.chars} chars)`);
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (error) {
      errors.push({
        zone: zone.name,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`  ✗ ${zone.name}:`, error);
    }
  }

  return { generated: results.length, results, errors };
}
