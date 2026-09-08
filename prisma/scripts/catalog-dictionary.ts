/**
 * ============================================================
 *  CATALOG CLASSIFICATION DICTIONARY
 *  Структурный blueprint каталога: 6 категорий × подкатегории
 *  Используется миграционным скриптом для классификации товаров
 * ============================================================
 */

export interface SubcategoryDef {
  /** Slug подкатегории (уникален внутри родителя) */
  slug: string;
  /** Отображаемое имя */
  name: string;
  /** Ключевые слова для матчинга по названию товара (lowercase) */
  matchKeywords: string[];
  /** Исключающие ключевые слова (если найдены — не подходит) */
  excludeKeywords?: string[];
  /** Доп. условие: равные размеры (20х20, 40х40) → квадратная */
  matchEqualDims?: boolean;
  /** Доп. условие: неравные размеры (40х20, 60х40) → прямоугольная */
  matchUnequalDims?: boolean;
  /** Подкатегория по умолчанию (если товар относится к категории, но не匹配 ни одной подкатегории) */
  isDefault?: boolean;
}

export interface CategoryDef {
  /** Slug корневой категории */
  slug: string;
  /** Отображаемое имя */
  name: string;
  /** URL маршрута */
  route: string;
  /** Slug секции каталога */
  sectionSlug: string;
  /** Ключевые слова для определения принадлежности товара к категории */
  matchKeywords: string[];
  /** Подкатегории */
  subcategories: SubcategoryDef[];
  /** Метрические фильтры (диаметры, фасовка) — хранятся как атрибуты товара */
  metricFilters?: {
    label: string;
    /** Regex для извлечения значения из названия */
    pattern: string;
  }[];
}

/* ============================================================
 *  КАТАЛОГ: 6 КАТЕГОРИЙ
 * ============================================================ */

export const CATALOG_DICTIONARY: CategoryDef[] = [
  // ──────────────────────────────────────────────────────────────
  // 1. АРМАТУРА
  // ──────────────────────────────────────────────────────────────
  {
    slug: "armatura",
    name: "Арматура",
    route: "/catalog/armatura",
    sectionSlug: "metalloprokat",
    matchKeywords: ["арматур", "катанк"],
    subcategories: [
      {
        slug: "armatura-a3-riflenaya",
        name: "Арматура А3 рифленая",
        matchKeywords: ["а3", "а500с", "а500т", "35гс", "рифлен"],
      },
      {
        slug: "armatura-a1-gladkaya",
        name: "Арматура А1 гладкая",
        matchKeywords: ["а1", "гладк", "катанк"],
      },
      {
        slug: "armatura-kompozitnaya",
        name: "Арматура композитная",
        matchKeywords: ["композит", "стеклопластик", "асп"],
      },
    ],
    metricFilters: [
      { label: "Диаметр", pattern: "(\\d+)\\s*мм" },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 2. ТРУБА ПРОФИЛЬНАЯ
  // ──────────────────────────────────────────────────────────────
  {
    slug: "truba-profilnaya",
    name: "Труба профильная",
    route: "/catalog/truba-profilnaya",
    sectionSlug: "metalloprokat",
    matchKeywords: ["труба профильн", "профильная труб", "профильн.*труб"],
    subcategories: [
      {
        slug: "truba-kvadratnaya",
        name: "Труба квадратная",
        matchKeywords: ["квадратн", "квадрат"],
        matchEqualDims: true,
      },
      {
        slug: "truba-pryamougolnaya",
        name: "Труба прямоугольная",
        matchKeywords: ["прямоугольн"],
        matchUnequalDims: true,
      },
      {
        slug: "truba-otsinkovannaya-profilnaya",
        name: "Труба оцинкованная профильная",
        matchKeywords: ["оцинков"],
        excludeKeywords: [],
      },
    ],
    metricFilters: [
      { label: "Сечение", pattern: "(\\d+)[хx](\\d+)" },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 3. ТРУБЫ КРУГЛЫЕ
  // ──────────────────────────────────────────────────────────────
  {
    slug: "truby-kruglye",
    name: "Трубы круглые",
    route: "/catalog/truby-kruglye",
    sectionSlug: "metalloprokat",
    matchKeywords: ["труб", "вгп", "водогазопровод", "электросварн", "бесшовн", "э/с", "б/ш", "г/д", "х/д", "прямошовн", "отвод", "кругл"],
    subcategories: [
      {
        slug: "truba-vgp",
        name: "Труба ВГП",
        matchKeywords: ["вгп", "водогазопровод"],
      },
      {
        slug: "truba-elektrosvarnaya",
        name: "Труба электросварная",
        matchKeywords: ["электросварн", "э/с", "прямошовн"],
      },
      {
        slug: "truba-besshovnaya",
        name: "Труба бесшовная",
        matchKeywords: ["бесшовн", "б/ш", "г/д", "х/д"],
      },
      {
        slug: "otvody-stalnye",
        name: "Отводы стальные",
        matchKeywords: ["отвод"],
      },
      {
        slug: "truba-otsinkovannaya-kruglaya",
        name: "Труба оцинкованная круглая",
        matchKeywords: ["оцинков"],
        excludeKeywords: ["профильн", "квадрат", "прямоуг", "отвод"],
      },
    ],
    metricFilters: [
      { label: "Диаметр", pattern: "(?:d=)?(\\d+)\\s*мм" },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 4. ФАСОННЫЙ ПРОКАТ
  // ──────────────────────────────────────────────────────────────
  {
    slug: "fasonnyj-prokat",
    name: "Фасонный прокат",
    route: "/catalog/fasonnyj-prokat",
    sectionSlug: "metalloprokat",
    matchKeywords: ["уголок", "уголков", "швеллер", "балк", "двутавр", "б1", "ш1", "к1", "квадрат стальн"],
    subcategories: [
      {
        slug: "ugolok-stalnoj",
        name: "Уголок стальной",
        matchKeywords: ["уголок", "уголков"],
      },
      {
        slug: "shveller-stalnoj",
        name: "Швеллер стальной",
        matchKeywords: ["швеллер", "горячекатан", "гнутый"],
      },
      {
        slug: "balka-dvutavrovaya",
        name: "Балка двутавровая",
        matchKeywords: ["балк", "двутавр", "б1", "ш1", "к1"],
      },
      {
        slug: "kvadrat-stalnoj",
        name: "Квадрат стальной",
        matchKeywords: ["квадрат стальн"],
      },
    ],
    metricFilters: [
      { label: "Размер", pattern: "(\\d+)[хx](\\d+)|(\\d+)\\s*(?:мм|№)" },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 5. ЛИСТОВОЙ ПРОКАТ
  // ──────────────────────────────────────────────────────────────
  {
    slug: "listovoj-prokat",
    name: "Листовой прокат",
    route: "/catalog/listovoj-prokat",
    sectionSlug: "metalloprokat",
    matchKeywords: ["лист", "листов", "г/к", "х/к", "рифлен", "ромб", "чечевиц", "просечно", "пвл", "гладк.*лист", "стальн.*гладк"],
    subcategories: [
      {
        slug: "list-goryachekatanyj",
        name: "Лист горячекатаный",
        matchKeywords: ["горячекат", "г/к", "гк", "стальн.*гладк", "гладк"],
        isDefault: true,
      },
      {
        slug: "list-holodnokatanyj",
        name: "Лист холоднокатаный",
        matchKeywords: ["холоднокат", "х/к", "хк"],
      },
      {
        slug: "list-riflenyj",
        name: "Лист рифленый",
        matchKeywords: ["рифлен", "ромб", "чечевиц"],
      },
      {
        slug: "list-otsinkovannyj",
        name: "Лист оцинкованный",
        matchKeywords: ["оцинков", "оцинк", "оц"],
      },
      {
        slug: "list-prosechno-vytyazhnoj",
        name: "Лист просечно-вытяжной",
        matchKeywords: ["просечно", "пвл"],
      },
    ],
    metricFilters: [
      { label: "Толщина", pattern: "(\\d+[.,]?\\d*)\\s*(?:мм|х)" },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 6. ПЕСОК И ЩЕБЕНЬ (Сыпучие материалы)
  // ──────────────────────────────────────────────────────────────
  {
    slug: "pesok-shcheben",
    name: "Сыпучие материалы",
    route: "/catalog/pesok-shcheben",
    sectionSlug: "pesok-shcheben",
    matchKeywords: ["песок", "щебен", "гравий", "керамзит", "отсев", "торф"],
    subcategories: [
      {
        slug: "pesok",
        name: "Песок",
        matchKeywords: ["песок"],
      },
      {
        slug: "shcheben",
        name: "Щебень",
        matchKeywords: ["щебен", "гравий", "отсев"],
      },
      {
        slug: "keramzit",
        name: "Керамзит",
        matchKeywords: ["керамзит"],
      },
    ],
    metricFilters: [
      { label: "Фасовка", pattern: "(\\d+)\\s*кг|биг.?бег|1\\s*т" },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 7. ПОЛОСА МЕТАЛЛИЧЕСКАЯ (сортовой прокат)
  // ──────────────────────────────────────────────────────────────
  {
    slug: "polosa-metallicheskaya",
    name: "Полоса металлическая",
    route: "/catalog/polosa-metallicheskaya",
    sectionSlug: "metalloprokat",
    matchKeywords: ["полоса"],
    subcategories: [
      {
        slug: "polosa-stalnaya",
        name: "Полоса стальная",
        matchKeywords: ["полоса"],
        excludeKeywords: ["оцинков"],
        isDefault: true,
      },
      {
        slug: "polosa-otsinkovannaya",
        name: "Полоса оцинкованная",
        matchKeywords: ["оцинков"],
      },
    ],
    metricFilters: [
      { label: "Сечение", pattern: "(\\d+)\\s*[хx]\\s*(\\d+)" },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 8. СЕТКА МЕТАЛЛИЧЕСКАЯ
  // ──────────────────────────────────────────────────────────────
  {
    slug: "setka-metallicheskaya",
    name: "Сетка металлическая",
    route: "/catalog/setka-metallicheskaya",
    sectionSlug: "metalloprokat",
    matchKeywords: ["сетка"],
    subcategories: [
      {
        slug: "setka-svarnaya",
        name: "Сетка сварная",
        matchKeywords: ["сварн", "дорожн", "кладочн"],
        isDefault: true,
      },
      {
        slug: "setka-rabica",
        name: "Сетка рабица",
        matchKeywords: ["рабица"],
      },
      {
        slug: "setka-shtukaturnaya",
        name: "Сетка штукатурная (тканая)",
        matchKeywords: ["тканая", "штукатурн"],
      },
    ],
    metricFilters: [
      { label: "Ячейка", pattern: "(\\d+)\\s*[хx]\\s*(\\d+)" },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 9. ПРОФНАСТИЛ
  // ──────────────────────────────────────────────────────────────
  {
    slug: "profnastil",
    name: "Профнастил",
    route: "/catalog/profnastil",
    sectionSlug: "metalloprokat",
    matchKeywords: ["профнастил"],
    subcategories: [
      {
        slug: "profnastil-otsinkovannyy",
        name: "Профнастил оцинкованный",
        matchKeywords: ["оцинков"],
        isDefault: true,
      },
      {
        slug: "profnastil-krashenyy",
        name: "Профнастил крашеный",
        matchKeywords: ["ral", "крашен", "вишнев", "син", "зелен", "коричнев"],
      },
    ],
    metricFilters: [
      { label: "Толщина", pattern: "(\\d+[.,]?\\d*)\\s*х" },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 10. ПРОВОЛОКА
  // ──────────────────────────────────────────────────────────────
  {
    slug: "provoloka",
    name: "Проволока",
    route: "/catalog/provoloka",
    sectionSlug: "metalloprokat",
    matchKeywords: ["проволок"],
    subcategories: [
      {
        slug: "provoloka-vyazalnaya",
        name: "Проволока вязальная",
        matchKeywords: ["вязальн", "вязал"],
        isDefault: true,
      },
      {
        slug: "provoloka-otsinkovannaya",
        name: "Проволока оцинкованная",
        matchKeywords: ["оцинков"],
      },
    ],
    metricFilters: [
      { label: "Диаметр", pattern: "(\\d+[.,]?\\d*)\\s*мм" },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 11. ВИНТОВЫЕ СВАИ
  // ──────────────────────────────────────────────────────────────
  {
    slug: "vintovye-svai",
    name: "Винтовые сваи",
    route: "/catalog/vintovye-svai",
    sectionSlug: "metalloprokat",
    matchKeywords: ["свай", "сваи", "свая", "оголовок"],
    subcategories: [
      {
        slug: "svai-vintovye",
        name: "Сваи винтовые",
        matchKeywords: ["свай", "сваи", "свая"],
        isDefault: true,
      },
      {
        slug: "ogolovki-svay",
        name: "Оголовки свай",
        matchKeywords: ["оголовок"],
      },
    ],
    metricFilters: [
      { label: "Диаметр", pattern: "(?:СВСН-)?(\\d+)\\s*/" },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 12. МЕТАЛЛИЧЕСКИЙ ШТАКЕТНИК
  // ──────────────────────────────────────────────────────────────
  {
    slug: "metallicheskiy-shtaketnik",
    name: "Металлический штакетник",
    route: "/catalog/metallicheskiy-shtaketnik",
    sectionSlug: "metalloprokat",
    matchKeywords: ["штакетник", "мет.*штaket", "м-обр", "п-обр"],
    subcategories: [
      {
        slug: "shtaketnik-m-obraznyy",
        name: "Штакетник М-образный",
        matchKeywords: ["м-обр", "м.обр"],
      },
      {
        slug: "shtaketnik-p-obraznyy",
        name: "Штакетник П-образный",
        matchKeywords: ["п-обр", "п.обр"],
      },
    ],
    metricFilters: [
      { label: "Цвет", pattern: "ral\\s*(\\d+)" },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 13. ДОПОЛНИТЕЛЬНЫЕ МАТЕРИАЛЫ (крепеж, электроды, петли)
  // ──────────────────────────────────────────────────────────────
  {
    slug: "dopolnitelnye-materialy",
    name: "Дополнительные материалы",
    route: "/catalog/dopolnitelnye-materialy",
    sectionSlug: "metalloprokat",
    matchKeywords: ["саморез", "электрод", "петл", "заглушк", "фиксатор"],
    subcategories: [
      {
        slug: "samorezy",
        name: "Саморезы",
        matchKeywords: ["саморез"],
      },
      {
        slug: "elektrody",
        name: "Электроды",
        matchKeywords: ["электрод"],
      },
      {
        slug: "petli",
        name: "Петли",
        matchKeywords: ["петл"],
      },
      {
        slug: "zaglushki",
        name: "Заглушки и фиксаторы",
        matchKeywords: ["заглушк", "фиксатор"],
      },
    ],
    metricFilters: [],
  },
];

/* ============================================================
 *  ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ КЛАССИФИКАЦИИ
 * ============================================================ */

/** Найти категорию по названию товара */
export function classifyProduct(name: string): { categorySlug: string; subcategorySlug: string } | null {
  const lower = name.toLowerCase();

  for (const cat of CATALOG_DICTIONARY) {
    // Проверяем, что товар относится к этой категории
    const catMatch = cat.matchKeywords.some((kw) => {
      try {
        return new RegExp(kw, "i").test(lower);
      } catch {
        return lower.includes(kw);
      }
    });
    if (!catMatch) continue;

    // Специальная обработка: "Отвод" должен идти в "Отводы стальные", а не в "Труба оцинкованная"
    // Проверяем подкатегории в порядке приоритета
    for (const sub of cat.subcategories) {
      // Используем regex для матчинга подкатегорий
      const subMatch = sub.matchKeywords.some((kw) => {
        try {
          return new RegExp(kw, "i").test(lower);
        } catch {
          return lower.includes(kw);
        }
      });

      // Проверяем exclude
      if (subMatch && sub.excludeKeywords) {
        const excluded = sub.excludeKeywords.some((kw) => lower.includes(kw));
        if (excluded) continue;
      }

      // Проверяем equal/unequal dims
      if (sub.matchEqualDims) {
        const dims = lower.match(/(\d+)\s*[хx]\s*(\d+)/);
        if (dims && dims[1] === dims[2]) return { categorySlug: cat.slug, subcategorySlug: sub.slug };
        // Если есть "квадрат" в названии — тоже подходит
        if (subMatch) return { categorySlug: cat.slug, subcategorySlug: sub.slug };
        continue;
      }

      if (sub.matchUnequalDims) {
        const dims = lower.match(/(\d+)\s*[хx]\s*(\d+)/);
        if (dims && dims[1] !== dims[2]) return { categorySlug: cat.slug, subcategorySlug: sub.slug };
        if (subMatch) return { categorySlug: cat.slug, subcategorySlug: sub.slug };
        continue;
      }

      if (subMatch) return { categorySlug: cat.slug, subcategorySlug: sub.slug };
    }

    // Если подкатегория не найдена — ищем подкатегорию по умолчанию
    const defaultSub = cat.subcategories.find((s) => s.isDefault);
    if (defaultSub) {
      return { categorySlug: cat.slug, subcategorySlug: defaultSub.slug };
    }

    // Если подкатегория не найдена — возвращаем категорию без подкатегории
    return { categorySlug: cat.slug, subcategorySlug: "" };
  }

  return null;
}

/** Извлечь метрическое значение (диаметр, толщина, сечение) из названия */
export function extractMetric(name: string, categorySlug: string): string | null {
  const cat = CATALOG_DICTIONARY.find((c) => c.slug === categorySlug);
  if (!cat || !cat.metricFilters || cat.metricFilters.length === 0) return null;

  const filter = cat.metricFilters[0];
  const match = name.match(new RegExp(filter.pattern, "i"));
  if (!match) return null;

  // Для сечения (двумерный размер) возвращаем "40х40"
  if (match[1] && match[2]) return `${match[1]}х${match[2]}`;
  // Для одномерного — "10 мм" (толщина листа, диаметр арматуры)
  if (match[1]) return `${match[1]} мм`;
  if (match[3]) return `${match[3]} мм`;
  return match[0];
}
