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
        text: "РњРѕСЃРєРІР° Рё РњРѕСЃРєРѕРІСЃРєР°СЏ РѕР±Р»Р°СЃС‚СЊ",
        links: [
          { label: "РћРїС‚РѕРІРёРєР°Рј", href: "/shop", children: [] },
          { label: "Р”РѕСЃС‚Р°РІРєР°", href: "/shop", children: [] },
          { label: "РџСЂР°Р№СЃ-Р»РёСЃС‚", href: "/shop", children: [] },
        ],
      },
      logoUrl: "",
      logoText: "pesok-metall.ru",
      phones: ["+7 (495) 000-00-00"],
      workHours: "РџРЅвЂ“РЎР± 8:00вЂ“20:00",
      email: "info@pesok-metall.ru",
      menu: [
        { label: "РњРµС‚Р°Р»Р»РѕРїСЂРѕРєР°С‚", href: "/shop", children: [] },
        { label: "РџРµСЃРѕРє Рё С‰РµР±РµРЅСЊ", href: "/shop", children: [] },
        { label: "Р”РѕСЃС‚Р°РІРєР°", href: "/shop", children: [] },
        { label: "Рћ РєРѕРјРїР°РЅРёРё", href: "/blog", children: [] },
        { label: "РљРѕРЅС‚Р°РєС‚С‹", href: "/shop", children: [] },
      ],
      quickTags: [
        { label: "РђСЂРјР°С‚СѓСЂР° 12 РјРј", href: "/shop" },
        { label: "РўСЂСѓР±Р° 40С…40", href: "/shop" },
        { label: "РЈРіРѕР»РѕРє 50С…50", href: "/shop" },
        { label: "РџРµСЃРѕРє РјС‹С‚С‹Р№", href: "/shop" },
      ],
      searchPlaceholder: "РџРѕРёСЃРє РїРѕ РєР°С‚Р°Р»РѕРіСѓ: Р°СЂРјР°С‚СѓСЂР°, С‚СЂСѓР±Р° 40С…40, РїРµСЃРѕРє...",
      showCitySelector: true,
      showCart: true,
      cta: { label: "РџСЂР°Р№СЃ-Р»РёСЃС‚", href: "/shop" },
    },
    sidebar: {
      enabled: true,
      roots: [],
      showCounts: true,
      showSearch: true,
      groups: true,
      promoCard: {
        enabled: true,
        title: "РЎРєР°С‡Р°С‚СЊ РїСЂР°Р№СЃ-Р»РёСЃС‚",
        text: "РђРєС‚СѓР°Р»СЊРЅС‹Рµ С†РµРЅС‹ РЅР° РјРµС‚Р°Р»Р»РѕРїСЂРѕРєР°С‚ Рё СЃС‹РїСѓС‡РёРµ РјР°С‚РµСЂРёР°Р»С‹",
        href: "/shop",
        icon: "Download",
      },
    },
    footer: {
      columns: [
        {
          title: "РљР°С‚Р°Р»РѕРі",
          links: [
            { label: "РњРµС‚Р°Р»Р»РѕРїСЂРѕРєР°С‚", href: "/shop", children: [] },
            { label: "РџРµСЃРѕРє Рё С‰РµР±РµРЅСЊ", href: "/shop", children: [] },
            { label: "РђСЂРјР°С‚СѓСЂР°", href: "/shop", children: [] },
            { label: "РўСЂСѓР±С‹", href: "/shop", children: [] },
          ],
        },
        {
          title: "РџРѕРєСѓРїР°С‚РµР»СЏРј",
          links: [
            { label: "Р”РѕСЃС‚Р°РІРєР°", href: "/shop", children: [] },
            { label: "РћРїР»Р°С‚Р°", href: "/shop", children: [] },
            { label: "РћРїС‚РѕРІРёРєР°Рј", href: "/shop", children: [] },
            { label: "РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ", href: "/shop", children: [] },
          ],
        },
        {
          title: "РљРѕРјРїР°РЅРёСЏ",
          links: [
            { label: "Рћ РЅР°СЃ", href: "/blog", children: [] },
            { label: "РЎС‚Р°С‚СЊРё", href: "/blog", children: [] },
            { label: "Р“РµРѕР·РѕРЅС‹", href: "/geo/balashiha", children: [] },
            { label: "РљРѕРЅС‚Р°РєС‚С‹", href: "/shop", children: [] },
          ],
        },
        {
          title: "РљРѕРЅС‚Р°РєС‚С‹",
          links: [
            { label: "+7 (495) 000-00-00", href: "tel:+74950000000", children: [] },
            { label: "info@pesok-metall.ru", href: "mailto:info@pesok-metall.ru", children: [] },
            { label: "РџРЅвЂ“РЎР± 8:00вЂ“20:00", href: "", children: [] },
          ],
        },
      ],
      requisites: "РРќРќ 7723456789 В· РћР“Р Рќ 1237700123456",
      socials: [],
      payments: ["card", "cash", "invoice"],
      copyright: "В© 2026 pesok-metall.ru",
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
                  title: "РњРµС‚Р°Р»Р»РѕРїСЂРѕРєР°С‚ СЃРѕ СЃРєР»Р°РґР° вЂ” РґРѕСЃС‚Р°РІРєР° РІ РґРµРЅСЊ Р·Р°РєР°Р·Р°",
                  subtitle: "РђСЂРјР°С‚СѓСЂР°, С‚СЂСѓР±Р°, СѓРіРѕР»РѕРє, Р»РёСЃС‚ вЂ” Р±РѕР»РµРµ 800 РїРѕР·РёС†РёР№ СЃ Р“РћРЎРў. Р¦РµРЅС‹ Р·Р° РјРµС‚СЂ Рё Р·Р° С‚РѕРЅРЅСѓ.",
                  ctaPrimary: { label: "РџРµСЂРµР№С‚Рё РІ РєР°С‚Р°Р»РѕРі", href: "/shop" },
                  ctaSecondary: { label: "Р Р°СЃСЃС‡РёС‚Р°С‚СЊ РґРѕСЃС‚Р°РІРєСѓ", href: "/shop" },
                  bg: "/uploads/atlas/hero-1.svg",
                },
                {
                  title: "РџРµСЃРѕРє Рё С‰РµР±РµРЅСЊ РІ РјРµС€РєР°С… Рё Р±РёРі-Р±РµРіР°С…",
                  subtitle: "Р¤Р°СЃРѕРІРєР° 30 РєРі Рё 1 С‚. Р”РѕСЃС‚Р°РІРєР° РјР°РЅРёРїСѓР»СЏС‚РѕСЂРѕРј Рё СЃР°РјРѕСЃРІР°Р»РѕРј РїРѕ РњРѕСЃРєРІРµ Рё РњРћ.",
                  ctaPrimary: { label: "Р—Р°РєР°Р·Р°С‚СЊ СЃС‹РїСѓС‡РёРµ", href: "/shop" },
                  ctaSecondary: { label: "РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ РѕР±СЉС‘РјР°", href: "/shop" },
                  bg: "/uploads/atlas/hero-2.svg",
                },
                {
                  title: "РћРїС‚РѕРІРёРєР°Рј вЂ” СЃС‡С‘С‚ Р·Р° 5 РјРёРЅСѓС‚, РѕС‚СЃСЂРѕС‡РєР° РїРѕ РґРѕРіРѕРІРѕСЂСѓ",
                  subtitle: "РЎРїРµС†РёР°Р»СЊРЅС‹Рµ С†РµРЅС‹ РїСЂРё Р·Р°РєР°Р·Рµ РѕС‚ 100 000 в‚Ѕ. Р РµР·РµСЂРІ СЃРєР»Р°РґР°, РґРѕСЃС‚Р°РІРєР° РїРѕ РіСЂР°С„РёРєСѓ.",
                  ctaPrimary: { label: "Р—Р°РїСЂРѕСЃРёС‚СЊ РљРџ", href: "/shop" },
                  ctaSecondary: { label: "РџСЂР°Р№СЃ-Р»РёСЃС‚", href: "/shop" },
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
                { icon: "Truck", title: "Р”РѕСЃС‚Р°РІРєР° СЃРµРіРѕРґРЅСЏ", text: "РџРѕ РњРѕСЃРєРІРµ Рё РњРћ РІ РґРµРЅСЊ Р·Р°РєР°Р·Р°" },
                { icon: "BadgeCheck", title: "Р“РћРЎРў Рё СЃРµСЂС‚РёС„РёРєР°С‚С‹", text: "Р’РµСЃСЊ РјРµС‚Р°Р»Р»РѕРїСЂРѕРєР°С‚ СЃ РґРѕРєСѓРјРµРЅС‚Р°РјРё" },
                { icon: "Building2", title: "Р РѕР·РЅРёС†Р° Рё РѕРїС‚", text: "РћС‚ 1 РјРµС‚СЂР° РґРѕ РїР°СЂС‚РёРё РІР°РіРѕРЅР°" },
                { icon: "MapPin", title: "34 СЂР°Р№РѕРЅР° РґРѕСЃС‚Р°РІРєРё", text: "Р‘Р°Р»Р°С€РёС…Р°, РџРѕРґРѕР»СЊСЃРє, РҐРёРјРєРё Рё РґСЂ." },
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
            props: { title: "РҐРёС‚С‹ РїСЂРѕРґР°Р¶", source: "bestsellers", variant: "grid", limit: 8 },
            settings: { paddingTop: "md", paddingBottom: "md", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("price"),
            type: "PriceBoard",
            props: {
              title: "РљР»СЋС‡РµРІС‹Рµ РїРѕР·РёС†РёРё",
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
                { icon: "Warehouse", title: "РЎРѕР±СЃС‚РІРµРЅРЅС‹Р№ СЃРєР»Р°Рґ", text: "Р‘РѕР»РµРµ 800 РїРѕР·РёС†РёР№ РІ РЅР°Р»РёС‡РёРё РЅР° СЃРєР»Р°РґРµ РІ РњРѕСЃРєРІРµ" },
                { icon: "Truck", title: "Р”РѕСЃС‚Р°РІРєР° РІ РґРµРЅСЊ Р·Р°РєР°Р·Р°", text: "Р“Р°Р·РµР»СЊ, РјР°РЅРёРїСѓР»СЏС‚РѕСЂ, СЃР°РјРѕСЃРІР°Р» вЂ” РїРѕРґР±РµСЂС‘Рј С‚СЂР°РЅСЃРїРѕСЂС‚ РїРѕРґ РѕР±СЉС‘Рј" },
                { icon: "FileCheck", title: "Р”РѕРєСѓРјРµРЅС‚С‹ Рё СЃРµСЂС‚РёС„РёРєР°С‚С‹", text: "Р“РћРЎРў, РїР°СЃРїРѕСЂС‚Р° РєР°С‡РµСЃС‚РІР°, СЃС‡РµС‚Р°-С„Р°РєС‚СѓСЂС‹ вЂ” РІСЃС‘ РІ РєРѕРјРїР»РµРєС‚Рµ" },
                { icon: "Headphones", title: "РџРѕРјРѕС‰СЊ РІ РІС‹Р±РѕСЂРµ", text: "РњРµРЅРµРґР¶РµСЂС‹ РїРѕРґР±РµСЂСѓС‚ РјР°С‚РµСЂРёР°Р» РїРѕ СЃРїРµС†РёС„РёРєР°С†РёРё Рё СЃРјРµС‚Рµ" },
              ],
            },
            settings: { paddingTop: "md", paddingBottom: "md", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("calc"),
            type: "Calculator",
            props: { title: "РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ РјР°С‚РµСЂРёР°Р»РѕРІ Рё РґРѕСЃС‚Р°РІРєРё" },
            settings: { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("bulk"),
            type: "FeaturedProducts",
            props: { title: "РЎС‹РїСѓС‡РёРµ РјР°С‚РµСЂРёР°Р»С‹", source: "category", categorySlug: "pesok-i-scheben", variant: "carousel", limit: 8 },
            settings: { paddingTop: "md", paddingBottom: "md", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("zones"),
            type: "DeliveryZones",
            props: { title: "Р—РѕРЅС‹ РґРѕСЃС‚Р°РІРєРё", limit: 34 },
            settings: { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("steps"),
            type: "Steps",
            props: {
              title: "РљР°Рє Р·Р°РєР°Р·Р°С‚СЊ",
              steps: [
                { title: "Р’С‹Р±РµСЂРёС‚Рµ С‚РѕРІР°СЂ", text: "РќР°Р№РґРёС‚Рµ РЅСѓР¶РЅСѓСЋ РїРѕР·РёС†РёСЋ РІ РєР°С‚Р°Р»РѕРіРµ РёР»Рё С‡РµСЂРµР· РїРѕРёСЃРє" },
                { title: "Р”РѕР±Р°РІСЊС‚Рµ РІ РєРѕСЂР·РёРЅСѓ", text: "РЈРєР°Р¶РёС‚Рµ РєРѕР»РёС‡РµСЃС‚РІРѕ Рё РѕС„РѕСЂРјРёС‚Рµ Р·Р°РєР°Р·" },
                { title: "РџРѕРґС‚РІРµСЂРґРёС‚Рµ Р·Р°РєР°Р·", text: "РњРµРЅРµРґР¶РµСЂ СЃРІСЏР¶РµС‚СЃСЏ СЃ РІР°РјРё РґР»СЏ СѓС‚РѕС‡РЅРµРЅРёСЏ РґРµС‚Р°Р»РµР№" },
                { title: "РџРѕР»СѓС‡РёС‚Рµ С‚РѕРІР°СЂ", text: "Р”РѕСЃС‚Р°РІРєР° РІ РґРµРЅСЊ Р·Р°РєР°Р·Р° РёР»Рё СЃР°РјРѕРІС‹РІРѕР· СЃРѕ СЃРєР»Р°РґР°" },
              ],
            },
            settings: { paddingTop: "md", paddingBottom: "md", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("blog"),
            type: "BlogTeasers",
            props: { title: "РЎС‚Р°С‚СЊРё Рё РЅРѕРІРѕСЃС‚Рё", limit: 3 },
            settings: { paddingTop: "md", paddingBottom: "md", background: "none", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("faq"),
            type: "Faq",
            props: {
              title: "Р§Р°СЃС‚С‹Рµ РІРѕРїСЂРѕСЃС‹",
              variant: "accordion",
              items: [
                { q: "РљР°РєР°СЏ РјРёРЅРёРјР°Р»СЊРЅР°СЏ СЃСѓРјРјР° Р·Р°РєР°Р·Р°?", a: "РњРёРЅРёРјР°Р»СЊРЅРѕР№ СЃСѓРјРјС‹ РЅРµС‚ вЂ” РјРѕР¶РЅРѕ РєСѓРїРёС‚СЊ РѕС‚ 1 РјРµС‚СЂР° Р°СЂРјР°С‚СѓСЂС‹ РёР»Рё 1 РјРµС€РєР° РїРµСЃРєР°." },
                { q: "Р”РѕСЃС‚Р°РІР»СЏРµС‚Рµ РІ РґРµРЅСЊ Р·Р°РєР°Р·Р°?", a: "Р”Р°, РїСЂРё РѕС„РѕСЂРјР»РµРЅРёРё РґРѕ 14:00 РґРѕСЃС‚Р°РІРєР° РїРѕ РњРѕСЃРєРІРµ Рё Р±Р»РёР¶Р°Р№С€РµРјСѓ РџРѕРґРјРѕСЃРєРѕРІСЊСЋ вЂ” РІ С‚РѕС‚ Р¶Рµ РґРµРЅСЊ." },
                { q: "РњРѕР¶РЅРѕ Р»Рё РѕРїР»Р°С‚РёС‚СЊ РїРѕ Р±РµР·РЅР°Р»Сѓ?", a: "Р”Р°, СЂР°Р±РѕС‚Р°РµРј СЃ СЋСЂРёРґРёС‡РµСЃРєРёРјРё Р»РёС†Р°РјРё РїРѕ СЃС‡С‘С‚Сѓ. РџСЂРµРґРѕСЃС‚Р°РІР»СЏРµРј РїРѕР»РЅС‹Р№ РїР°РєРµС‚ РґРѕРєСѓРјРµРЅС‚РѕРІ." },
                { q: "Р•СЃС‚СЊ Р»Рё СЃРµСЂС‚РёС„РёРєР°С‚С‹ РЅР° РјРµС‚Р°Р»Р»РѕРїСЂРѕРєР°С‚?", a: "Р’РµСЃСЊ РјРµС‚Р°Р»Р»РѕРїСЂРѕРєР°С‚ РїРѕСЃС‚Р°РІР»СЏРµС‚СЃСЏ СЃ РїР°СЃРїРѕСЂС‚Р°РјРё РєР°С‡РµСЃС‚РІР° Рё СЃРµСЂС‚РёС„РёРєР°С‚Р°РјРё СЃРѕРѕС‚РІРµС‚СЃС‚РІРёСЏ Р“РћРЎРў." },
                { q: "РљР°Рє СЂР°СЃСЃС‡РёС‚Р°С‚СЊ СЃС‚РѕРёРјРѕСЃС‚СЊ РґРѕСЃС‚Р°РІРєРё?", a: "РСЃРїРѕР»СЊР·СѓР№С‚Рµ РєР°Р»СЊРєСѓР»СЏС‚РѕСЂ РЅР° СЃС‚СЂР°РЅРёС†Рµ РёР»Рё СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїСЂРё РѕС„РѕСЂРјР»РµРЅРёРё вЂ” РјРµРЅРµРґР¶РµСЂ СЂР°СЃСЃС‡РёС‚Р°РµС‚ СЃС‚РѕРёРјРѕСЃС‚СЊ." },
                { q: "РњРѕР¶РЅРѕ Р»Рё РІРµСЂРЅСѓС‚СЊ С‚РѕРІР°СЂ?", a: "Р’РѕР·РІСЂР°С‚ РІРѕР·РјРѕР¶РµРЅ РїСЂРё СЃРѕС…СЂР°РЅРµРЅРёРё С‚РѕРІР°СЂРЅРѕРіРѕ РІРёРґР° РІ С‚РµС‡РµРЅРёРµ 14 РґРЅРµР№. РџРѕРґСЂРѕР±РЅРѕСЃС‚Рё Сѓ РјРµРЅРµРґР¶РµСЂР°." },
              ],
            },
            settings: { paddingTop: "md", paddingBottom: "md", background: "surface", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("cta"),
            type: "CtaBanner",
            props: {
              variant: "phone-form",
              title: "РќСѓР¶РµРЅ СЂР°СЃС‡С‘С‚ СЃРїРµС†РёС„РёРєР°С†РёРё?",
              text: "РћСЃС‚Р°РІСЊС‚Рµ С‚РµР»РµС„РѕРЅ вЂ” РјРµРЅРµРґР¶РµСЂ РїРѕРґР±РµСЂС‘С‚ РјР°С‚РµСЂРёР°Р»С‹ РїРѕ РІР°С€РµР№ СЃРјРµС‚Рµ Рё СЂР°СЃСЃС‡РёС‚Р°РµС‚ СЃС‚РѕРёРјРѕСЃС‚СЊ СЃ РґРѕСЃС‚Р°РІРєРѕР№.",
              ctaLabel: "Р—Р°РєР°Р·Р°С‚СЊ Р·РІРѕРЅРѕРє",
            },
            settings: { paddingTop: "md", paddingBottom: "md", background: "brand", container: "default", visibility: { desktop: true, tablet: true, mobile: true } },
          },
          {
            id: nid("contacts"),
            type: "Contacts",
            props: {
              title: "РљРѕРЅС‚Р°РєС‚С‹",
              address: "РњРѕСЃРєРІР°, СЃРєР»Р°Рґ РјРµС‚Р°Р»Р»РѕРїСЂРѕРєР°С‚Р°",
              phones: ["+7 (495) 000-00-00"],
              email: "info@pesok-metall.ru",
              workHours: "РџРЅвЂ“РЎР± 8:00вЂ“20:00",
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

