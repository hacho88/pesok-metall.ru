"use client";

import { CatalogSections } from "@/components/blocks/CatalogSections";
import { MainHeroBanner } from "@/components/blocks/MainHeroBanner";
import { InteractiveCalculator } from "@/components/blocks/InteractiveCalculator";
import { ProductGridCards, DEMO_PRODUCTS } from "@/components/blocks/ProductGridCards";
import { AiChatWidget } from "@/components/blocks/AiChatWidget";
import { InvoiceGeneratorCard } from "@/components/blocks/InvoiceGeneratorCard";
import { Advantages } from "@/components/blocks/Advantages";
import { Stats } from "@/components/blocks/Stats";
import { DeliveryZones } from "@/components/blocks/DeliveryZones";
import { Faq } from "@/components/blocks/Faq";
import { Testimonials } from "@/components/blocks/Testimonials";
import type { PageBlock } from "@/types/page-builder";
import type { FleetVehicleLike } from "@/lib/calculator";

const PREVIEW_FLEET: FleetVehicleLike[] = [
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

// Рендер блока для канваса редактора: живые компоненты + демо-данные вместо БД
export function PreviewBlock({ block }: { block: PageBlock }) {
  switch (block.type) {
    case "CatalogSections":
      return <CatalogSections {...block} />;
    case "MainHeroBanner":
      return <MainHeroBanner {...block} />;
    case "InteractiveCalculator":
      return <InteractiveCalculator {...block} fleet={PREVIEW_FLEET} />;
    case "LiveProductGrid":
      return (
        <section className="block-section">
          <div className="mb-8">
            <h2 className="block-heading">{block.title}</h2>
          </div>
          <ProductGridCards
            products={DEMO_PRODUCTS.slice(0, block.limit ?? 8)}
          />
        </section>
      );
    case "AiChatWidget":
      return <AiChatWidget {...block} />;
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
    default:
      return null;
  }
}
