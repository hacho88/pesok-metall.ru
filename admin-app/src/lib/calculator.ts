export interface BulkCalculation {
  volumeM3: number;
  totalWeightKg: number;
  bags30kg: number;
  bigBags1Ton: number;
}

export interface FleetVehicleLike {
  id: string;
  name: string;
  maxWeightKg: number | string;
  maxLengthMeters: number | string;
  baseFare: number | string;
  perKmCharge: number | string;
  isActive: boolean;
}

// Алгоритм перевода объема в физическую тару на основе плотности
export function calculateBulkMaterials(
  areaM2: number,
  thicknessCm: number,
  density: number
): BulkCalculation {
  const volumeM3 = areaM2 * (thicknessCm / 100);
  const totalWeightKg = volumeM3 * density;

  const bags30kg = Math.ceil(totalWeightKg / 30);
  const bigBags1Ton = Math.ceil(totalWeightKg / 1000);

  return { volumeM3, totalWeightKg, bags30kg, bigBags1Ton };
}

// Алгоритм автоподбора оптимального грузовика под габариты и вес заказа
export function assignOptimalVehicle<T extends FleetVehicleLike>(
  weightKg: number,
  maxLengthMeters: number,
  fleet: T[]
): T | null {
  const fitVehicles = fleet
    .filter(
      (v) =>
        v.isActive &&
        weightKg <= Number(v.maxWeightKg) &&
        maxLengthMeters <= Number(v.maxLengthMeters)
    )
    .sort((a, b) => Number(a.baseFare) - Number(b.baseFare));

  return fitVehicles.length > 0 ? fitVehicles[0] : null;
}

// Стоимость доставки: фиксированная подача + километраж от МКАД
export function estimateDeliveryCost(
  vehicle: FleetVehicleLike | null,
  distanceKm: number
): number {
  if (!vehicle) return 0;
  return Number(vehicle.baseFare) + Number(vehicle.perKmCharge) * Math.max(0, distanceKm);
}

export function formatRubles(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: digits,
  }).format(value);
}
