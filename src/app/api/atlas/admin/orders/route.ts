import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const orders = await prisma.atlasOrder.findMany({
    include: { items: true, geoZone: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      customerName: o.customerName,
      phone: o.phone,
      email: o.email,
      company: o.company,
      inn: o.inn,
      deliveryType: o.deliveryType,
      address: o.address,
      comment: o.comment,
      subtotal: o.subtotal,
      deliveryCost: o.deliveryCost,
      total: o.total,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        name: i.name,
        unit: i.unit,
        qty: i.qty,
        price: i.price,
        total: i.total,
      })),
      geoZone: o.geoZone ? { name: o.geoZone.name } : null,
    })),
  });
}
