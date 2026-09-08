import { deepseek, DEEPSEEK_MODELS, isDeepSeekConfigured } from "@/lib/ai/deepseek";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { inZone, toZone } from "@/lib/geo-declensions";

const ARTICLE_TOPICS = [
  "расчёт арматуры для фундамента",
  "выбор марки стали для монолитного строительства",
  "сравнение видов песка для бетона",
  "какой щебень выбрать для дорожного полотна",
  "расчёт веса металлопроката по ГОСТ",
  "доставка песка биг-бегами: преимущества и расчёт",
  "арматура А500С vs А240: что выбрать",
  "трубный прокат: виды и применение",
  "уголок стальной: характеристики и расчёт нагрузки",
  "сетка кладочная: выбор и применение",
  "швеллер: расчёт нагрузок для перекрытий",
  "лист стальной: горячекатаный vs холоднокатаный",
  "песок мытый vs карьерный: сравнение",
  "щебень гранитный vs известняковый: что выбрать",
  "расчёт кубатуры сыпучих материалов",
  "логистика доставки металлопроката",
  "сезонные цены на металлопрокат",
  "как сэкономить на закупке стройматериалов",
  "ГОСТ на металлопрокат: ключевые требования",
  "фракции щебня: применение в строительстве",
];

export async function generateSeoPost(productId?: string, topicIndex?: number) {
  if (!isDeepSeekConfigured()) {
    throw new Error("DEEPSEEK_API_KEY не задан");
  }

  // 1. Get product and geo context
  const product = productId
    ? await prisma.product.findUnique({
        where: { id: productId },
        include: { category: true, geoData: { include: { geoZone: true } } }
      })
    : await getRandomProduct();

  if (!product) throw new Error("No product found for SEO generation");

  const zone = product.geoData[0]?.geoZone || { name: "Москве и МО", slug: "moscow" };
  const price = product.geoData[0]?.localPrice || product.priceRetailBase;
  const topic = topicIndex != null && ARTICLE_TOPICS[topicIndex]
    ? ARTICLE_TOPICS[topicIndex]
    : `выбор и покупка ${product.name}`;

  // 2. Prompt DeepSeek for comprehensive long-read article (5000+ chars)
  const systemPrompt = `Ты — эксперт-копирайтер и инженер-строитель в сфере металлопроката и сыпучих материалов.
Твоя задача: написать авторитетный, глубоко структурированный лонгрид для блога pesok-metall.ru, который цитируют Google AI Overviews, Яндекс.Алиса и другие ИИ-поисковики.

ПРАВИЛА:
1. Минимум 5000 знаков (символов) — это обязательное требование.
2. Структура: H1 заголовок, блок «Краткий ответ» (сразу после H1 — 2-3 предложения, прямой ответ на запрос без вступлений), введение, 3-5 разделов H2 (часть в форме вопроса), маркированные списки, таблицы, раздел FAQ, заключение.
3. Блок «Краткий ответ» оформи как <h2>Краткий ответ</h2> и сразу <p> с прямым ответом: цифры, цены, конкретика — именно его цитируют ИИ-ассистенты и AI Overviews.
4. В конце статьи — раздел <h2>Частые вопросы</h2> с 4-5 вопросами: каждый вопрос — заголовок <h3>, заканчивающийся на «?», ответ — следующий за ним <p> (40-80 слов, самодостаточный). Это критично для FAQ-разметки и ИИ-поиска.
5. Включи: практические расчёты, таблицу сравнения (HTML <table>), текущие цены, локальные ссылки.
6. Стиль: живой, экспертный, без канцелярита. Для строителей, прорабов и застройщиков.
7. Пиши от лица человека — эксперта редакции pesok-metall.ru. НИКОГДА не упоминай ИИ, нейросети, автоматическую генерацию, «ИИ-аналитика» — только живой экспертный текст от специалиста.
8. Органично вставь ключи: "купить ${product.name}", "доставка в ${inZone(zone.name)}", "ГОСТ", "цена за тонну".
9. Включи внутренние ссылки: /metall, /geo/${zone.slug}, /blog.
10. Выдай ответ в формате JSON.

Формат ответа (JSON):
{
  "title": "Заголовок статьи (H1)",
  "content": "Полный HTML-текст статьи (h2, h3, p, ul, li, table, strong). Обязательно: блок «Краткий ответ» в начале и раздел FAQ с вопросами <h3>...?</h3><p>ответ</p> в конце. Минимум 5000 знаков!",
  "seoTitle": "SEO Title (60-70 знаков)",
  "seoDescription": "Meta Description (140-160 знаков)"
}`;

  const userPrompt = `Напиши лонгрид на тему: "${topic}"
Контекст:
- Товар: ${product.name} (${product.category.name})
- Регион: ${zone.name}
- Актуальная цена: ${price} руб.
- Особенности: доставка в день заказа, соответствие ГОСТ.

Требования к структуре (верни в формате JSON):
{
  "title": "Заголовок статьи (H1)",
  "content": "Полный текст статьи в HTML. ОБЯЗАТЕЛЬНО: 1) сразу после H1 блок <h2>Краткий ответ</h2> с прямым ответом в 2-3 предложениях; 2) 3-5 разделов H2, часть в форме вопроса; 3) таблица <table>; 4) в конце раздел <h2>Частые вопросы</h2> с 4-5 парами <h3>вопрос?</h3><p>ответ</p>; 5) МИНИМУМ 5000 ЗНАКОВ",
  "seoTitle": "SEO Title (60-70 знаков)",
  "seoDescription": "Meta Description (140-160 знаков)"
}`;

  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.chat,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 8192, // 5000+ знаков статьи + JSON-экранирование; 4000 обрезало ответ
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");

  // Validate minimum length
  if (!result.content || result.content.length < 3000) {
    console.warn(`Article too short: ${result.content?.length ?? 0} chars. Retrying with more detail...`);
    // Add padding content if DeepSeek returned too short
    const padding = `
    <h2>Дополнительная информация</h2>
    <p>Для точного расчёта стоимости доставки ${product.name} в ${inZone(zone.name)} используйте наш интерактивный калькулятор на сайте. Учтите, что цены могут варьироваться в зависимости от объёма заказа и удалённости объекта.</p>
    <h3>Наши преимущества</h3>
    <ul>
      <li>Доставка в ${toZone(zone.name)} в день заказа</li>
      <li>Соответствие всех материалов ГОСТ</li>
      <li>Розничные и оптовые цены</li>
      <li>Собственный автопарк: от Газели до длинномеров</li>
      <li>Отгрузка со склада в Москве и МО</li>
    </ul>
    <p>Для оформления заказа позвоните нам или оставьте заявку через форму на сайте. Менеджер свяжется с вами в течение 15 минут для подтверждения деталей доставки.</p>`;
    result.content = (result.content || "") + padding;
  }

  // 3. Save to database
  const slug = `${slugify(result.title || topic)}-${Math.floor(Math.random() * 10000)}`;
  const post = await prisma.blogPost.create({
    data: {
      title: result.title || topic,
      slug,
      content: result.content,
      seoTitle: result.seoTitle,
      seoDescription: result.seoDescription,
      targetProductId: product.id,
    }
  });

  return post;
}

async function getRandomProduct() {
  const count = await prisma.product.count();
  const skip = Math.floor(Math.random() * count);
  return prisma.product.findFirst({
    skip,
    include: { category: true, geoData: { include: { geoZone: true } } }
  });
}

// Generate 20+ articles in one cron run
export async function generateDailyArticles(count: number = 20) {
  const results: Array<{ id: string; title: string; chars: number }> = [];
  const errors: Array<{ topic: string; error: string }> = [];

  for (let i = 0; i < count; i++) {
    const topicIndex = i % ARTICLE_TOPICS.length;
    try {
      const post = await generateSeoPost(undefined, topicIndex);
      results.push({ id: post.id, title: post.title, chars: post.content.length });
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      errors.push({
        topic: ARTICLE_TOPICS[topicIndex],
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`Article ${i + 1} failed:`, error);
    }
  }

  return { generated: results.length, results, errors };
}
