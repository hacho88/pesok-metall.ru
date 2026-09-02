"use client";

import { AiCalculator } from "@/components/AiCalculator";
import type { FleetVehicleLike } from "@/lib/calculator";
import type { InteractiveCalculatorBlock } from "@/types/page-builder";

interface InteractiveCalculatorProps extends InteractiveCalculatorBlock {
  fleet: FleetVehicleLike[];
  geoZoneName?: string;
}

export function InteractiveCalculator({
  title,
  description,
  fleet,
  geoZoneName,
}: InteractiveCalculatorProps) {
  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </div>
      <AiCalculator
        fleet={fleet}
        geoZoneName={geoZoneName}
        pricePerBag30={190}
        pricePerBigBag={4700}
        pricePerKgMetal={52}
      />
    </section>
  );
}
