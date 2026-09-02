import { deepseek, DEEPSEEK_MODELS, requireDeepSeek } from "./deepseek";
import { prisma } from "@/lib/prisma";

export interface BidAnalysisInput {
  productName: string;
  costPrice: number;
  retailPrice: number;
  competitorAverage: number;
  currentBid: number;
  maxBidLimit: number;
  conversionRate: number;
}

export interface BidAnalysisResult {
  priceRecommendation: number;
  bidAction: "UP" | "DOWN" | "HOLD";
  targetBid: number;
  reasoning: string;
}

// ИИ-биддер ставок Директа и аналитик конкурентов (DeepSeek-R1)
export async function analyzeAdBidsAndPricing(
  data: BidAnalysisInput
): Promise<BidAnalysisResult> {
  requireDeepSeek();

  const systemPrompt = `Ты — финансовый аналитик и сверхразумный ИИ-биддер рекламных кампаний Яндекс.Директ. Твоя задача — проанализировать данные по товару, маржинальность, цены конкурентов в Москве и выдать решение по корректировке цены на нашем сайте и ставки CPC в Яндексе для удержания ТОП-1 и максимизации прибыли.
Используй глубокое пошаговое рассуждение (модель рассуждений Chain-of-Thought). Выдай финальный результат СТРОГО в формате JSON с полями:
- priceRecommendation: (число, новая рекомендуемая цена для сайта)
- bidAction: ("UP" | "DOWN" | "HOLD")
- targetBid: (число, новая ставка в рублях для Яндекс.Директ API)
- reasoning: (строка, краткое логичное объяснение твоего решения на русском языке для админ-панели)`;

  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.reasoner, // DeepSeek-R1
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(data) },
    ],
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content) as Partial<BidAnalysisResult>;

  return {
    priceRecommendation: Number(parsed.priceRecommendation) || data.retailPrice,
    bidAction:
      parsed.bidAction === "UP" || parsed.bidAction === "DOWN"
        ? parsed.bidAction
        : "HOLD",
    targetBid: Number(parsed.targetBid) || data.currentBid,
    reasoning: parsed.reasoning || "Решение принято без объяснений.",
  };
}

// Цикл автопилота: обходит товары с рекламными кампаниями, пересчитывает цены и ставки
export async function runBidAnalysisCycle(productId?: string): Promise<{
  analyzed: number;
  results: Array<{ productName: string; result: BidAnalysisResult }>;
}> {
  requireDeepSeek();

  const campaigns = await prisma.adCampaign.findMany({
    where: productId ? { productId } : undefined,
    include: {
      product: {
        include: {
          competitorPrices: { orderBy: { updatedAt: "desc" } },
        },
      },
    },
  });

  const results: Array<{ productName: string; result: BidAnalysisResult }> = [];

  for (const campaign of campaigns) {
    const { product } = campaign;

    // Товар без цены («под заказ») не участвует в анализе ставок
    if (product.priceRetailBase == null || product.priceCost == null) continue;

    const competitorPrices = product.competitorPrices.map((c) => Number(c.priceFound));
    const competitorAverage =
      competitorPrices.length > 0
        ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
        : Number(product.priceRetailBase);

    const conversionRate =
      campaign.clicks > 0 ? campaign.conversions / campaign.clicks : 0;

    const result = await analyzeAdBidsAndPricing({
      productName: product.name,
      costPrice: Number(product.priceCost),
      retailPrice: Number(product.priceRetailBase),
      competitorAverage,
      currentBid: Number(campaign.cpcBid),
      maxBidLimit: Number(campaign.maxBidLimit),
      conversionRate,
    });

    // Жесткий лимит: ставка не может превысить maxBidLimit
    const safeTargetBid = Math.min(result.targetBid, Number(campaign.maxBidLimit));

    await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: { priceRetailBase: result.priceRecommendation },
      }),
      prisma.adCampaign.update({
        where: { id: campaign.id },
        data: { cpcBid: safeTargetBid },
      }),
    ]);

    results.push({
      productName: product.name,
      result: { ...result, targetBid: safeTargetBid },
    });
  }

  return { analyzed: results.length, results };
}

// ---- AI Budget Predictor ----
export interface BudgetPredictionInput {
  totalBudget: number;
  campaigns: Array<{
    productName: string;
    cpcBid: number;
    clicks: number;
    conversions: number;
    costPrice: number;
    retailPrice: number;
    dailyBudget: number;
  }>;
}

export interface BudgetPredictionResult {
  recommendedDailyBudget: number;
  expectedClicks: number;
  expectedConversions: number;
  expectedRevenue: number;
  expectedProfit: number;
  roas: number;
  allocation: Array<{
    productName: string;
    budgetShare: number;
    reason: string;
  }>;
  reasoning: string;
}

export async function predictAdBudget(data: BudgetPredictionInput): Promise<BudgetPredictionResult> {
  requireDeepSeek();

  const systemPrompt = `Ты — AI-аналитик рекламных кампаний Яндекс.Директ для B2B строительного маркетплейса.
Проанализируй распределение бюджета между кампаниями и предскажи оптимальную стратегию.

Учитывай:
1. ROAS (Return on Ad Spend) по каждой кампании
2. Конверсию из клика в продажу
3. Маржинальность товара (retailPrice - costPrice)
4. Объём кликов и их стоимость (CPC)

Выдай ответ СТРОГО в JSON:
{
  "recommendedDailyBudget": number,
  "expectedClicks": number,
  "expectedConversions": number,
  "expectedRevenue": number,
  "expectedProfit": number,
  "roas": number,
  "allocation": [{ "productName": string, "budgetShare": number (0-1), "reason": string }],
  "reasoning": string
}`;

  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.reasoner,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(data) },
    ],
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content) as Partial<BudgetPredictionResult>;

  return {
    recommendedDailyBudget: Number(parsed.recommendedDailyBudget) || data.totalBudget,
    expectedClicks: Number(parsed.expectedClicks) || 0,
    expectedConversions: Number(parsed.expectedConversions) || 0,
    expectedRevenue: Number(parsed.expectedRevenue) || 0,
    expectedProfit: Number(parsed.expectedProfit) || 0,
    roas: Number(parsed.roas) || 0,
    allocation: Array.isArray(parsed.allocation) ? parsed.allocation : [],
    reasoning: parsed.reasoning || "Анализ выполнен.",
  };
}

// Run budget prediction for all active campaigns
export async function runBudgetPrediction(): Promise<BudgetPredictionResult & { campaignsAnalyzed: number }> {
  requireDeepSeek();

  const campaigns = await prisma.adCampaign.findMany({
    where: { isActive: true },
    include: { product: true },
  });

  if (campaigns.length === 0) {
    return {
      recommendedDailyBudget: 0,
      expectedClicks: 0,
      expectedConversions: 0,
      expectedRevenue: 0,
      expectedProfit: 0,
      roas: 0,
      allocation: [],
      reasoning: "Нет активных кампаний для анализа.",
      campaignsAnalyzed: 0,
    };
  }

  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.cpcBid) * 50, 0);

  const prediction = await predictAdBudget({
    totalBudget,
    campaigns: campaigns.map((c) => ({
      productName: c.product.name,
      cpcBid: Number(c.cpcBid),
      clicks: c.clicks,
      conversions: c.conversions,
      costPrice: Number(c.product.priceCost || 0),
      retailPrice: Number(c.product.priceRetailBase || 0),
      dailyBudget: Number(c.cpcBid) * 50,
    })),
  });

  return { ...prediction, campaignsAnalyzed: campaigns.length };
}
