import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMaxMessage, sendTelegramMessage, sendEmail } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/notify-test — проверка настроек уведомлений.
 * Отправляет тестовое сообщение в MAX / Telegram / email.
 */
export async function POST() {
  const settings = await prisma.shopSettings.findFirst();
  if (!settings) {
    return NextResponse.json({ error: "Настройки не найдены" }, { status: 404 });
  }

  const text = `✅ Тестовое уведомление с сайта ${settings.siteName}
${new Date().toLocaleString("ru-RU")}

Если вы видите это сообщение — уведомления о заказах настроены верно.`;

  const result: Record<string, unknown> = {};

  // MAX: если токен есть, а chat_id нет — пытаемся найти его в обновлениях
  if (settings.maxBotToken && !settings.maxChatId) {
    try {
      const upd = await fetch("https://platform-api2.max.ru/updates", {
        headers: { Authorization: settings.maxBotToken },
      });
      if (upd.ok) {
        const data = await upd.json();
        const ids = new Set<string>();
        // chat_id может лежать на разной глубине (message.recipient.chat_id, bot_started.chat_id и т.д.)
        const scan = (obj: unknown) => {
          if (!obj || typeof obj !== "object") return;
          for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            if (key === "chat_id" && (typeof value === "number" || typeof value === "string")) {
              ids.add(String(value));
            } else if (value && typeof value === "object") {
              scan(value);
            }
          }
        };
        for (const u of (data as { updates?: unknown[] }).updates ?? []) scan(u);
        if (ids.size > 0) {
          result.foundChatIds = [...ids];
        } else {
          result.maxError = "Токен верный, но диалог с ботом не найден. Напишите боту любое сообщение в MAX и нажмите «Проверить» ещё раз.";
        }
      } else {
        const body = await upd.text().catch(() => "");
        result.maxError = `MAX API ${upd.status}: ${body.slice(0, 200)}`;
      }
    } catch (e) {
      result.maxError = `MAX API недоступен: ${String(e).slice(0, 200)}`;
    }
  }

  // MAX
  if (settings.maxBotToken && settings.maxChatId) {
    result.max = await sendMaxMessage(settings.maxBotToken, settings.maxChatId, text);
  } else {
    result.max = "not_configured";
  }

  // Telegram
  if (settings.messengerType === "telegram" && settings.messengerToken && settings.messengerChatId) {
    result.telegram = await sendTelegramMessage(settings.messengerToken, settings.messengerChatId, text);
  } else {
    result.telegram = "not_configured";
  }

  // Email
  if (settings.notifyEmail) {
    const res = await sendEmail(
      settings,
      settings.notifyEmail,
      "Тестовое уведомление с сайта",
      text
    );
    result.email = res.ok;
    if (!res.ok) result.emailError = res.error;
  } else {
    result.email = "not_configured";
  }

  return NextResponse.json(result);
}
