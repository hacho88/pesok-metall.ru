import { deepseek, DEEPSEEK_MODELS, requireDeepSeek, isDeepSeekConfigured } from "@/lib/ai/deepseek";
import { parseAtlasConfig, type Section, type SectionType } from "@/lib/atlas/config-schema";

const SYSTEM_PROMPT = `Ты — дизайнер интернет-магазина металлопроката и сыпучих материалов pesok-metall.ru. Генерируешь JSON-конфигурацию секций для главной страницы. Ответ — строго JSON без markdown. Доступные типы секций: HeroSlider, HeroSplit, CategoryTiles, FeaturedProducts, PriceBoard, PromoStrip, Advantages, Stats, Calculator, DeliveryZones, BannerGrid, BlogTeasers, Faq, Testimonials, CtaBanner, Steps, Certificates, Contacts, RichText, CustomHtml, Spacer, Divider.`;

export interface GeneratedLayout {
  sections: Section[];
}

export async function generateLayout(prompt: string): Promise<GeneratedLayout> {
  if (!isDeepSeekConfigured()) {
    throw new Error("DEEPSEEK_API_KEY не задан");
  }

  const userPrompt = `Сгенерируй секции главной страницы интернет-магазина металлопроката по описанию:
"${prompt}"

Верни JSON:
{
  "sections": [
    { "id": "строка", "type": "тип секции", "props": { ... }, "settings": { "paddingTop": "md", "paddingBottom": "md", "background": "none", "container": "default", "visibility": { "desktop": true, "tablet": true, "mobile": true } } }
  ]
}

Используй 8–14 секций. Первая — HeroSlider или HeroSplit. Обязательны: CategoryTiles, FeaturedProducts, Calculator, Contacts. Каждая секция должна иметь id (уникальная строка).`;

  const resp = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.chat,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 3000,
  });

  const content = resp.choices[0]?.message?.content || "";
  const parsed = JSON.parse(content) as { sections: any[] };

  // Валидация секций
  const validTypes: SectionType[] = [
    "HeroSlider", "HeroSplit", "CategoryTiles", "FeaturedProducts", "PriceBoard",
    "PromoStrip", "Advantages", "Stats", "Calculator", "DeliveryZones",
    "BannerGrid", "BlogTeasers", "Faq", "Testimonials", "CtaBanner", "Steps",
    "Certificates", "Contacts", "RichText", "CustomHtml", "Spacer", "Divider",
  ];

  const sections: Section[] = (parsed.sections || [])
    .filter((s: any) => validTypes.includes(s.type))
    .map((s: any, i: number) => ({
      id: s.id || `ai-${Date.now()}-${i}`,
      type: s.type as SectionType,
      variant: s.variant,
      props: s.props || {},
      settings: s.settings || { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
    }));

  return { sections };
}

/** Улучшение текстов конкретной секции */
export async function improveSectionTexts(section: Section): Promise<Section> {
  if (!isDeepSeekConfigured()) {
    throw new Error("DEEPSEEK_API_KEY не задан");
  }

  const userPrompt = `Улучши тексты для секции интернет-магазина металлопроката:
Тип: ${section.type}
Текущие props: ${JSON.stringify(section.props, null, 2)}

Верни JSON с улучшенными props (только текстовые поля, структура та же):
{ "props": { ... } }`;

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
  const parsed = JSON.parse(content) as { props: Record<string, unknown> };

  return { ...section, props: { ...section.props, ...parsed.props } };
}
