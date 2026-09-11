import fs from "fs";
import path from "path";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeHeroConfig } from "@/components/hero-builder/types";

/**
 * Одноразовый сид Hero-конфига при старте сервера:
 * если в ShopSettings ещё нет heroConfig — берём из data/hero-config.json.
 * Ручные изменения из админки никогда не перезаписываются.
 */
export async function seedHeroConfig() {
  try {
    const settings = await prisma.shopSettings.findFirst();
    if (settings?.heroConfig) return; // конфиг уже есть — ничего не делаем

    const file = path.join(process.cwd(), "data", "hero-config.json");
    if (!fs.existsSync(file)) return;

    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    const config = normalizeHeroConfig(raw) as unknown as Prisma.InputJsonObject;

    if (settings) {
      await prisma.shopSettings.update({
        where: { id: settings.id },
        data: { heroConfig: config },
      });
    } else {
      await prisma.shopSettings.create({ data: { heroConfig: config } });
    }
    console.log("[hero-seed] конфиг Hero записан из data/hero-config.json");
  } catch (e) {
    console.error("[hero-seed] не удалось записать конфиг Hero:", e);
  }
}
