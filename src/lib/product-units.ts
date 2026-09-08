// Единая логика «как продаётся товар» (по образцу city-met.ru):
//  - линейный прокат (арматура, трубы, уголок, швеллер, полоса, балка) — цена за метр + цена за тонну + вес 1 п/м
//  - штучный товар (сваи, петли, заглушки, сетки, отводы, листы, рулоны) — цена за штуку + вес за штуку
//  - весовой (проволока, электроды) — цена за кг

export interface UnitInfo {
  unit: string; // нормализованная единица: "м" | "шт" | "лист" | "кг" | "уп" | "ед."
  isLinear: boolean; // продаётся метрами
  isPiece: boolean; // продаётся штуками/листами/рулонами
  priceLabel: string; // "за метр" | "за шт" | "за лист" | "за кг"
  weightLabel: string | null; // "4.53 кг/м" | "2.5 кг/шт" | "17.5 кг/рулон"
  pricePerTon: number | null; // цена за тонну (для линейного проката)
}

function fmtKg(n: number): string {
  if (n >= 100) return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  if (n >= 10) return n.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

export function getUnitInfo(
  unit: string | null | undefined,
  weightKg: number,
  price: number | null,
  type?: string,
  name?: string
): UnitInfo {
  const u = (unit ?? "ед.").toLowerCase().trim();
  const isBag = type === "BAG_30KG";
  const isBigBag = type === "BIG_BAG_1TON";
  const isLinear = u === "м" || u === "метр" || u === "п.м" || u === "пог.м" || u === "п/м";
  const isPiece = u === "шт" || u === "лист" || u === "рулон" || u === "уп" || u === "уп." || u === "карта";
  const isKg = u === "кг" || u === "кг.";
  // Стеклопластик/композит продаётся только метрами — тонн не существует
  const isComposite = !!name && /стеклопластик|композит/i.test(name);

  const priceLabel = isBag
    ? "за мешок"
    : isBigBag
      ? "за биг-бег"
      : isLinear
        ? "за метр"
        : isKg
          ? "за кг"
          : u === "лист"
            ? "за лист"
            : u === "рулон"
              ? "за рулон"
              : u === "уп" || u === "уп."
                ? "за упаковку"
                : "за шт";

  let weightLabel: string | null = null;
  if (weightKg > 0) {
    if (isBag) weightLabel = `${fmtKg(weightKg)} кг/мешок`;
    else if (isBigBag) weightLabel = `${fmtKg(weightKg)} кг/биг-бег`;
    else if (isLinear) weightLabel = `${fmtKg(weightKg)} кг/м`;
    else if (isKg) weightLabel = `${fmtKg(weightKg)} кг`;
    else if (u === "рулон") weightLabel = `${fmtKg(weightKg)} кг/рулон`;
    else if (u === "лист") weightLabel = `${fmtKg(weightKg)} кг/лист`;
    else weightLabel = `${fmtKg(weightKg)} кг/шт`;
  }

  const pricePerTon =
    isLinear && !isComposite && price != null && weightKg > 0
      ? Math.round((price / weightKg) * 1000)
      : null;

  return {
    unit: isLinear ? "м" : isKg ? "кг" : isPiece ? "шт" : u,
    isLinear,
    isPiece,
    priceLabel,
    weightLabel,
    pricePerTon,
  };
}

/**
 * Точный вес строки заказа в килограммах.
 *  - мешок 30 кг / биг-бег 1 т — фиксированный вес фасовки × количество
 *  - цена за кг — количество УЖЕ в килограммах (weightKg здесь справочный кг/м, не множитель!)
 *  - цена за тонну — количество в тоннах
 *  - м / шт / лист / рулон / уп — weightKg = вес одной единицы
 */
export function calcLineWeightKg(
  unit: string | null | undefined,
  weightKg: number,
  qty: number,
  type?: string
): number {
  if (type === "BAG_30KG") return 30 * qty;
  if (type === "BIG_BAG_1TON") return 1000 * qty;
  const u = (unit ?? "").toLowerCase().trim();
  if (u === "кг" || u === "кг.") return qty;
  if (u === "т" || u === "тонн" || u === "тонна") return qty * 1000;
  return weightKg * qty;
}

/** кг → тонны с округлением до 3 знаков */
export function kgToTons(kg: number): number {
  return Math.round((kg / 1000) * 1000) / 1000;
}
