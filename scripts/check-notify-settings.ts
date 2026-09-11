import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const s = await p.shopSettings.findFirst();
console.log("maxBotToken:", s?.maxBotToken ? `есть (${s.maxBotToken.slice(0, 8)}...)` : "НЕТ");
console.log("maxChatId:", s?.maxChatId ?? "НЕТ");
console.log("messengerType:", s?.messengerType);
console.log("notifyEmail:", s?.notifyEmail ?? "нет");
await p.$disconnect();
