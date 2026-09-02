import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000 + 100000);
  return `PM-${year}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer, totals, zoneSlug } = body as {
      items: any[];
      customer: any;
      totals: any;
      zoneSlug: string | null;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
    }
    if (!customer?.phone || !customer?.name) {
      return NextResponse.json({ error: "Заполните имя и телефон" }, { status: 400 });
    }

    // Find zone
    let zoneId: string | null = null;
    if (zoneSlug) {
      const zone = await prisma.geoZone.findUnique({ where: { slug: zoneSlug }, select: { id: true } });
      zoneId = zone?.id ?? null;
    }

    const orderNumber = generateOrderNumber();
    const subtotal = Number(totals.subtotal) || 0;

    const order = await prisma.atlasOrder.create({
      data: {
        number: orderNumber,
        status: "NEW",
        customerName: customer.name,
        phone: customer.phone,
        email: customer.email || null,
        company: customer.legalType === "company" ? customer.companyName || null : null,
        inn: customer.inn || null,
        deliveryType: customer.address ? "delivery" : "pickup",
        address: [customer.city, customer.address].filter(Boolean).join(", ") || null,
        comment: [
          customer.comment,
          customer.deliveryDate ? `Дата доставки: ${customer.deliveryDate}` : null,
          `Оплата: ${customer.payment || "card"}`,
        ].filter(Boolean).join("\n") || null,
        geoZoneId: zoneId,
        subtotal,
        deliveryCost: 0,
        total: subtotal,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            unit: item.unit || "шт",
            qty: item.qty,
            price: item.price,
            total: item.price * item.qty,
          })),
        },
      },
      include: { items: true },
    });

    // Increment ordersCount for products
    const productIds = items.map((i) => i.productId).filter(Boolean);
    if (productIds.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { ordersCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ orderId: order.id, orderNumber: order.number });
  } catch (err) {
    console.error("[atlas orders] POST error:", err);
    return NextResponse.json({ error: "Ошибка при создании заказа" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }
  const order = await prisma.atlasOrder.findUnique({
    where: { id },
    include: { items: true, geoZone: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.number,
    status: order.status,
    subtotal: order.subtotal,
    total: order.total,
    items: order.items.map((i) => ({
      ...i,
    })),
    createdAt: order.createdAt,
  });
}
