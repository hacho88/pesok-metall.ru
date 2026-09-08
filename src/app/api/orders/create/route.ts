import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewOrder, sendEmail, sendMaxMessage } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * POST /api/orders/create
 * Создаёт заказ из корзины
 *
 * Body:
 * {
 *   customerName: string,
 *   phone: string,
 *   email?: string,
 *   company?: string,
 *   inn?: string,
 *   paymentMethod: "cash" | "bank_wire",
 *   deliveryType: "delivery" | "pickup",
 *   address?: string,
 *   lat?: number,
 *   lng?: number,
 *   distanceKm?: number,
 *   deliveryCost?: number,
 *   comment?: string,
 *   items: [{ id, title, price, unit, qty }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customerName,
      phone,
      email,
      company,
      inn,
      paymentMethod,
      deliveryType,
      address,
      lat,
      lng,
      distanceKm,
      deliveryCost,
      comment,
      items,
    } = body;

    // Валидация
    if (!customerName || !phone) {
      return NextResponse.json(
        { error: "Укажите имя и телефон" },
        { status: 400 }
      );
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Корзина пуста" },
        { status: 400 }
      );
    }
    if (deliveryType === "delivery" && !address) {
      return NextResponse.json(
        { error: "Укажите адрес доставки" },
        { status: 400 }
      );
    }
    if (paymentMethod === "bank_wire" && (!company || !inn)) {
      return NextResponse.json(
        { error: "Для безналичной оплаты укажите компанию и ИНН" },
        { status: 400 }
      );
    }

    // Расчёт суммы
    const subtotal = items.reduce(
      (s: number, i: any) => s + i.price * i.qty,
      0
    );
    const delCost = deliveryType === "pickup" ? 0 : (deliveryCost || 0);
    const total = subtotal + delCost;

    // Генерация номера заказа
    const count = await prisma.atlasOrder.count();
    const number = `PM-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

    // Создаём заказ
    const order = await prisma.atlasOrder.create({
      data: {
        number,
        customerName,
        phone,
        email: email || null,
        company: company || null,
        inn: inn || null,
        paymentMethod: paymentMethod || "cash",
        deliveryType,
        address: address || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        distanceKm: distanceKm || null,
        comment: comment || null,
        subtotal,
        deliveryCost: delCost,
        total,
        invoiceSent: false,
        items: {
          create: await Promise.all(
            items.map(async (i: any) => {
              // Проверяем существование продукта
              let productId = i.id || null;
              if (productId) {
                const exists = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
                if (!exists) productId = null;
              }
              return {
                productId,
                name: i.title,
                unit: i.unit || "шт",
                qty: i.qty,
                price: i.price,
                total: i.price * i.qty,
              };
            })
          ),
        },
      },
      include: { items: true },
    });

    // Если безнал — отправляем счёт
    let invoiceResult = null;
    if (paymentMethod === "bank_wire") {
      invoiceResult = await sendInvoice(order);
      if (invoiceResult.success) {
        await prisma.atlasOrder.update({
          where: { id: order.id },
          data: { invoiceSent: true, status: "CONFIRMED" as any },
        });
      }
    } else {
      // Нал — создаём лид в CRM
      await prisma.lead.create({
        data: {
          name: customerName,
          phone,
          email: email || "",
          source: "checkout",
          message: `Заказ ${number} на ${total}₽. Оплата: наличными при получении.`,
        },
      });
    }

    // Уведомление магазину: MAX + Telegram + email (не ломает оформление)
    let notifyResult: Awaited<ReturnType<typeof notifyNewOrder>> | null = null;
    try {
      notifyResult = await notifyNewOrder(order as any);
    } catch (e) {
      console.error("[orders/create] notify error:", e);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        number: order.number,
        total,
        subtotal,
        deliveryCost: delCost,
        paymentMethod,
        deliveryType,
      },
      invoice: invoiceResult,
      notify: notifyResult,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Ошибка создания заказа", detail: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Отправка счёта на оплату
 * 1. Через мессенджер (Telegram/WhatsApp) если настроен
 * 2. На email если указан
 */
async function sendInvoice(order: any): Promise<{ success: boolean; method: string; error?: string; email?: string }> {
  const settings = await prisma.shopSettings.findFirst();

  // Формируем текст счёта
  const itemsText = order.items
    .map((i: any) => `• ${i.name} — ${i.qty} ${i.unit} × ${i.price}₽ = ${i.total}₽`)
    .join("\n");

  const invoiceText = `📋 СЧЁТ НА ОПЛАТУ №${order.number}
от ${new Date().toLocaleDateString("ru-RU")}

Поставщик: ИП / ООО "Песок-Металл"
Покупатель: ${order.company || order.customerName}
ИНН: ${order.inn || "—"}

Товары:
${itemsText}

Сумма товаров: ${order.subtotal}₽
Доставка: ${order.deliveryCost}₽
ИТОГО К ОПЛАТЕ: ${order.total}₽

Оплата по реквизитам (безналичный расчёт).
Срок оплаты: 3 рабочих дня.

Контакты: ${settings?.phone || ""}
${settings?.email || ""}
`;

  // 1. Отправка в мессенджер (Telegram или MAX)
  if (settings?.messengerToken && settings?.messengerChatId) {
    try {
      const messengerType = settings.messengerType || "telegram";
      if (messengerType === "telegram") {
        const resp = await fetch(
          `https://api.telegram.org/bot${settings.messengerToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: settings.messengerChatId,
              text: invoiceText,
            }),
          }
        );
        if (resp.ok) {
          return { success: true, method: "telegram" };
        }
      } else if (messengerType === "max" && settings.maxBotToken && settings.maxChatId) {
        const ok = await sendMaxMessage(settings.maxBotToken, settings.maxChatId, invoiceText);
        if (ok) {
          return { success: true, method: "max" };
        }
      }
    } catch (e) {
      console.error("Messenger send error:", e);
    }
  }

  // 2. Отправка на email (SMTP из настроек)
  const targetEmail = order.email || settings?.invoiceEmail;
  if (targetEmail && settings) {
    const res = await sendEmail(settings, targetEmail, `Счёт на оплату №${order.number}`, invoiceText);
    if (res.ok) {
      return { success: true, method: "email", email: targetEmail };
    }
  }

  return { success: false, method: "none", error: "Не настроен мессенджер или SMTP" };
}
