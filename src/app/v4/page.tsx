import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { V4Header } from "@/components/v4/V4Header";
import { V4Hero } from "@/components/v4/V4Hero";
import { V4Calculator } from "@/components/v4/V4Calculator";
import { V4CatalogGrid, type V4CatalogItem } from "@/components/v4/V4CatalogGrid";
import { V4B2BHub } from "@/components/v4/V4B2BHub";
import { V4Fleet } from "@/components/v4/V4Fleet";
import { V4Footer } from "@/components/v4/V4Footer";

export const metadata: Metadata = {
  title: "PESOK-METALL — металлопрокат, песок и щебень с доставкой в день заказа",
  description:
    "Металлопрокат, песок, щебень и грунт с доставкой по Москве и МО в день заказа. Розница и опт, соответствие ГОСТ, собственный автопарк.",
};

export const dynamic = "force-dynamic";

export default async function V4Page() {
  // Реальные товары из БД: металл + сыпучие
  const [products, fleet] = await Promise.all([
    prisma.product.findMany({
      take: 300,
      orderBy: { updatedAt: "desc" },
      include: { category: true },
    }),
    prisma.fleetVehicle.findMany({
      where: { isActive: true },
      orderBy: { baseFare: "asc" },
    }),
  ]);

  const items: V4CatalogItem[] = products
    .filter((p) => p.priceRetailBase != null)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryName: p.category.name,
      price: Number(p.priceRetailBase),
      unit: p.unit,
      imageUrl: p.imageUrl,
      imageLocal: p.imageLocal,
      domain: p.type === "METALL" ? "metal" : "sand",
    }));

  const fleetData = fleet.map((v) => ({
    id: v.id,
    name: v.name,
    maxWeightKg: Number(v.maxWeightKg),
    maxLengthMeters: Number(v.maxLengthMeters),
    baseFare: Number(v.baseFare),
    perKmCharge: Number(v.perKmCharge),
  }));

  return (
    <div className="min-h-screen bg-[#1A1D20] font-sans antialiased">
      <V4Header />
      <main>
        <V4Hero />
        <V4Calculator />
        <V4CatalogGrid items={items} />
        <V4B2BHub />
        <V4Fleet fleet={fleetData} />
      </main>
      <V4Footer />
    </div>
  );
}
