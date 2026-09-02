// Перепарсинг пропущенных категорий (сетевые ошибки прошлого запуска)
import { runMetalParse } from "../../src/lib/parser";
import type { ParseCategory } from "../../src/lib/parser/types";

const CATEGORIES: ParseCategory[] = [
  { name: "Труба профильная оцинкованная", url: "https://city-met.ru/truba_profilnaya/truba_profilnaya_otsinkovannaya/", parentName: "Труба профильная" },
  { name: "Лист просечно-вытяжной", url: "https://city-met.ru/list_metalicheskiy/prosechno_vytyazhnoy_list/", parentName: "Лист металлический" },
  { name: "Труба профильная квадратная", url: "https://city-met.ru/truba_profilnaya/truba_profilnaya_kvadratnaya/", parentName: "Труба профильная" },
  { name: "Труба профильная прямоугольная", url: "https://city-met.ru/truba_profilnaya/truba_profilnaya_pryamougolnaya/", parentName: "Труба профильная" },
  { name: "Труба электросварная", url: "https://city-met.ru/trubnyy_prokat/truba_elektrosvarnaya/", parentName: "Трубы" },
  { name: "Полоса стальная", url: "https://city-met.ru/polosa_metallicheskaya/polosa_stalnaya/", parentName: "Полоса металлическая" },
  { name: "Лист стальной", url: "https://city-met.ru/list_metalicheskiy/list_stalnoy/", parentName: "Лист металлический" },
  { name: "Сетка сварная рулон", url: "https://city-met.ru/setka_metallicheskaya/setka_svarnaya_rulon/", parentName: "Сетка металлическая" },
  { name: "Труба водогазопроводная", url: "https://city-met.ru/trubnyy_prokat/truba_vodogazoprovodnaya/", parentName: "Трубы" },
  { name: "Арматура А3", url: "https://city-met.ru/armatura/armatura_a3/", parentName: "Арматура" },
  { name: "Отводы неоцинкованные", url: "https://city-met.ru/otvody_stalnye/otvody_neotsinkovannye/", parentName: "Отводы стальные" },
  { name: "Уголок равнополочный", url: "https://city-met.ru/ugolok/ravnopolochnyy_ygolok/", parentName: "Уголок" },
  { name: "Уголок неравнополочный", url: "https://city-met.ru/ugolok/neravnopolochnyy_ygolok/", parentName: "Уголок" },
  { name: "Сетка штукатурная тканая", url: "https://city-met.ru/setka_metallicheskaya/setka_shtukaturnaya_tkanaya/", parentName: "Сетка металлическая" },
  { name: "Электроды", url: "https://city-met.ru/dopolnitelnye_materialy/elektrody/", parentName: "Дополнительные материалы" },
  { name: "Труба оцинкованная", url: "https://city-met.ru/trubnyy_prokat/truba_otsinkovannaya/", parentName: "Трубы" },
];

async function main() {
  const result = await runMetalParse({
    categoryUrl: "",
    categories: CATEGORIES,
    maxPages: 20,
    transport: "playwright",
    downloadImages: true,
  });

  console.log("\n=== Итог перепарсинга ===");
  console.log(`Найдено товаров:   ${result.found}`);
  console.log(`Скачано фото:      ${result.downloaded}`);
  console.log(`Добавлено в БД:    ${result.upserted}`);
  console.log(`Ошибок:            ${result.failed}`);
  console.log(`Время:             ${(result.durationMs / 1000).toFixed(1)} с`);
  if (result.errors.length > 0) {
    console.log("\nОшибки:");
    result.errors.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
  }
}

main()
  .catch((error) => {
    console.error("Сбой парсера:", error);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../../src/lib/prisma");
    await prisma.$disconnect();
  });
