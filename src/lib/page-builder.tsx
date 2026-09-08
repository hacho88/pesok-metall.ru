import { prisma } from "@/lib/prisma";
import type { PageBlock, PageConfig, GeoZoneInfo, ThemePreset } from "@/types/page-builder";
import { CatalogSections } from "@/components/blocks/CatalogSections";
import { CategoryGrid } from "@/components/blocks/CategoryGrid";
import { FullCatalog } from "@/components/catalog/FullCatalog";
import { getUnifiedTree, getUnifiedProducts, totalInUnifiedTree } from "@/lib/unified-catalog";
import { MainHeroBanner } from "@/components/blocks/MainHeroBanner";
import { InteractiveCalculator } from "@/components/blocks/InteractiveCalculator";
import { LiveProductGrid } from "@/components/blocks/LiveProductGrid";
import { AiChatWidget } from "@/components/blocks/AiChatWidget";
import { InvoiceGeneratorCard } from "@/components/blocks/InvoiceGeneratorCard";
import { Advantages } from "@/components/blocks/Advantages";
import { Stats } from "@/components/blocks/Stats";
import { DeliveryZones } from "@/components/blocks/DeliveryZones";
import { Faq } from "@/components/blocks/Faq";
import { Testimonials } from "@/components/blocks/Testimonials";
import { ModernSeoBlog } from "@/components/blocks/ModernSeoBlog";
import type { FleetVehicleLike } from "@/lib/calculator";

import { AiCalculator } from "@/components/AiCalculator";
import { THEME_STYLE_OF } from "@/lib/theme-styles";
import { getThemeConcept, getThemeConceptMeta, type ThemeConcept } from "@/lib/theme-concepts";
import { ConceptShell } from "@/components/concepts/ConceptShell";
import type { ProductCardData } from "@/components/blocks/ProductGridCards";

const TYPE_LABELS: Record<string, string> = {
  METALL: "Металлопрокат",
  BAG_30KG: "Мешок 30 кг",
  BIG_BAG_1TON: "Биг-бег 1 т",
  GENERAL_CONSTRUCTION: "Общестрой",
};

async function getLiveProducts(block: any, geoZone: GeoZoneInfo | null | undefined): Promise<ProductCardData[]> {
  try {
    // «Хиты продаж» — случайная выборка из ВСЕХ товаров (металл + сыпучие),
    // с приоритетом позиций, у которых есть фото и цена
    const rows = await prisma.product.findMany({
      where:
        block.categorySlugs && block.categorySlugs.length > 0
          ? { category: { slug: { in: block.categorySlugs } } }
          : undefined,
      take: 1000,
      orderBy: [{ stock: "desc" }, { updatedAt: "desc" }],
      include: {
        category: true,
        attributes: true,
        geoData: geoZone ? { where: { geoZoneId: geoZone.id } } : false,
      },
    });

    // Сначала товары с фото и ценой, затем остальные; внутри — случайный порядок
    const withImageAndPrice = rows.filter((p) => (p.imageUrl || p.imageLocal) && p.priceRetailBase != null);
    const rest = rows.filter((p) => !((p.imageUrl || p.imageLocal) && p.priceRetailBase != null));
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    // Гарантируем, что в «Хитах» есть товары каждого типа (металл, мешки, биг-беги)
    const limit = block.limit || 8;
    const byType = new Map<string, typeof rows>();
    for (const p of withImageAndPrice) {
      if (!byType.has(p.type)) byType.set(p.type, []);
      byType.get(p.type)!.push(p);
    }
    const guaranteed: typeof rows = [];
    for (const items of byType.values()) {
      guaranteed.push(...shuffle(items).slice(0, 2));
    }
    const remaining = withImageAndPrice.filter((p) => !guaranteed.includes(p));
    const picked = [...shuffle(guaranteed), ...shuffle(remaining), ...shuffle(rest)].slice(0, limit);

    return picked.map((p) => ({
      id: p.id,
      name: p.name,
      categoryName: p.category.name,
      type: TYPE_LABELS[p.type] ?? p.type,
      price:
        p.priceRetailBase != null
          ? Number(geoZone ? p.geoData[0]?.localPrice ?? p.priceRetailBase : p.priceRetailBase)
          : null,
      isOnOrder: p.isOnOrder,
      unit: p.type === "METALL" ? "за метр" : p.type === "BAG_30KG" ? "за мешок" : "за биг-бег",
      weightKg: Number(p.weightKg),
      attributes: p.attributes.map((a) => ({ key: a.key, value: a.value })),
      imageUrl: p.imageUrl,
      imageLocal: p.imageLocal,
    }));
  } catch {
    return [];
  }
}

/** Каждая тема = палитра (.theme-*) + архитектурный стиль (.style-*) + концепция (.concept-*) */
export const THEME_CLASSES: Record<ThemePreset, string> = Object.fromEntries(
  (Object.keys(THEME_STYLE_OF) as ThemePreset[]).map((t) => [
    t,
    `theme-${t} style-${THEME_STYLE_OF[t]}`,
  ])
) as Record<ThemePreset, string>;

const DEFAULT_FLEET: FleetVehicleLike[] = [
  {
    id: "gazelle",
    name: "Газель (борт)",
    maxWeightKg: 1500,
    maxLengthMeters: 3.0,
    baseFare: 2500,
    perKmCharge: 35,
    isActive: true,
  },
  {
    id: "gazelle-next",
    name: "Газель Некст удлиненная",
    maxWeightKg: 2000,
    maxLengthMeters: 4.0,
    baseFare: 3000,
    perKmCharge: 40,
    isActive: true,
  },
  {
    id: "manipulator",
    name: "Манипулятор КАМАЗ",
    maxWeightKg: 10000,
    maxLengthMeters: 6.0,
    baseFare: 6500,
    perKmCharge: 60,
    isActive: true,
  },
  {
    id: "samosval",
    name: "Самосвал КАМАЗ",
    maxWeightKg: 20000,
    maxLengthMeters: 6.0,
    baseFare: 7000,
    perKmCharge: 55,
    isActive: true,
  },
];

export async function getFleet(): Promise<FleetVehicleLike[]> {
  try {
    const rows = await prisma.fleetVehicle.findMany({
      where: { isActive: true },
      orderBy: { baseFare: "asc" },
    });
    return rows.map((v) => ({
      id: v.id,
      name: v.name,
      maxWeightKg: Number(v.maxWeightKg),
      maxLengthMeters: Number(v.maxLengthMeters),
      baseFare: Number(v.baseFare),
      perKmCharge: Number(v.perKmCharge),
      isActive: v.isActive,
    }));
  } catch {
    return DEFAULT_FLEET;
  }
}

interface PageBuilderProps {
  config: PageConfig;
  geoZone?: GeoZoneInfo | null;
}

export async function PageBuilder({ config, geoZone }: PageBuilderProps) {
  const themeClass = THEME_CLASSES[config.theme] ?? THEME_CLASSES["industrial-orange"];
  const concept = getThemeConcept(config.theme);
  const meta = getThemeConceptMeta(config.theme);
  const fleet = await getFleet();

  // Кастомная тема из БД (создана в админке «Темы») — переопределяет палитру CSS-переменными
  // Также поддерживается override встроенных тем: если в БД есть запись с slug=theme и isCustom=false,
  // её палитра применяется поверх встроенной
  let customPalette: Record<string, string | number> | null = null;
  try {
    const theme = await prisma.theme.findUnique({ where: { slug: config.theme } });
    if (theme) customPalette = theme.palette as Record<string, string | number>;
  } catch {
    // БД недоступна — используем встроенную тему
  }

  const cssVars = customPalette
    ? {
        "--background": customPalette.background,
        "--foreground": customPalette.foreground,
        "--card": customPalette.card,
        "--card-foreground": customPalette.foreground,
        "--popover": customPalette.card,
        "--popover-foreground": customPalette.foreground,
        "--primary": customPalette.primary,
        "--primary-foreground": customPalette.background,
        "--secondary": customPalette.secondary,
        "--secondary-foreground": customPalette.foreground,
        "--muted": customPalette.muted,
        "--muted-foreground": customPalette.mutedForeground,
        "--accent": customPalette.primary,
        "--accent-foreground": customPalette.background,
        "--destructive": "0 84% 60%",
        "--destructive-foreground": "0 0% 100%",
        "--border": customPalette.border,
        "--input": customPalette.border,
        "--ring": customPalette.primary,
        "--radius": `${customPalette.radius ?? 12}px`,
      }
    : {};

  return (
    <ConceptShell concept={concept}>
      <div
        className={`${themeClass} min-h-screen bg-background text-foreground`}
        style={
          {
            fontFamily: meta.bodyVar,
            "--concept-heading": meta.headingVar,
            "--concept-radius": `${meta.radius}px`,
            ...cssVars,
          } as unknown as React.CSSProperties
        }
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-10 sm:px-6 lg:px-8">
          {config.blocks.map((block, index) => (
            <BlockRouter
              key={`${block.type}-${index}`}
              block={block}
              geoZone={geoZone}
              concept={concept}
              fleet={fleet}
            />
          ))}
        </div>
      </div>
    </ConceptShell>
  );
}

async function BlockRouter({
  block,
  geoZone,
  concept,
  fleet,
}: {
  block: PageBlock;
  geoZone?: GeoZoneInfo | null;
  concept: ThemeConcept;
  fleet: FleetVehicleLike[];
}) {
  switch (block.type) {
    case "CatalogSections":
      return <CatalogSections {...block} />;
    case "CategoryGrid":
      return <CategoryGrid {...block} />;
    case "FullCatalog": {
      const [categories, products] = await Promise.all([
        getUnifiedTree(),
        getUnifiedProducts(block.limit || 60),
      ]);
      return (
        <FullCatalog
          {...block}
          categories={categories}
          products={products}
          totalProducts={totalInUnifiedTree(categories)}
        />
      );
    }
    case "MainHeroBanner":
      return (
        <MainHeroBanner 
          {...block} 
          geoZoneName={geoZone?.name} 
          calculator={
            <AiCalculator 
              fleet={fleet} 
              geoZoneName={geoZone?.name}
            />
          }
        />
      );
    case "InteractiveCalculator": {
      return <InteractiveCalculator {...block} fleet={fleet} geoZoneName={geoZone?.name} />;
    }
    case "LiveProductGrid": {
      const products = await getLiveProducts(block, geoZone);
      return <LiveProductGrid {...block} geoZone={geoZone} concept={concept} initialProducts={products} />;
    }
    case "AiChatWidget":
      return <AiChatWidget {...block} geoZoneName={geoZone?.name} />;
    case "InvoiceGeneratorCard":
      return <InvoiceGeneratorCard {...block} />;
    case "Advantages":
      return <Advantages {...block} />;
    case "Stats":
      return <Stats {...block} />;
    case "DeliveryZones":
      return <DeliveryZones {...block} />;
    case "Faq":
      return <Faq {...block} />;
    case "Testimonials":
      return <Testimonials {...block} />;
    case "ModernSeoBlog":
      return <ModernSeoBlog {...block} />;
    default:
      return null;
  }
}
