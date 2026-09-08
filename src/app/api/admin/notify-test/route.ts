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
      const upd = await fetch(
        `https://botapi.max.ru/updates?access_token=${encodeURIComponent(settings.maxBotToken)}`
      );
      if (upd.ok) {
        const data = await upd.json();
        const ids = new Set<string>();
        for (const u of data.updates ?? []) {
          const chatId = u?.message?.recipient?.chat_id;
          if (chatId) ids.add(String(chatId));
        }
        if (ids.size > 0) result.foundChatIds = [...ids];
      }
    } catch {
      // ignore
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
