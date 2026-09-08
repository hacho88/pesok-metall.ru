import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/delivery/calculate?lat=55.7558&lng=37.6173&sum=15000
 * Рассчитывает стоимость доставки по расстоянию от склада.
 * Тарифы — диапазоны: minDistanceKm ≤ расстояние ≤ maxDistanceKm (null = без ограничения).
 * Бесплатная доставка: если сумма заказа ≥ freeFromSum тарифа.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  const sum = parseFloat(searchParams.get("sum") || "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Нужны координаты lat и lng" }, { status: 400 });
  }

  // Получаем настройки склада
  let settings = await prisma.shopSettings.findFirst();
  if (!settings) {
    settings = await prisma.shopSettings.create({ data: {} });
  }

  // Расчёт расстояния (формула гаверсинуса)
  const R = 6371; // радиус Земли в км
  const dLat = ((lat - settings.warehouseLat) * Math.PI) / 180;
  const dLng = ((lng - settings.warehouseLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((settings.warehouseLat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c * 10) / 10;

  // Активные тарифы, отсортированные по minDistanceKm
  const tariffs = await prisma.deliveryTariff.findMany({
    where: { isActive: true },
    orderBy: [{ minDistanceKm: "asc" }, { basePrice: "asc" }],
  });

  if (tariffs.length === 0) {
    return NextResponse.json({
      distanceKm,
      deliveryCost: 0,
      freeDelivery: false,
      message: "Тарифы не настроены",
    });
  }

  // Ищем тариф, чей диапазон покрывает расстояние
  const tariff =
    tariffs.find(
      (t) =>
        (t.minDistanceKm == null || distanceKm >= t.minDistanceKm) &&
        (t.maxDistanceKm == null || distanceKm <= t.maxDistanceKm)
    ) ?? null;

  if (!tariff) {
    // За пределами всех зон — предупреждаем
    const farthest = [...tariffs]
      .filter((t) => t.maxDistanceKm != null)
      .sort((a, b) => (b.maxDistanceKm ?? 0) - (a.maxDistanceKm ?? 0))[0];
    const maxKm = farthest?.maxDistanceKm ?? null;
    return NextResponse.json({
      distanceKm,
      deliveryCost: 0,
      outOfZone: true,
      message: maxKm
        ? `Доставка возможна до ${maxKm} км — уточните у менеджера`
        : "Уточните стоимость у менеджера",
      warehouse: {
        address: settings.warehouseAddress,
        lat: settings.warehouseLat,
        lng: settings.warehouseLng,
      },
    });
  }

  // Стоимость: базовая + за км
  let deliveryCost = Math.round(tariff.basePrice + distanceKm * tariff.perKmPrice);

  // Бесплатная доставка от суммы
  if (!isNaN(sum) && tariff.freeFromSum && sum >= tariff.freeFromSum) {
    deliveryCost = 0;
  }

  return NextResponse.json({
    distanceKm,
    deliveryCost,
    freeDelivery: deliveryCost === 0,
    freeFromSum: tariff.freeFromSum ?? null,
    tariff: {
      name: tariff.name,
      basePrice: tariff.basePrice,
      perKmPrice: tariff.perKmPrice,
    },
    warehouse: {
      address: settings.warehouseAddress,
      lat: settings.warehouseLat,
      lng: settings.warehouseLng,
    },
  });
}
