// Полный список гео-зон: районы Москвы и города МО
// Используется для сидинга БД, генерации футера и sitemap
export interface GeoZoneSeed {
  slug: string;
  name: string;
  isRegion: boolean; // true = город МО, false = район Москвы
  deliveryTariffMultiplier: number;
}

export const GEO_ZONES: GeoZoneSeed[] = [
  // Районы Москвы (округа/поселения)
  { slug: "moscow", name: "Москва", isRegion: false, deliveryTariffMultiplier: 1.0 },
  { slug: "butovo", name: "Бутово", isRegion: false, deliveryTariffMultiplier: 1.05 },
  { slug: "kommunarka", name: "Коммунарка", isRegion: false, deliveryTariffMultiplier: 1.08 },
  { slug: "lyublino", name: "Люблино", isRegion: false, deliveryTariffMultiplier: 1.03 },
  { slug: "mitino", name: "Митино", isRegion: false, deliveryTariffMultiplier: 1.06 },
  { slug: "tushino", name: "Тушино", isRegion: false, deliveryTariffMultiplier: 1.07 },
  { slug: "kurkino", name: "Куркино", isRegion: false, deliveryTariffMultiplier: 1.08 },
  { slug: "kryukovo", name: "Крюково", isRegion: false, deliveryTariffMultiplier: 1.1 },
  { slug: "vnukovo", name: "Внуково", isRegion: false, deliveryTariffMultiplier: 1.09 },
  { slug: "nekrasovka", name: "Некрасовка", isRegion: false, deliveryTariffMultiplier: 1.07 },
  { slug: "solntsevo", name: "Солнцево", isRegion: false, deliveryTariffMultiplier: 1.06 },
  { slug: "novokosino", name: "Новокосино", isRegion: false, deliveryTariffMultiplier: 1.05 },
  { slug: "zhulebino", name: "Жулебино", isRegion: false, deliveryTariffMultiplier: 1.05 },
  { slug: "molzhaninovsky", name: "Молжаниновский", isRegion: false, deliveryTariffMultiplier: 1.1 },

  // Города МО
  { slug: "balashiha", name: "Балашиха", isRegion: true, deliveryTariffMultiplier: 1.1 },
  { slug: "podolsk", name: "Подольск", isRegion: true, deliveryTariffMultiplier: 1.12 },
  { slug: "lyubertsy", name: "Люберцы", isRegion: true, deliveryTariffMultiplier: 1.08 },
  { slug: "khimki", name: "Химки", isRegion: true, deliveryTariffMultiplier: 1.1 },
  { slug: "mytishchi", name: "Мытищи", isRegion: true, deliveryTariffMultiplier: 1.1 },
  { slug: "korolev", name: "Королев", isRegion: true, deliveryTariffMultiplier: 1.13 },
  { slug: "odintsovo", name: "Одинцово", isRegion: true, deliveryTariffMultiplier: 1.1 },
  { slug: "krasnogorsk", name: "Красногорск", isRegion: true, deliveryTariffMultiplier: 1.1 },
  { slug: "reutov", name: "Реутов", isRegion: true, deliveryTariffMultiplier: 1.06 },
  { slug: "dolgoprudny", name: "Долгопрудный", isRegion: true, deliveryTariffMultiplier: 1.1 },
  { slug: "vidnoe", name: "Видное", isRegion: true, deliveryTariffMultiplier: 1.1 },
  { slug: "domodedovo", name: "Домодедово", isRegion: true, deliveryTariffMultiplier: 1.15 },
  { slug: "serpukhov", name: "Серпухов", isRegion: true, deliveryTariffMultiplier: 1.25 },
  { slug: "orekhovo-zuyevo", name: "Орехово-Зуево", isRegion: true, deliveryTariffMultiplier: 1.25 },
  { slug: "ramenskoe", name: "Раменское", isRegion: true, deliveryTariffMultiplier: 1.15 },
  { slug: "pushkino", name: "Пушкино", isRegion: true, deliveryTariffMultiplier: 1.13 },
  { slug: "noginsk", name: "Ногинск", isRegion: true, deliveryTariffMultiplier: 1.2 },
  { slug: "zhukovsky", name: "Жуковский", isRegion: true, deliveryTariffMultiplier: 1.13 },
  { slug: "kolomna", name: "Коломна", isRegion: true, deliveryTariffMultiplier: 1.3 },
  { slug: "elektrostal", name: "Электросталь", isRegion: true, deliveryTariffMultiplier: 1.2 },
];

// Группировка для футера: Москва и МО отдельно
export const MOSCOW_DISTRICTS = GEO_ZONES.filter((z) => !z.isRegion);
export const MO_CITIES = GEO_ZONES.filter((z) => z.isRegion);
