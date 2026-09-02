import { PrismaClient, ProductType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ---- Гео-зоны (мультиподдоменность) ----
  const zones = [
    { slug: "moscow", name: "Москва", isRegion: false, multiplier: 1.0 },
    { slug: "balashiha", name: "Балашиха", isRegion: true, multiplier: 1.15 },
    { slug: "podolsk", name: "Подольск", isRegion: true, multiplier: 1.2 },
    { slug: "mitino", name: "Митино", isRegion: false, multiplier: 1.05 },
    { slug: "lyubertsy", name: "Люберцы", isRegion: true, multiplier: 1.1 },
  ];
  for (const z of zones) {
    await prisma.geoZone.upsert({
      where: { slug: z.slug },
      update: { name: z.name, isRegion: z.isRegion, deliveryTariffMultiplier: z.multiplier },
      create: { slug: z.slug, name: z.name, isRegion: z.isRegion, deliveryTariffMultiplier: z.multiplier },
    });
  }

  // ---- Категории ----
  const categories = [
    { slug: "armatura", name: "Арматура" },
    { slug: "truby", name: "Трубы" },
    { slug: "listy", name: "Листы" },
    { slug: "setka", name: "Сетка" },
    { slug: "pesok", name: "Песок" },
    { slug: "shcheben", name: "Щебень" },
  ];
  const categoryIds: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
    categoryIds[c.slug] = row.id;
  }

  // ---- Товары ----
  const products = [
    {
      slug: "armatura-a500s-12mm",
      name: "Арматура А500С 12 мм",
      categorySlug: "armatura",
      type: ProductType.METALL,
      priceCost: 38.5,
      priceRetailBase: 52,
      weightKg: 0.888,
      density: null,
      stock: 12000,
      sourceUrl: null,
      attributes: [
        { key: "diameter", value: "12мм" },
        { key: "steel_grade", value: "А500С" },
        { key: "gost", value: "ГОСТ 34028-2016" },
        { key: "length", value: "11.7 м" },
      ],
    },
    {
      slug: "truba-profilnaya-40x20x2",
      name: "Труба профильная 40x20x2",
      categorySlug: "truby",
      type: ProductType.METALL,
      priceCost: 148,
      priceRetailBase: 189,
      weightKg: 1.78,
      density: null,
      stock: 5400,
      sourceUrl: null,
      attributes: [
        { key: "section", value: "40x20 мм" },
        { key: "wall", value: "2 мм" },
        { key: "steel_grade", value: "Ст3сп" },
        { key: "length", value: "6 м" },
      ],
    },
    {
      slug: "list-goryachekatanyy-3mm",
      name: "Лист горячекатаный 3 мм",
      categorySlug: "listy",
      type: ProductType.METALL,
      priceCost: 2100,
      priceRetailBase: 2650,
      weightKg: 23.55,
      density: null,
      stock: 800,
      sourceUrl: null,
      attributes: [
        { key: "thickness", value: "3 мм" },
        { key: "format", value: "1500x6000 мм" },
        { key: "gost", value: "ГОСТ 19903-2015" },
      ],
    },
    {
      slug: "setka-kladovaya-50x50x3",
      name: "Сетка кладочная 50x50x3",
      categorySlug: "setka",
      type: ProductType.METALL,
      priceCost: 95,
      priceRetailBase: 128,
      weightKg: 1.5,
      density: null,
      stock: 3000,
      sourceUrl: null,
      attributes: [
        { key: "cell", value: "50x50 мм" },
        { key: "wire", value: "3 мм" },
        { key: "format", value: "0.5x2 м" },
      ],
    },
    {
      slug: "pesok-mytyy-bag-30kg",
      name: "Песок мытый — мешок 30 кг",
      categorySlug: "pesok",
      type: ProductType.BAG_30KG,
      priceCost: 120,
      priceRetailBase: 190,
      weightKg: 30,
      density: 1600,
      stock: 1500,
      sourceUrl: null,
      attributes: [
        { key: "fraction", value: "0.5-2.5 мм" },
        { key: "packaging", value: "мешок 30 кг" },
        { key: "gost", value: "ГОСТ 8736-2014" },
      ],
    },
    {
      slug: "pesok-mytyy-bigbag-1t",
      name: "Песок мытый — биг-бег 1 т",
      categorySlug: "pesok",
      type: ProductType.BIG_BAG_1TON,
      priceCost: 3200,
      priceRetailBase: 4700,
      weightKg: 1000,
      density: 1600,
      stock: 400,
      sourceUrl: null,
      attributes: [
        { key: "fraction", value: "0.5-2.5 мм" },
        { key: "packaging", value: "биг-бег 1 т (МКР)" },
        { key: "gost", value: "ГОСТ 8736-2014" },
      ],
    },
    {
      slug: "shcheben-granitnyy-5-20-bag-30kg",
      name: "Щебень гранитный 5-20 — мешок 30 кг",
      categorySlug: "shcheben",
      type: ProductType.BAG_30KG,
      priceCost: 180,
      priceRetailBase: 260,
      weightKg: 30,
      density: 1400,
      stock: 900,
      sourceUrl: null,
      attributes: [
        { key: "fraction", value: "5-20 мм" },
        { key: "packaging", value: "мешок 30 кг" },
        { key: "gost", value: "ГОСТ 8267-93" },
      ],
    },
    {
      slug: "shcheben-granitnyy-5-20-bigbag-1t",
      name: "Щебень гранитный 5-20 — биг-бег 1 т",
      categorySlug: "shcheben",
      type: ProductType.BIG_BAG_1TON,
      priceCost: 4800,
      priceRetailBase: 6400,
      weightKg: 1000,
      density: 1400,
      stock: 250,
      sourceUrl: null,
      attributes: [
        { key: "fraction", value: "5-20 мм" },
        { key: "packaging", value: "биг-бег 1 т (МКР)" },
        { key: "gost", value: "ГОСТ 8267-93" },
      ],
    },
  ];

  const productIds: Record<string, string> = {};
  for (const p of products) {
    const { attributes, categorySlug, ...data } = p;
    const row = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...data, categoryId: categoryIds[categorySlug] },
      create: { ...data, categoryId: categoryIds[categorySlug] },
    });
    productIds[p.slug] = row.id;
    await prisma.productAttribute.deleteMany({ where: { productId: row.id } });
    await prisma.productAttribute.createMany({
      data: attributes.map((a) => ({ ...a, productId: row.id })),
    });
  }

  // ---- Гео-цены (локальная цена = базовая * тарифный коэффициент зоны) ----
  const dbZones = await prisma.geoZone.findMany();
  for (const zone of dbZones) {
    for (const p of products) {
      const productId = productIds[p.slug];
      const localPrice = Number(p.priceRetailBase) * Number(zone.deliveryTariffMultiplier);
      await prisma.geoProductData.upsert({
        where: { geoZoneId_productId: { geoZoneId: zone.id, productId } },
        update: { localPrice },
        create: {
          geoZoneId: zone.id,
          productId,
          localPrice,
          seoTitle: `${p.name} — купить с доставкой в ${zone.name}`,
          seoDescription: `${p.name} по цене ${Math.round(localPrice)} ₽ с доставкой в ${zone.name} в день заказа. Розница и опт, соответствует ГОСТ.`,
        },
      });
    }
  }

  // ---- Автопарк ----
  const fleet = [
    { name: "Газель (борт)", maxWeightKg: 1500, maxLengthMeters: 3.0, baseFare: 2500, perKmCharge: 35, isActive: true },
    { name: "Газель Некст удлиненная", maxWeightKg: 2000, maxLengthMeters: 4.0, baseFare: 3000, perKmCharge: 40, isActive: true },
    { name: "Манипулятор КАМАЗ", maxWeightKg: 10000, maxLengthMeters: 6.0, baseFare: 6500, perKmCharge: 60, isActive: true },
    { name: "Самосвал КАМАЗ", maxWeightKg: 20000, maxLengthMeters: 6.0, baseFare: 7000, perKmCharge: 55, isActive: true },
  ];
  await prisma.fleetVehicle.deleteMany();
  await prisma.fleetVehicle.createMany({ data: fleet });

  // ---- Рекламная кампания (пример для арматуры) ----
  const armaturaId = productIds["armatura-a500s-12mm"];
  await prisma.adCampaign.upsert({
    where: { productId: armaturaId },
    update: { cpcBid: 35, maxBidLimit: 120, clicks: 120, conversions: 9, roi: 2.4 },
    create: {
      productId: armaturaId,
      yandexDirectId: "direct-000001",
      cpcBid: 35,
      maxBidLimit: 120,
      clicks: 120,
      conversions: 9,
      roi: 2.4,
    },
  });

  // ---- Конкуренты (пример) ----
  await prisma.competitorPrice.upsert({
    where: { id: "seed-competitor-armatura" },
    update: { priceFound: 55, url: "https://pesok-metall.ru/price-check", competitorName: "Конкурент 1" },
    create: {
      id: "seed-competitor-armatura",
      productId: armaturaId,
      competitorName: "Конкурент 1",
      url: "https://pesok-metall.ru/price-check",
      priceFound: 55,
    },
  });

  // ---- JSON-driven конфиги страниц (Шаг 5) ----
  const homeBlocks = [
    {
      type: "MainHeroBanner",
      title: "Металлопрокат, песок и щебень с доставкой в день заказа",
      subtitle:
        "Арматура, трубы, листы и сетка с нашего склада плюс сыпучие материалы в мешках по 30 кг и биг-бегах по 1 тонне. Москва и вся Московская область.",
      ctaLabel: "Рассчитать доставку",
      ctaHref: "#calculator",
      secondaryCtaLabel: "Смотреть каталог",
      secondaryCtaHref: "#catalog",
    },
    {
      type: "ModernSeoBlog",
      title: "Аналитика и советы по стройматериалам",
    },
    {
      type: "InteractiveCalculator",
      title: "ИИ-калькулятор доставки",
      description:
        "Переведите площадь и толщину засыпки в мешки и биг-беги, а ИИ подберёт оптимальную машину из автопарка.",
    },
    {
      type: "LiveProductGrid",
      title: "Хиты продаж",
      categorySlugs: [],
      limit: 8,
    },
    {
      type: "AiChatWidget",
      title: "Консультация с ИИ-менеджером",
      placeholder: "Например: сколько мешков песка нужно на 20 м² стяжки 5 см?",
    },
    {
      type: "InvoiceGeneratorCard",
      title: "Счет на оплату онлайн",
      description: "Сформируйте счёт за 30 секунд — без звонков и ожидания менеджера.",
    },
  ];

  await prisma.pageConfig.upsert({
    where: { slug: "home" },
    update: { theme: "industrial-orange", blocks: homeBlocks as any },
    create: { slug: "home", theme: "industrial-orange", blocks: homeBlocks as any },
  });

  const balashihaBlocks = [
    {
      type: "MainHeroBanner",
      title: "Металлопрокат и сыпучие материалы в Балашихе",
      subtitle:
        "Доставка в Балашиху в день заказа: арматура, трубы, листы, сетка, песок и щебень в мешках и биг-бегах. Розница и опт.",
      ctaLabel: "Рассчитать доставку",
      ctaHref: "#calculator",
      secondaryCtaLabel: "Смотреть каталог",
      secondaryCtaHref: "#catalog",
    },
    {
      type: "InteractiveCalculator",
      title: "ИИ-калькулятор доставки в Балашиху",
      description: "Подбор тары и машины с учётом локального тарифа доставки.",
    },
    {
      type: "LiveProductGrid",
      title: "Товары с доставкой в Балашиху",
      categorySlugs: [],
      limit: 8,
    },
    {
      type: "AiChatWidget",
      title: "ИИ-менеджер Балашихи",
      placeholder: "Спросите про доставку в Балашиху...",
    },
    {
      type: "InvoiceGeneratorCard",
      title: "Счет на оплату онлайн",
      description: "Сформируйте счёт за 30 секунд — без звонков и ожидания менеджера.",
    },
  ];

  await prisma.pageConfig.upsert({
    where: { slug: "geo:balashiha" },
    update: { theme: "industrial-orange", blocks: balashihaBlocks as any },
    create: { slug: "geo:balashiha", theme: "industrial-orange", blocks: balashihaBlocks as any },
  });

  console.log("Seed завершен: гео-зоны, категории, товары, автопарк, реклама, PageConfig.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
