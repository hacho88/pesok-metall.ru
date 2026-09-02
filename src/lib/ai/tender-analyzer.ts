import { deepseek, DEEPSEEK_MODELS, requireDeepSeek } from "./deepseek";
import { prisma } from "@/lib/prisma";

export interface TenderAnalysisInput {
  tenderNumber: string;
  title: string;
  customer: string;
  initialPrice: number;
  items?: Array<{ name: string; qty: number; unit: string }>;
}

export interface TenderAnalysisResult {
  calculatedCost: number;
  aiStatus: "RECOMMENDED" | "REJECTED" | "HOLD";
  aiReport: string;
}

// ИИ-аналитик тендеров: рассчитывает себестоимость, маржу и выносит вердикт
export async function analyzeTender(
  data: TenderAnalysisInput
): Promise<TenderAnalysisResult> {
  requireDeepSeek();

  const systemPrompt = `Ты — тендерный аналитик строительной компании pesok-metall.ru (поставка металлопроката, песка, щебня, бетона по Москве и МО).
Твоя задача — проанализировать тендер и вынести вердикт: участвовать (RECOMMENDED), отказаться (REJECTED) или взять паузу (HOLD).

Учитывай:
- себестоимость материалов и логистику (в среднем 65-80% от цены поставки);
- маржу: минимум 15% для участия;
- риски: крупные штрафы, сжатые сроки, сомнительный заказчик;
- конкуренцию: если цена ниже себестоимости — REJECTED.

Выдай СТРОГО JSON:
- calculatedCost: (число, расчётная себестоимость исполнения тендера в рублях)
- aiStatus: ("RECOMMENDED" | "REJECTED" | "HOLD")
- aiReport: (строка, подробный отчёт на русском: расчёт маржи, риски, рекомендация)`;

  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.reasoner,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(data) },
    ],
    response_format: { type: "json_object" },
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content) as Partial<TenderAnalysisResult>;

  return {
    calculatedCost: Number(parsed.calculatedCost) || data.initialPrice * 0.75,
    aiStatus:
      parsed.aiStatus === "RECOMMENDED" || parsed.aiStatus === "REJECTED"
        ? parsed.aiStatus
        : "HOLD",
    aiReport:
      parsed.aiReport ||
      "Анализ выполнен автоматически. Подробный отчёт недоступен.",
  };
}

// Сохраняет тендер в БД и возвращает результат анализа
export async function saveTenderAnalysis(
  data: TenderAnalysisInput
): Promise<TenderAnalysisResult> {
  const result = await analyzeTender(data);

  await prisma.tenderAnalysis.upsert({
    where: { tenderNumber: data.tenderNumber },
    update: {
      title: data.title,
      customer: data.customer,
      initialPrice: data.initialPrice,
      calculatedCost: result.calculatedCost,
      aiStatus: result.aiStatus,
      aiReport: result.aiReport,
    },
    create: {
      tenderNumber: data.tenderNumber,
      title: data.title,
      customer: data.customer,
      initialPrice: data.initialPrice,
      calculatedCost: result.calculatedCost,
      aiStatus: result.aiStatus,
      aiReport: result.aiReport,
    },
  });

  return result;
}
