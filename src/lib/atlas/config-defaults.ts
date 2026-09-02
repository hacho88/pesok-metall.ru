import type { AtlasConfig } from "./config-schema";

function nid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getDefaultAtlasConfig(): AtlasConfig {
  return {
    version: 1,
    tokens: {
      preset: "steel-orange",
      primary: "#FF6A00",
      secondary: "#0F172A",
      accent: "#0369A1",
      bg: "#F5F7FA",
      surface: "#FFFFFF",
      surface2: "#EEF2F6",
      text: "#0B1220",
      textMuted: "#5B6B7F",
      border: "#DDE3EA",
      radius: "lg",
      fontHeading: "Manrope",
      fontBody: "Inter",
      density: "comfortable",
      buttonStyle: "solid",
      cardStyle: "elevated",
    },
    header: {
      style: "two-row",
      topStrip: {
        enabled: true,
        text: "Москва и Московская область",
        links: [
          { label: "Оптовикам", href: "/catalog", children: [] },
          { label: "Доставка", href: "/catalog", children: [] },
          { label: "Прайс-лист", href: "/catalog", children: [] },
        ],
      },
      logoUrl: "",
      logoText: "pesok-metall.ru",
      phones: ["+7 (495) 000-00-00"],
      workHours: "Пн–Сб 8:00–20:00",
      email: "info@pesok-metall.ru",
      menu: [
        { label: "Металлопрокат", href: "/catalog", children: [] },
        { label: "Песок и щебень", href: "/catalog", children: [] },
        { label: "Доставка", href: "/catalog", children: [] },
        { label: "О компании", href: "/blog", children: [] },
        { label: "Контакты", href: "/catalog", children: [] },
      ],
      quickTags: [
        { label: "Арматура 12 мм", href: "/catalog" },
        { label: "Труба 40х40", href: "/catalog" },
        { label: "Уголок 50х50", href: "/catalog" },
        { label: "Песок мытый", href: "/catalog" },
      ],
      searchPlaceholder: "Поиск по каталогу: арматура, труба 40х40, песок...",
      showCitySelector: true,
      showCart: true,
      cta: { label: "Прайс-лист", href: "/catalog" },
    },
    sidebar: {
      enabled: true,
      roots: [],
      showCounts: true,
      showSearch: true,
      groups: true,
      promoCard: {
        enabled: true,
        title: "Скачать прайс-лист",
        text: "Актуальные цены на металлопрокат и сыпучие материалы",
        href: "/catalog",
        icon: "Download",
      },
    },
    footer: {
      columns: [
        {
          title: "Каталог",
          links: [
            { label: "Металлопрокат", href: "/catalog", children: [] },
            { label: "Песок и щебень", href: "/catalog", children: [] },
            { label: "Арматура", href: "/catalog", children: [] },
            { label: "Трубы", href: "/catalog", children: [] },
          ],
        },
        {
          title: "Покупателям",
          links: [
            { label: "Доставка", href: "/catalog", children: [] },
            { label: "Оплата", href: "/catalog", children: [] },
            { label: "Оптовикам", href: "/catalog", children: [] },
            { label: "Калькулятор", href: "/catalog", children: [] },
          ],
        },
        {
          title: "Компания",
          links: [
            { label: "О нас", href: "/blog", children: [] },
            { label: "Статьи", href: "/blog", children: [] },
            { label: "Геозоны", href: "/geo/balashiha", children: [] },
            { label: "Контакты", href: "/catalog", children: [] },
          ],
        },
        {
          title: "Контакты",
          links: [
            { label: "+7 (495) 000-00-00", href: "tel:+74950000000", children: [] },
            { label: "info@pesok-metall.ru", href: "mailto:info@pesok-metall.ru", children: [] },
            { label: "Пн–Сб 8:00–20:00", href: "", children: [] },
          ],
        },
      ],
      requisites: "ИНН 7723456789 · ОГРН 1237700123456",
      socials: [],
      payments: ["card", "cash", "invoice"],
      copyright: "© 2026 pesok-metall.ru",
      showZones: true,
      showSubscribe: true,
    },
    pages: {
      home: {
        sidebar: true,
        sections: [
          {
            id: nid("hero"),
            type: "HeroSlider",
            props: {
              slides: [
                {
                  title: "Металлопрокат со склада — доставка в день заказа",
                  subtitle: "Арматура, труба, уголок, лист — более 800 позиций с ГОСТ. Цены за метр и за тонну.",
                  ctaPrimary: { label: "Перейти в каталог", href: "/catalog" },
                  ctaSecondary: { label: "Рассчитать доставку", href: "/catalog" },
                  bg: "/uploads/atlas/hero-1.svg",
                },
                {
                  title: "Песок и щебень в мешках и биг-бегах",
                  subtitle: "Фасовка 30 кг и 1 т. Доставка манипулятором и самосвалом по Москве и МО.",
                  ctaPrimary: { label: "Заказать сыпучие", href: "/catalog" },
                  ctaSecondary: { label: "Калькулятор объёма", href: "/catalog" },
                  bg: "/uploads/atlas/hero-2.svg",
                },
                {
                  title: "Оптовикам — счёт за 5 минут, отсрочка по договору",
                  subtitle: "Специальные цены при заказе от 100 000 ₽. Резерв склада, доставка по графику.",
                  ctaPrimary: { label: "Запросить КП", href: "/catalog" },
                  ctaSecondary: { label: "Прайс-лист", href: "/catalog" },
                  bg: "/uploads/atlas/hero-3.svg",
                },
              ],
              autoplay: true,
              interval: 5000,
            },
            settings: { paddingTop: "none", paddingBottom: "none", background: "none", container: "wide", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("promo"),
            type: "PromoStrip",
            props: {
              items: [
                { icon: "Truck", title: "Доставка сегодня", text: "По Москве и МО в день заказа" },
                { icon: "BadgeCheck", title: "ГОСТ и сертификаты", text: "Весь металлопрокат с документами" },
                { icon: "Building2", title: "Розница и опт", text: "От 1 метра до партии вагона" },
                { icon: "MapPin", title: "34 района доставки", text: "Балашиха, Подольск, Химки и др." },
              ],
            },
            settings: { paddingTop: "sm", paddingBottom: "sm", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("cats"),
            type: "CategoryTiles",
            props: { variant: "grid", limit: 12 },
            settings: { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("hits"),
            type: "FeaturedProducts",
            props: { title: "Хиты продаж", source: "bestsellers", variant: "grid", limit: 8 },
            settings: { paddingTop: "md", paddingBottom: "md", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("price"),
            type: "PriceBoard",
            props: {
              title: "Ключевые позиции",
              slugs: ["armatura-a3-a500s-12mm", "armatura-a3-a500s-10mm", "armatura-a3-a500s-14mm", "armatura-a3-a500s-16mm"],
            },
            settings: { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("adv"),
            type: "Advantages",
            props: {
              variant: "cards",
              items: [
                { icon: "Warehouse", title: "Собственный склад", text: "Более 800 позиций в наличии на складе в Москве" },
                { icon: "Truck", title: "Доставка в день заказа", text: "Газель, манипулятор, самосвал — подберём транспорт под объём" },
                { icon: "FileCheck", title: "Документы и сертификаты", text: "ГОСТ, паспорта качества, счета-фактуры — всё в комплекте" },
                { icon: "Headphones", title: "Помощь в выборе", text: "Менеджеры подберут материал по спецификации и смете" },
              ],
            },
            settings: { paddingTop: "md", paddingBottom: "md", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("calc"),
            type: "Calculator",
            props: { title: "Калькулятор материалов и доставки" },
            settings: { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("bulk"),
            type: "FeaturedProducts",
            props: { title: "Сыпучие материалы", source: "category", categorySlug: "pesok-i-scheben", variant: "carousel", limit: 8 },
            settings: { paddingTop: "md", paddingBottom: "md", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("zones"),
            type: "DeliveryZones",
            props: { title: "Зоны доставки", limit: 34 },
            settings: { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("steps"),
            type: "Steps",
            props: {
              title: "Как заказать",
              steps: [
                { title: "Выберите товар", text: "Найдите нужную позицию в каталоге или через поиск" },
                { title: "Добавьте в корзину", text: "Укажите количество и оформите заказ" },
                { title: "Подтвердите заказ", text: "Менеджер свяжется с вами для уточнения деталей" },
                { title: "Получите товар", text: "Доставка в день заказа или самовывоз со склада" },
              ],
            },
            settings: { paddingTop: "md", paddingBottom: "md", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("blog"),
            type: "BlogTeasers",
            props: { title: "Статьи и новости", limit: 3 },
            settings: { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("faq"),
            type: "Faq",
            props: {
              title: "Частые вопросы",
              variant: "accordion",
              items: [
                { q: "Какая минимальная сумма заказа?", a: "Минимальной суммы нет — можно купить от 1 метра арматуры или 1 мешка песка." },
                { q: "Доставляете в день заказа?", a: "Да, при оформлении до 14:00 доставка по Москве и ближайшему Подмосковью — в тот же день." },
                { q: "Можно ли оплатить по безналу?", a: "Да, работаем с юридическими лицами по счёту. Предоставляем полный пакет документов." },
                { q: "Есть ли сертификаты на металлопрокат?", a: "Весь металлопрокат поставляется с паспортами качества и сертификатами соответствия ГОСТ." },
                { q: "Как рассчитать стоимость доставки?", a: "Используйте калькулятор на странице или укажите адрес при оформлении — менеджер рассчитает стоимость." },
                { q: "Можно ли вернуть товар?", a: "Возврат возможен при сохранении товарного вида в течение 14 дней. Подробности у менеджера." },
              ],
            },
            settings: { paddingTop: "md", paddingBottom: "md", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("cta"),
            type: "CtaBanner",
            props: {
              variant: "phone-form",
              title: "Нужен расчёт спецификации?",
              text: "Оставьте телефон — менеджер подберёт материалы по вашей смете и рассчитает стоимость с доставкой.",
              ctaLabel: "Заказать звонок",
            },
            settings: { paddingTop: "md", paddingBottom: "md", background: "brand", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("contacts"),
            type: "Contacts",
            props: {
              title: "Контакты",
              address: "Москва, склад металлопроката",
              phones: ["+7 (495) 000-00-00"],
              email: "info@pesok-metall.ru",
              workHours: "Пн–Сб 8:00–20:00",
              mapUrl: "https://yandex.ru/map-widget/v1/?ll=37.617635%2C55.755814&z=10",
            },
            settings: { paddingTop: "md", paddingBottom: "lg", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
        ],
      },
      category: {
        sidebar: true,
        defaultSort: "popular",
        defaultView: "grid",
        perPage: 24,
        showSubcategoryTiles: true,
        filters: { availability: true, price: true, attributes: true, maxAttributeFacets: 6 },
        descriptionPosition: "bottom",
        sectionsBefore: [],
        sectionsAfter: [],
      },
      product: {
        sidebar: false,
        buyBox: { showPerTon: true, showOneClick: true, showRequestQuote: true, showZonePrice: true, showDelivery: true },
        sections: [
          { id: nid("desc"), type: "ProductDescription", props: {}, settings: { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } } },
          { id: nid("specs"), type: "ProductSpecs", props: {}, settings: { paddingTop: "md", paddingBottom: "md", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } } },
          { id: nid("calc"), type: "ProductCalculator", props: {}, settings: { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } } },
          { id: nid("delivery"), type: "ProductDelivery", props: {}, settings: { paddingTop: "md", paddingBottom: "md", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } } },
          { id: nid("similar"), type: "SimilarProducts", props: { limit: 8 }, settings: { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } } },
        ],
      },
      search: { sidebar: true, sectionsAfter: [] },
      cart: { sectionsAfter: [] },
    },
  };
}
