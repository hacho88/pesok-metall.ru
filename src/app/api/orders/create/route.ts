import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isValidInn } from "@/types/checkout";
import type { CreateOrderResponse } from "@/types/checkout";

export const dynamic = "force-dynamic";

/** Схема позиции корзины */
const cartItemSchema = z.object({
  productId: z.string().min(1),
  sku: z.string().min(1),
  name: z.string().min(1).max(300),
  gost: z.string().max(100).nullable().optional(),
  unit: z.string().max(20).nullable().optional(),
  quantity: z.number().positive().max(1_000_000),
  weightKg: z.number().nonnegative().max(1_000_000),
  weightTons: z.number().nonnegative().max(100_000),
  pricePerUnit: z.number().nonnegative().nullable().optional(),
  lineTotal: z.number().nonnegative().nullable().optional(),
});

/** Схема payload заказа */
const createOrderSchema = z.object({
  clientType: z.enum(["fiz", "yur"]),
  paymentMethod: z.enum(["cash_on_delivery", "bank_wire"]),
  customerName: z.string().trim().min(2, "Укажите имя").max(200),
  customerPhone: z
    .string()
    .trim()
    .regex(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, "Телефон должен быть в формате +7 (999) 999-99-99"),
  companyInn: z.string().trim().max(12).default(""),
  cartItems: z.array(cartItemSchema).min(1, "Корзина пуста").max(200),
  totalWeight: z.number().nonnegative().max(100_000),
});

// POST /api/orders/create — создание заказа из FastCheckout
export async function POST(request: NextRequest): Promise<NextResponse<CreateOrderResponse>> {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { ok: false, error: firstIssue?.message ?? "Некорректные данные заказа" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // ИНН обязателен и валиден только для юрлиц
    if (data.clientType === "yur") {
      if (!data.companyInn) {
        return NextResponse.json({ ok: false, error: "Укажите ИНН организации" }, { status: 400 });
      }
      if (!isValidInn(data.companyInn)) {
        return NextResponse.json({ ok: false, error: "ИНН указан неверно (10 или 12 цифр)" }, { status: 400 });
      }
    }

    // Согласованность способа оплаты с типом покупателя
    const expectedPayment: "cash_on_delivery" | "bank_wire" =
      data.clientType === "fiz" ? "cash_on_delivery" : "bank_wire";
    if (data.paymentMethod !== expectedPayment) {
      return NextResponse.json(
        { ok: false, error: "Способ оплаты не соответствует типу покупателя" },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        clientType: data.clientType,
        paymentMethod: data.paymentMethod,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        companyInn: data.clientType === "yur" ? data.companyInn : "",
        cartItems: data.cartItems as object,
        totalWeight: data.totalWeight,
      },
    });

    return NextResponse.json({ ok: true, id: order.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Не удалось сохранить заказ", detail: String(error) },
      { status: 500 }
    );
  }
}
