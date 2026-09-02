import { deepseek, DEEPSEEK_MODELS, isDeepSeekConfigured } from "@/lib/ai/deepseek";
import { prisma } from "@/lib/prisma";

const MOSCOW_CENTER = { lat: 55.7558, lng: 37.6173 };

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestZone(lat: number, lng: number): string {
  const centers: Record<string, { lat: number; lng: number }> = {
    moscow: { lat: 55.7558, lng: 37.6173 },
    balashiha: { lat: 55.8094, lng: 37.9581 },
    podolsk: { lat: 55.4311, lng: 37.5453 },
    lyubertsy: { lat: 55.6742, lng: 37.9025 },
    khimki: { lat: 55.8887, lng: 37.4411 },
    mytishchi: { lat: 55.9112, lng: 37.7339 },
  };
  let nearest = "moscow";
  let minDist = Infinity;
  for (const [slug, c] of Object.entries(centers)) {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < minDist) { minDist = d; nearest = slug; }
  }
  return nearest;
}

function calcLogisticsCost(lat: number, lng: number): number {
  return Math.round(1500 + haversineKm(MOSCOW_CENTER.lat, MOSCOW_CENTER.lng, lat, lng) * 45);
}

function generateSimulatedLeads() {
  const types = [
    { category: "construction_site", prefix: "Стройплощадка", addrs: ["МКАД 85км", "МКАД 47км", "Ленинградское ш 23", "Каширское ш 11", "Новорижское ш 35"] },
    { category: "concrete_plant", prefix: "Бетонный завод", addrs: ["МКАД 92км", "МКАД 35км", "Носовихинское ш 12", "Энтузиастов ш 28"] },
    { category: "contractor_office", prefix: "Стройфирма", addrs: ["Тверская 18", "Профсоюзная 56", "Ленинский пр 65", "Дмитровское ш 60"] },
    { category: "building_site", prefix: "ЖК", addrs: ["Новое Кожухово", "Некрасовка", "Развилка", "Внуковское"] },
  ];
  const leads: Array<{ businessName: string; category: string; address: string; lat: number; lng: number; phone: string | null; email: string | null; website: string | null }> = [];
  let idx = 0;
  for (const t of types) {
    for (const addr of t.addrs) {
      idx++;
      leads.push({
        businessName: `${t.prefix} №${idx}`,
        category: t.category,
        address: addr,
        lat: parseFloat((55.6 + Math.random() * 0.4).toFixed(6)),
        lng: parseFloat((37.3 + Math.random() * 0.8).toFixed(6)),
        phone: Math.random() > 0.3 ? `+7 (495) ${100 + idx}-${10 + idx}-${10 + idx}` : null,
        email: Math.random() > 0.5 ? `info@stroy${idx}.ru` : null,
        website: Math.random() > 0.6 ? `https://stroy${idx}.ru` : null,
      });
    }
  }
  return leads;
}

export async function scrapeMapLeads() {
  const leads = generateSimulatedLeads();
  let created = 0, skipped = 0;
  for (const lead of leads) {
    const existing = await prisma.mapLead.findFirst({ where: { businessName: lead.businessName, address: lead.address }, select: { id: true } });
    if (existing) { skipped++; continue; }
    await prisma.mapLead.create({
      data: {
        ...lead,
        zoneSlug: findNearestZone(lead.lat, lead.lng),
        logisticsCost: calcLogisticsCost(lead.lat, lead.lng),
      },
    });
    created++;
  }
  return { created, skipped, total: leads.length };
}

export async function generateColdProposal(mapLeadId: string) {
  if (!isDeepSeekConfigured()) throw new Error("DEEPSEEK_API_KEY не задан");
  const lead = await prisma.mapLead.findUnique({ where: { id: mapLeadId } });
  if (!lead) throw new Error("Лид не найден");

  const products = await prisma.product.findMany({
    where: { isOnOrder: false, priceRetailBase: { not: null } },
    take: 5, orderBy: { name: "asc" }, include: { category: true },
  });
  const productLines = products.map((p) => `- ${p.name}: ${p.priceRetailBase} ₽${p.unit ? `/${p.unit}` : ""}`).join("\n");

  const sys = `Ты — B2B менеджер pesok-metall.ru. Напиши персонализированное КП для строительной компании. Объём 800-1500 знаков. JSON: {"subject":"","body":""}`;
  const usr = `КП для: ${lead.businessName} (${lead.category}), адрес: ${lead.address}, логистика: ${lead.logisticsCost} ₽. Товары:\n${productLines}`;

  const resp = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODELS.chat,
    messages: [{ role: "system", content: sys }, { role: "user", content: usr }],
    response_format: { type: "json_object" },
    temperature: 0.7, max_tokens: 1200,
  });
  const result = JSON.parse(resp.choices[0].message.content || "{}");

  await prisma.mapLead.update({
    where: { id: mapLeadId },
    data: { proposalText: `Тема: ${result.subject}\n\n${result.body}`, proposalStatus: "queued_email" },
  });

  // Also create a Lead entry for CRM
  await prisma.lead.create({
    data: {
      name: lead.businessName,
      phone: lead.phone || "",
      email: lead.email,
      source: "map_scraper",
      message: `КП сгенерировано для ${lead.address}. Статус: ${result.subject}`,
    },
  });

  return { subject: result.subject, body: result.body };
}

export async function processAllPendingProposals() {
  const pending = await prisma.mapLead.findMany({ where: { proposalStatus: "draft" }, take: 20 });
  let generated = 0, errors = 0;
  for (const lead of pending) {
    try {
      await generateColdProposal(lead.id);
      generated++;
      await new Promise((r) => setTimeout(r, 600));
    } catch {
      errors++;
    }
  }
  return { generated, errors, total: pending.length };
}
