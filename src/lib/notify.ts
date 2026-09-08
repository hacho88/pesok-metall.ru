import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

/**
 * Уведомления о заказах: мессенджер MAX + Telegram + email (SMTP).
 * Все функции безопасны: ошибка отправки не ломает оформление заказа.
 */

export type OrderForNotify = {
  number: string;
  customerName: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  inn?: string | null;
  paymentMethod: string;
  deliveryType: string;
  address?: string | null;
  comment?: string | null;
  subtotal: number;
  deliveryCost: number;
  total: number;
  items: { name: string; unit: string; qty: number; price: number; total: number }[];
};

export function buildOrderText(order: OrderForNotify, title = "НОВЫЙ ЗАКАЗ"): string {
  const itemsText = order.items
    .map((i) => `• ${i.name} — ${i.qty} ${i.unit} × ${i.price}₽ = ${i.total}₽`)
    .join("\n");

  const payment = order.paymentMethod === "bank_wire" ? "Безналичный расчёт (счёт)" : "Наличные при получении";
  const delivery = order.deliveryType === "pickup" ? "Самовывоз" : `Доставка: ${order.address || "—"}`;

  return `${title} №${order.number}
${new Date().toLocaleString("ru-RU")}

Клиент: ${order.customerName}
Телефон: ${order.phone}${order.email ? `\nEmail: ${order.email}` : ""}${order.company ? `\nКомпания: ${order.company} (ИНН ${order.inn || "—"})` : ""}

Состав заказа:
${itemsText}

Товары: ${order.subtotal}₽
Доставка: ${order.deliveryCost}₽
ИТОГО: ${order.total}₽

Оплата: ${payment}
${delivery}${order.comment ? `\nКомментарий: ${order.comment}` : ""}`;
}

/** Отправка в мессенджер MAX (Bot API: https://platform-api2.max.ru, токен в заголовке Authorization) */
export async function sendMaxMessage(token: string, chatId: string, text: string): Promise<boolean> {
  try {
    const resp = await fetch(
      `https://platform-api2.max.ru/messages?chat_id=${encodeURIComponent(chatId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ text }),
      }
    );
    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      console.error(`[notify] MAX send failed: ${resp.status} ${body.slice(0, 300)}`);
    }
    return resp.ok;
  } catch (e) {
    console.error("[notify] MAX send error:", e);
    return false;
  }
}

/** Отправка в Telegram (бот) */
export async function sendTelegramMessage(token: string, chatId: string, text: string): Promise<boolean> {
  try {
    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    return resp.ok;
  } catch (e) {
    console.error("[notify] Telegram send error:", e);
    return false;
  }
}

/** Отправка email через SMTP из настроек магазина */
export async function sendEmail(
  settings: {
    smtpHost?: string | null;
    smtpPort?: number | null;
    smtpUser?: string | null;
    smtpPass?: string | null;
    smtpFrom?: string | null;
  },
  to: string,
  subject: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
    return { ok: false, error: "SMTP не настроен" };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 465,
      secure: (settings.smtpPort || 465) === 465,
      auth: { user: settings.smtpUser, pass: settings.smtpPass },
    });
    await transporter.sendMail({
      from: settings.smtpFrom || settings.smtpUser,
      to,
      subject,
      text,
    });
    return { ok: true };
  } catch (e) {
    console.error("[notify] Email send error:", e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Уведомление о новом заказе магазину:
 * 1. MAX (maxBotToken + maxChatId)
 * 2. Telegram (messengerToken + messengerChatId, если тип telegram)
 * 3. Email (notifyEmail через SMTP)
 */
export async function notifyNewOrder(order: OrderForNotify): Promise<{
  max: boolean;
  telegram: boolean;
  email: boolean;
  errors: string[];
}> {
  const settings = await prisma.shopSettings.findFirst();
  const result = { max: false, telegram: false, email: false, errors: [] as string[] };
  if (!settings) return result;

  const text = buildOrderText(order);

  // 1. MAX
  if (settings.maxBotToken && settings.maxChatId) {
    try {
      result.max = await sendMaxMessage(settings.maxBotToken, settings.maxChatId, text);
      if (!result.max) result.errors.push("MAX: не удалось отправить");
    } catch (e) {
      result.errors.push(`MAX: ${String(e)}`);
    }
  }

  // 2. Telegram (если настроен и тип telegram)
  if (settings.messengerType === "telegram" && settings.messengerToken && settings.messengerChatId) {
    try {
      result.telegram = await sendTelegramMessage(settings.messengerToken!, settings.messengerChatId!, text);
    } catch {
      result.telegram = false;
    }
  }

  // 3. Email магазину
  if (settings.notifyEmail) {
    const res = await sendEmail(
      settings,
      settings.notifyEmail,
      `Новый заказ №${order.number} на ${order.total}₽`,
      text
    );
    result.email = res.ok;
    if (!res.ok) result.errors.push(`Email: ${res.error}`);
  }

  return result;
}
