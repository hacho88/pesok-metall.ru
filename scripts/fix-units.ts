import { prisma } from "../src/lib/prisma";

/** Выводит единицу измерения из названия и атрибутов */
function inferUnit(name: string, attrs: { key: string; value: string }[], type: string): string | null {
  const get = (re: RegExp) => attrs.find((a) => re.test(a.key))?.value ?? "";

  if (type === "BAG_30KG") return "шт";
  if (type === "BIG_BAG_1TON") return "шт";
  if (/электрод/i.test(name)) return "уп";

  if (type === "METALL") {
    // Трубы: есть Сечение/Стенка, вес указан за метр
    if (/труба/i.test(name) && (get(/сечение|стенка/) || /х\d+/i.test(name))) return "м";
    // Арматура/катанка/проволока/швеллер/балка/уголок: погонаж, вес за метр
    if (/арматур|катанк|проволок|швеллер|балк|уголок|круг|квадрат|полоса|труба/i.test(name)) {
      // Если есть Формат (листовой товар) — штуки
      if (get(/формат/i)) return "шт";
      return "м";
    }
    // Лист/сетка/ПВЛ с форматом — штуки
    if (/лист|сетка|пвл|просечно/i.test(name)) return "шт";
    if (get(/формат/i)) return "шт";
  }
  return null;
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, type: true, unit: true, weightKg: true, attributes: true },
  });

  let unitFixed = 0;
  let weightFixed = 0;

  for (const p of products) {
    const updates: Record<string, unknown> = {};

    // 1. Восстановление единицы
    if (!p.unit) {
      const unit = inferUnit(p.name, p.attributes, p.type);
      if (unit) {
        updates.unit = unit;
        unitFixed++;
      }
    }

    // 2. Округление мусорных весов (0.07199999999999999 -> 0.072)
    if (p.weightKg != null) {
      const rounded = Math.round(Number(p.weightKg) * 1000) / 1000;
      if (rounded !== Number(p.weightKg)) {
        updates.weightKg = rounded;
        weightFixed++;
        // Синхронизируем атрибут "Вес"
        const weightAttr = p.attributes.find((a) => /вес|weight/i.test(a.key));
        if (weightAttr && /kg|кг/i.test(weightAttr.value)) {
          await prisma.productAttribute.updateMany({
            where: { productId: p.id, key: weightAttr.key },
            data: { value: `${rounded} кг` },
          });
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.product.update({ where: { id: p.id }, data: updates });
    }
  }

  console.log(`✅ Единиц восстановлено: ${unitFixed}`);
  console.log(`✅ Весов округлено: ${weightFixed}`);

  // Итоговая статистика
  const groups = await prisma.product.groupBy({
    by: ["type", "unit"],
    _count: true,
  });
  console.log("\n=== Итоговые единицы ===");
  for (const g of groups.sort((a, b) => (a.type + a.unit).localeCompare(b.type + b.unit))) {
    console.log(`${g.type} | ${g.unit ?? "null"} — ${g._count}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
