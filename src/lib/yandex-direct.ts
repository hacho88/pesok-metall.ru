/**
 * Клиент Yandex Direct API v5.
 * Настройка: env YANDEX_DIRECT_TOKEN (OAuth-токен) + YANDEX_DIRECT_LOGIN (логин клиента).
 * Документация: https://yandex.ru/dev/direct/doc/ru/concepts/about
 */

const API_URL = "https://api.direct.yandex.com/json/v5";

export interface DirectCampaign {
  Id: number;
  Name: string;
  Status: string; // ACCEPTED | DRAFT | MODERATION | REJECTED
  State: string; // ON | OFF | SUSPENDED | ARCHIVED
  StartDate?: string;
  Type?: string;
  DailyBudget?: { Amount: number; Mode: string };
}

export interface CampaignStats {
  campaignId: number;
  campaignName: string;
  impressions: number;
  clicks: number;
  cost: number; // рубли, с НДС
  ctr: number; // %
  avgCpc: number; // рубли
  conversions: number;
}

export interface DirectData {
  configured: boolean;
  campaigns: DirectCampaign[];
  stats: CampaignStats[];
  totals: { impressions: number; clicks: number; cost: number; ctr: number; conversions: number };
  error?: string;
}

function getConfig(): { token: string; login: string } | null {
  const token = process.env.YANDEX_DIRECT_TOKEN;
  const login = process.env.YANDEX_DIRECT_LOGIN;
  if (!token || !login) return null;
  return { token, login };
}

/** JSON-RPC вызов сервиса (campaigns, adgroups и т.д.) */
async function directCall<T>(service: string, method: string, params: object): Promise<T> {
  const cfg = getConfig();
  if (!cfg) throw new Error("Yandex Direct не настроен");

  const res = await fetch(`${API_URL}/${service}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Client-Login": cfg.login,
      "Accept-Language": "ru",
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ method, params }),
    cache: "no-store",
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.error_detail || data.error.error_string || "Ошибка API Директа");
  }
  return data.result as T;
}

/** Список кампаний */
export async function getCampaigns(): Promise<DirectCampaign[]> {
  const result = await directCall<{ Campaigns: DirectCampaign[] }>("campaigns", "get", {
    SelectionCriteria: {},
    FieldNames: ["Id", "Name", "Status", "State", "StartDate", "Type", "DailyBudget"],
    Page: { Limit: 100 },
  });
  return result.Campaigns ?? [];
}

/** Парсинг TSV-отчёта Reports API */
function parseReportTsv(text: string): CampaignStats[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  // Находим строку заголовков (начинается с CampaignId или содержит табы с именами полей)
  const headerIdx = lines.findIndex((l) => l.split("\t").includes("CampaignId"));
  if (headerIdx === -1) return [];

  const headers = lines[headerIdx].split("\t");
  const stats: CampaignStats[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("Total rows:")) break;
    const cols = line.split("\t");
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = cols[idx] ?? ""));

    stats.push({
      campaignId: Number(row.CampaignId) || 0,
      campaignName: row.CampaignName || "",
      impressions: Number(row.Impressions) || 0,
      clicks: Number(row.Clicks) || 0,
      cost: Number(row.Cost) || 0,
      ctr: Number(row.Ctr) || 0,
      avgCpc: Number(row.AvgCpc) || 0,
      conversions: Number(row.Conversions) || 0,
    });
  }
  return stats;
}

/** Статистика по кампаниям за период (Reports API, TSV) */
export async function getCampaignStats(dateFrom: string, dateTo: string): Promise<CampaignStats[]> {
  const cfg = getConfig();
  if (!cfg) throw new Error("Yandex Direct не настроен");

  const body = {
    params: {
      SelectionCriteria: { DateFrom: dateFrom, DateTo: dateTo },
      FieldNames: ["CampaignId", "CampaignName", "Impressions", "Clicks", "Cost", "Ctr", "AvgCpc", "Conversions"],
      ReportName: `admin-${Date.now()}`,
      ReportType: "CAMPAIGN_PERFORMANCE_REPORT",
      DateRangeType: "CUSTOM_DATE",
      Format: "TSV",
      IncludeVAT: "YES",
      IncludeDiscount: "NO",
    },
  };

  // Reports API: 200 = готов TSV, 201/202 = отчёт формируется — ждём и повторяем
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${API_URL}/reports`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Client-Login": cfg.login,
        "Accept-Language": "ru",
        processingMode: "auto",
        returnMoneyInMicros: "false",
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (res.status === 200) {
      return parseReportTsv(await res.text());
    }
    if (res.status === 201 || res.status === 202) {
      await new Promise((r) => setTimeout(r, 3000 + attempt * 2000));
      continue;
    }
    const errText = await res.text();
    throw new Error(`Reports API: ${res.status} ${errText.slice(0, 300)}`);
  }
  throw new Error("Отчёт не успел сформироваться — попробуйте ещё раз");
}

/** Всё для админки: кампании + статистика за N дней */
export async function getDirectData(days = 30): Promise<DirectData> {
  if (!getConfig()) {
    return {
      configured: false,
      campaigns: [],
      stats: [],
      totals: { impressions: 0, clicks: 0, cost: 0, ctr: 0, conversions: 0 },
    };
  }

  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const [campaigns, stats] = await Promise.all([
    getCampaigns(),
    getCampaignStats(fmt(from), fmt(to)),
  ]);

  const totals = stats.reduce(
    (acc, s) => ({
      impressions: acc.impressions + s.impressions,
      clicks: acc.clicks + s.clicks,
      cost: acc.cost + s.cost,
      ctr: 0,
      conversions: acc.conversions + s.conversions,
    }),
    { impressions: 0, clicks: 0, cost: 0, ctr: 0, conversions: 0 }
  );
  totals.ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

  return { configured: true, campaigns, stats, totals };
}
