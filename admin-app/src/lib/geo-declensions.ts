// Склонение названий зон для текстов: «в Балашихе», «доставка в Балашиху», «цены для Балашихи»
// Чистый модуль без зависимостей — можно импортировать в клиентские компоненты
const DECLENSIONS: Record<string, { in: string; to: string; gen: string }> = {
  Балашиха: { in: "Балашихе", to: "Балашиху", gen: "Балашихи" },
  Подольск: { in: "Подольске", to: "Подольск", gen: "Подольска" },
  Митино: { in: "Митино", to: "Митино", gen: "Митино" },
  Люберцы: { in: "Люберцах", to: "Люберцы", gen: "Люберец" },
  Москва: { in: "Москве", to: "Москву", gen: "Москвы" },
};

// «в Балашихе» (предложный падеж); если склонение неизвестно — как есть
export function inZone(name: string): string {
  return DECLENSIONS[name]?.in ?? name;
}

// «в Балашиху» (винительный падеж для направления)
export function toZone(name: string): string {
  return DECLENSIONS[name]?.to ?? name;
}

// «для Балашихи» (родительный падеж)
export function genZone(name: string): string {
  return DECLENSIONS[name]?.gen ?? name;
}
