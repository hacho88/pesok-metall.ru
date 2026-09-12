import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/warehouse/sales?date=YYYY-MM-DD — продажи за день + итоги
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    const dayStart = dateParam ? new Date(dateParam) : new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const sales = await prisma.warehouseSale.findMany({
      where: { createdAt: { gte: dayStart, lt: dayEnd } },
      include: { product: { select: { id: true, name: true, unit: true } } },
      orderBy: { createdAt: "desc" },
    });

    const totals = sales.reduce(
      (acc, s) => ({
        qty: acc.qty + s.qty,
        totalCost: acc.totalCost + s.totalCost,
        totalSell: acc.totalSell + s.totalSell,
        profit: acc.profit + s.profit,
      }),
      { qty: 0, totalCost: 0, totalSell: 0, profit: 0 }
    );

    return NextResponse.json({ sales, totals });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось загрузить продажи", detail: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/admin/warehouse/sales — записать продажу
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, qty, unit, costPrice, sellPrice, note } = body;

    if (!productId || !qty || qty <= 0) {
      return NextResponse.json(
        { error: "Укажите товар и количество" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    const q = Number(qty);
    const cost = Number(costPrice ?? product.priceCost ?? 0);
    const sell = Number(sellPrice ?? product.priceRetailBase ?? 0);

    const sale = await prisma.$transaction(async (tx) => {
      const created = await tx.warehouseSale.create({
        data: {
          productId,
          qty: q,
          unit: unit || product.unit || "шт",
          costPrice: cost,
          sellPrice: sell,
          totalCost: q * cost,
          totalSell: q * sell,
          profit: q * sell - q * cost,
          note: note || null,
        },
      });
      // Списываем со склада
      await tx.product.update({
        where: { id: productId },
        data: { stock: Math.max(0, product.stock - Math.round(q)) },
      });
      return created;
    });

    return NextResponse.json({ ok: true, sale }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось записать продажу", detail: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/warehouse/sales?id=xxx — отменить продажу (вернуть на склад)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id обязателен" }, { status: 400 });
    }

    const sale = await prisma.warehouseSale.findUnique({ where: { id } });
    if (!sale) {
      return NextResponse.json({ error: "Продажа не найдена" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.warehouseSale.delete({ where: { id } });
      await tx.product.update({
        where: { id: sale.productId },
        data: { stock: { increment: Math.round(sale.qty) } },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось удалить продажу", detail: String(error) },
      { status: 500 }
    );
  }
}
