import { NextRequest, NextResponse } from "next/server";
import { deepseek, DEEPSEEK_MODELS, isDeepSeekConfigured } from "@/lib/ai/deepseek";
import { toZone } from "@/lib/geo-declensions";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const FALLBACK_REPLY =
  "ИИ-менеджер сейчас недоступен (не задан DEEPSEEK_API_KEY). " +
  "Позвоните нам: +7 (495) 000-00-00, работаем ежедневно с 8:00 до 22:00.";

// POST /api/chat — диалог с ИИ-менеджером витрины
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const geoZoneName: string | undefined = body.geoZoneName;

    if (messages.length === 0) {
      return NextResponse.json({ error: "Пустой запрос" }, { status: 400 });
    }

    if (!isDeepSeekConfigured()) {
      return NextResponse.json({ reply: FALLBACK_REPLY });
    }

    const systemPrompt = `Ты — ИИ-менеджер интернет-магазина pesok-metall.ru (металлопрокат и сыпучие материалы, Москва и МО).
Товары: арматура, трубы, листы, сетка (продажа метрами), песок и щебень (мешки 30 кг для розницы, биг-беги 1 т для опта).
Отвечай коротко и по делу на русском языке. Подсказывай: цены, наличие, тару, подбор машины, доставку.
Если клиент спрашивает про объём — советуй использовать ИИ-калькулятор на странице.
${geoZoneName ? `Локация клиента: ${geoZoneName}. Упоминай доставку в ${toZone(geoZoneName)} в день заказа.` : ""}
Не выдумывай цены: если не знаешь — предложи уточнить у менеджера по телефону +7 (495) 000-00-00.`;

    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODELS.chat,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = response.choices[0]?.message?.content?.trim() || FALLBACK_REPLY;
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Ошибка /api/chat:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка чата", detail: String(error) },
      { status: 500 }
    );
  }
}
