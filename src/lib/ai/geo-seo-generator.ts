import { deepseek, DEEPSEEK_MODELS, requireDeepSeek } from "./deepseek";

export interface GeoSeoResult {
  seoTitle: string;
  seoDescription: string;
  aiDescription: string;
}

// DeepSeek генерирует SEO-контент для гео-страницы (title, description, текст)
export async function generateGeoSeo(prompt: string): Promise<GeoSeoResult> {
  requireDeepSeek();

  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.chat,
    messages: [
      {
        role: "system",
        content:
          "Ты — SEO-специалист и копирайтер компании pesok-metall.ru (металлопрокат, песок, щебень с доставкой по Москве и МО). Пишешь уникальные локализованные тексты для гео-страниц. Отвечай строго в формате JSON: seoTitle, seoDescription, aiDescription.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 3000,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");

  return {
    seoTitle: String(result.seoTitle ?? "").slice(0, 70),
    seoDescription: String(result.seoDescription ?? "").slice(0, 160),
    aiDescription: String(result.aiDescription ?? ""),
  };
}
