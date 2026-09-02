"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Calculator,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileCheck2,
  FileSpreadsheet,
  Filter,
  Layers,
  Phone,
  PhoneCall,
  Plus,
  Scale,
  Search,
  Send,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  X,
  Zap,
} from "lucide-react";
import type { StorefrontProduct } from "@/lib/theme-storefront";
import { IdealBasketProvider, useIdealBasket, type BasketItem } from "./basket-context";
import IdealAsset from "./IdealAsset";
import { cn } from "@/lib/utils";

const PHONE = "+7 (495) 123-45-67";
const PHONE_RAW = "+74951234567";

export default function IdealStorefront({ products }: { products: StorefrontProduct[] }) {
  return (
    <IdealBasketProvider>
      <IdealStorefrontInner products={products} />
    </IdealBasketProvider>
  );
}

function IdealStorefrontInner({ products }: { products: StorefrontProduct[] }) {
  const { count, totalPrice, items, removeItem, updateQuantity, clearBasket } = useIdealBasket();
  const [cartOpen, setCartOpen] = useState(false);
  const [fastOrderProduct, setFastOrderProduct] = useState<StorefrontProduct | null>(null);
  const [orderSent, setOrderSent] = useState(false);

  // Фильтры каталога
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Калькулятор
  const [calcMat, setCalcMat] = useState<"pesok" | "scheben" | "armatura">("pesok");
  const [calcVolume, setCalcVolume] = useState<number>(15);
  const [calcDistance, setCalcDistance] = useState<number>(20);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.categoryName) set.add(p.categoryName);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "all" && p.categoryName !== selectedCategory) return false;
      if (onlyInStock && !p.inStock) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchGost = p.gost?.toLowerCase().includes(q);
        const matchCat = p.categoryName?.toLowerCase().includes(q);
        if (!matchName && !matchGost && !matchCat) return false;
      }
      return true;
    });
  }, [products, selectedCategory, onlyInStock, searchQuery]);

  // Расчёт стоимости в калькуляторе
  const calcResult = useMemo(() => {
    const basePrices = {
      pesok: 850, // за куб
      scheben: 1650, // за куб
      armatura: 58000, // за тонну
    };
    const materialCost = calcVolume * basePrices[calcMat];
    const deliveryCost = 3500 + calcDistance * 60;
    return {
      materialCost,
      deliveryCost,
      total: materialCost + deliveryCost,
    };
  }, [calcMat, calcVolume, calcDistance]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. Верхний информационный бар */}
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md text-xs text-slate-600">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Базы и карьеры работают 24/7
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-slate-500">
              <Truck className="h-3.5 w-3.5 text-blue-600" />
              Собственный автопарк: 24 самосвала и манипулятора
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              Сертификаты ГОСТ и весовой контроль
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">Москва и Московская область</span>
            <a
              href={`tel:${PHONE_RAW}`}
              className="font-bold text-slate-900 hover:text-blue-600 transition-colors"
            >
              {PHONE}
            </a>
          </div>
        </div>
      </div>

      {/* 2. Основная шапка (Apple / Linear style) */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Логотип */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-600/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-950">
                  PESOK<span className="text-blue-600">.METALL</span>
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700 border border-blue-200">
                  ИДЕАЛ
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Официальный B2B/B2C складской хаб
              </p>
            </div>
          </div>

          {/* Навигация */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
            <a href="#bulk" className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Сыпучие материалы
            </a>
            <a href="#metal" className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Металлопрокат
            </a>
            <a href="#calculator" className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Калькулятор
            </a>
            <a href="#advantages" className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Преимущества
            </a>
          </nav>

          {/* Действия: Телефон + Корзина */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${PHONE_RAW}`}
              className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 transition-all"
            >
              <PhoneCall className="h-4 w-4 text-blue-600" />
              <span>Заказать звонок</span>
            </a>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Корзина</span>
              {count > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-black text-blue-700">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* 3. Премиальный Hero (Linear/Apple mesh) */}
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] py-16 sm:py-24">
          {/* Subtle Radial Glows */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[800px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 right-10 -z-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              {/* Левая колонка — Заголовок и УТП */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Эталонный сервис поставок 2026</span>
                </div>

                <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                  Прямые поставки <br />
                  <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    металла и сыпучих
                  </span>{" "}
                  по Москве и МО
                </h1>

                <p className="max-w-2xl text-base text-slate-600 sm:text-lg leading-relaxed">
                  Оптово-розничный склад металлопроката ГОСТ и прямая отгрузка песка, щебня, керамзита
                  с карьеров. Доставка манипуляторами и самосвалами в день заказа от 2 часов.
                </p>

                {/* Быстрые метрики доверия */}
                <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-sm">
                    <div className="text-xl font-black text-slate-950">24/7</div>
                    <div className="text-xs text-slate-500 font-medium">Круглосуточная отгрузка</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-sm">
                    <div className="text-xl font-black text-slate-950">100%</div>
                    <div className="text-xs text-slate-500 font-medium">Точный вес по ГОСТ</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-sm">
                    <div className="text-xl font-black text-slate-950">20%</div>
                    <div className="text-xs text-slate-500 font-medium">Работа с НДС для юрлиц</div>
                  </div>
                </div>

                {/* Кнопки действия */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#metal"
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/25 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-600/30 transition-all"
                  >
                    <span>Открыть каталог металла</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#calculator"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    <Calculator className="h-4 w-4 text-blue-600" />
                    <span>Калькулятор доставки</span>
                  </a>
                </div>
              </div>

              {/* Правая колонка — Интерактивная карточка быстрой заявки */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">Экспресс-расчёт заказа</h3>
                      <p className="text-xs text-slate-500">Подберём транспорт и зафиксируем цену</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <Zap className="h-4 w-4" />
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setOrderSent(true);
                    }}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Что требуется?</label>
                      <input
                        type="text"
                        required
                        placeholder="Например: Арматура 12мм 2 тонны + Песок 15 кубов"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Адрес доставки (город / район)</label>
                      <input
                        type="text"
                        required
                        placeholder="Москва, Балашиха, Подольск..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Номер телефона</label>
                      <input
                        type="tel"
                        required
                        placeholder="+7 (___) ___-__-__"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-slate-950 py-3 text-sm font-bold text-white hover:bg-blue-600 active:scale-[0.99] transition-all shadow-md"
                    >
                      {orderSent ? "✓ Заявка отправлена менеджерам!" : "Рассчитать стоимость с доставкой"}
                    </button>

                    <p className="text-[11px] text-center text-slate-400">
                      Ответ дежурного инженера-логиста в течение 3–5 минут
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Bento-витрина сыпучих материалов */}
        <section id="bulk" className="py-16 sm:py-20 border-b border-slate-200/70 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                  <Boxes className="h-4 w-4" />
                  <span>Собственные карьеры и фасовка</span>
                </div>
                <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl tracking-tight">
                  Сыпучие нерудные материалы
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Отгрузка навалом от 10 м³ (самосвалы) или фасовка (мешки 30 кг / Биг-бэги 1 т)
                </p>
              </div>

              <a
                href="#calculator"
                className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                <span>Рассчитать объём доставки</span>
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            {/* Карточки Bento */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Песок */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-amber-50/50 via-white to-slate-50 p-6 shadow-sm hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/5 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-black text-amber-800">
                      ГОСТ 8736-2014
                    </span>
                    <span className="text-xs font-semibold text-slate-400">от 850 ₽/м³</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-950">Песок строительный</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Мытый, сеяный, карьерный и речной песок. Модуль крупности 1.5–2.5 мм. Идеален для стяжки, бетона и фундамента.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700">
                      Карьерный сеяный
                    </span>
                    <span className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700">
                      Мытый 2.0 мм
                    </span>
                    <span className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700">
                      Мешки 30 кг
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">В наличии на базах</span>
                    <span className="text-sm font-bold text-slate-900">12 400 м³</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFastOrderProduct({
                        id: "quick-pesok",
                        name: "Песок строительный мытый (ГОСТ)",
                        slug: "pesok-stroitelny",
                        categoryName: "Песок",
                        type: "BAG_30KG",
                        price: 850,
                        isOnOrder: false,
                        unit: "м³",
                        weightKg: 1500,
                        inStock: true,
                        imageUrl: null,
                        imageLocal: null,
                        gost: "ГОСТ 8736-2014",
                        length: null,
                        weightLabel: "1.5 т/м³",
                        attributes: [],
                      })
                    }
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition-colors"
                  >
                    Заказать
                  </button>
                </div>
              </div>

              {/* Щебень */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 p-6 shadow-sm hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-100/80 px-2.5 py-0.5 text-xs font-black text-blue-800">
                      ГОСТ 8267-93
                    </span>
                    <span className="text-xs font-semibold text-slate-400">от 1 650 ₽/м³</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-950">Щебень гранитный / гравийный</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Фракции 5-20, 20-40, 40-70 мм. Прочность М1200–М1400, морозостойкость F300. Для монолитных работ и дорожного строительства.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700">
                      Гранит 5-20 мм
                    </span>
                    <span className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700">
                      Гравий 20-40 мм
                    </span>
                    <span className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700">
                      Биг-бэг 1 т
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">В наличии на базах</span>
                    <span className="text-sm font-bold text-slate-900">8 900 м³</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFastOrderProduct({
                        id: "quick-scheben",
                        name: "Щебень гранитный фр. 5-20 (ГОСТ)",
                        slug: "scheben-granitny-5-20",
                        categoryName: "Щебень",
                        type: "BAG_30KG",
                        price: 1650,
                        isOnOrder: false,
                        unit: "м³",
                        weightKg: 1400,
                        inStock: true,
                        imageUrl: null,
                        imageLocal: null,
                        gost: "ГОСТ 8267-93",
                        length: null,
                        weightLabel: "1.4 т/м³",
                        attributes: [],
                      })
                    }
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition-colors"
                  >
                    Заказать
                  </button>
                </div>
              </div>

              {/* Керамзит и Грунт */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 p-6 shadow-sm hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                      ГОСТ 32496-2013
                    </span>
                    <span className="text-xs font-semibold text-slate-400">от 1 900 ₽/м³</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-950">Керамзит и Чернозём</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Керамзитовый гравий фр. 10-20 мм (плотность М400) для утепления полов и перекрытий. Плодородный грунт для благоустройства.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700">
                      Керамзит 10-20
                    </span>
                    <span className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700">
                      Грунт плодородный
                    </span>
                    <span className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700">
                      Мешки 50 л
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">В наличии на базах</span>
                    <span className="text-sm font-bold text-slate-900">4 200 м³</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFastOrderProduct({
                        id: "quick-keramzit",
                        name: "Керамзит фракция 10-20 в мешках",
                        slug: "keramzit-10-20",
                        categoryName: "Керамзит",
                        type: "BAG_30KG",
                        price: 1900,
                        isOnOrder: false,
                        unit: "м³",
                        weightKg: 400,
                        inStock: true,
                        imageUrl: null,
                        imageLocal: null,
                        gost: "ГОСТ 32496-2013",
                        length: null,
                        weightLabel: "0.4 т/м³",
                        attributes: [],
                      })
                    }
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition-colors"
                  >
                    Заказать
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Премиальный каталог металлопроката */}
        <section id="metal" className="py-16 sm:py-20 bg-[#F8FAFC]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                  <Layers className="h-4 w-4" />
                  <span>Каталог металлопроката и прайс-лист</span>
                </div>
                <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl tracking-tight">
                  Арматура, профильные трубы и сортовой прокат
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Прямые цены заводов-производителей. Резка в размер, доставка манипулятором.
                </p>
              </div>

              <div className="text-sm font-medium text-slate-500">
                Найдено позиций: <span className="font-bold text-slate-900">{filteredProducts.length}</span>
              </div>
            </div>

            {/* Панель фильтров и поиска */}
            <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
              <div className="flex flex-wrap gap-3">
                {/* Поиск */}
                <div className="relative min-w-64 flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по марке стали, диаметру или ГОСТ..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Чекбокс наличии */}
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Только в наличии</span>
                </label>
              </div>

              {/* Чипы категорий */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
                    selectedCategory === "all"
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Все разделы
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
                      selectedCategory === cat
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Сетка товаров (Apple / Linear карточки) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCardItem
                  key={product.id}
                  product={product}
                  onFastOrder={() => setFastOrderProduct(product)}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
                <p className="text-base font-bold text-slate-800">Позиций по вашему запросу не найдено</p>
                <p className="mt-1 text-xs text-slate-500">Попробуйте сбросить фильтры или изменить поисковый запрос</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                    setOnlyInStock(false);
                  }}
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition-colors"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 6. Интерактивный калькулятор доставки */}
        <section id="calculator" className="py-16 sm:py-20 border-t border-slate-200/70 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                  <Calculator className="h-4 w-4" />
                  <span>Умный логистический расчёт</span>
                </div>
                <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                  Калькулятор объёма и доставки
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Выберите материал, объём и расстояние от МКАД — система моментально рассчитает ориентировочную
                  стоимость и подберёт оптимальный транспорт (Газель, самосвал 10-20 м³ или Тонар).
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Быстрая подача транспорта в течение 2–3 часов</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Пропуск в центр Москвы (ТТК / Садовое кольцо)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Разгрузка манипулятором на объекте</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-8 shadow-xl shadow-slate-100">
                  {/* Выбор материала */}
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      1. Выберите материал
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setCalcMat("pesok")}
                        className={cn(
                          "rounded-2xl border p-3 text-left transition-all",
                          calcMat === "pesok"
                            ? "border-blue-600 bg-white shadow-md shadow-blue-600/5 text-blue-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        )}
                      >
                        <div className="text-xs font-bold">Песок</div>
                        <div className="text-[11px] text-slate-400">850 ₽/м³</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalcMat("scheben")}
                        className={cn(
                          "rounded-2xl border p-3 text-left transition-all",
                          calcMat === "scheben"
                            ? "border-blue-600 bg-white shadow-md shadow-blue-600/5 text-blue-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        )}
                      >
                        <div className="text-xs font-bold">Щебень</div>
                        <div className="text-[11px] text-slate-400">1 650 ₽/м³</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalcMat("armatura")}
                        className={cn(
                          "rounded-2xl border p-3 text-left transition-all",
                          calcMat === "armatura"
                            ? "border-blue-600 bg-white shadow-md shadow-blue-600/5 text-blue-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        )}
                      >
                        <div className="text-xs font-bold">Арматура</div>
                        <div className="text-[11px] text-slate-400">58 000 ₽/т</div>
                      </button>
                    </div>
                  </div>

                  {/* Ползунок объёма */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        2. Объём ({calcMat === "armatura" ? "тонн" : "м³"})
                      </label>
                      <span className="text-sm font-black text-blue-600">
                        {calcVolume} {calcMat === "armatura" ? "т" : "м³"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={calcMat === "armatura" ? 40 : 100}
                      value={calcVolume}
                      onChange={(e) => setCalcVolume(Number(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Ползунок расстояния */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        3. Расстояние от базы / МКАД
                      </label>
                      <span className="text-sm font-black text-blue-600">{calcDistance} км</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={150}
                      value={calcDistance}
                      onChange={(e) => setCalcDistance(Number(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Результат */}
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <div className="text-xs text-blue-700 font-medium">Итоговая ориентировочная стоимость:</div>
                        <div className="text-2xl font-black text-slate-950">
                          {calcResult.total.toLocaleString("ru-RU")} ₽
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Материал: {calcResult.materialCost.toLocaleString("ru-RU")} ₽ · Доставка: {calcResult.deliveryCost.toLocaleString("ru-RU")} ₽
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setFastOrderProduct({
                            id: `calc-${calcMat}`,
                            name: `Расчёт: ${calcMat === "pesok" ? "Песок" : calcMat === "scheben" ? "Щебень" : "Арматура"} (${calcVolume} ${calcMat === "armatura" ? "т" : "м³"}, ${calcDistance} км)`,
                            slug: "calculated-order",
                            categoryName: "Индивидуальный расчёт",
                            type: "METALL",
                            price: calcResult.total,
                            isOnOrder: false,
                            unit: "заказ",
                            weightKg: calcVolume * 1000,
                            inStock: true,
                            imageUrl: null,
                            imageLocal: null,
                            gost: null,
                            length: null,
                            weightLabel: null,
                            attributes: [],
                          })
                        }
                        className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
                      >
                        Оформить по этой цене
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Преимущества / Trust Grid */}
        <section id="advantages" className="py-16 sm:py-20 bg-slate-900 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                Гарантии надёжности
              </span>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Почему снабженцы и строители выбирают нас
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
                  <Scale className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Точный весовой контроль</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Электронные автовесы на всех отгрузочных узлах. Предоставляем весовые талоны при выезде.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Паспорта качества и ГОСТ</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Каждая партия металла и сыпучих материалов сопровождается заводскими сертификатами и паспортами.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Доставка от 2 часов</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Дежурные машины всегда готовы к выезду. Экспресс-доставка на строительные площадки Москвы и области.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-4 border border-amber-500/20">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Работа с НДС 20% и ЭДО</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Моментальное выставление счетов через Диадок / СБИС. Отсрочка платежа постоянным контрагентам.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Футер «Идеал» */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-600 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm">
                И
              </div>
              <div>
                <span className="font-black text-slate-950 text-sm">PESOK.METALL — Тема «Идеал»</span>
                <p className="text-slate-400 text-[11px]">Эталонный B2B/B2C строительный хаб</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-700 font-semibold">
              <a href={`tel:${PHONE_RAW}`} className="hover:text-blue-600">
                {PHONE}
              </a>
              <span>·</span>
              <span>info@pesok-metall.ru</span>
              <span>·</span>
              <span>Москва, МКАД 14-й км</span>
            </div>
          </div>
          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} pesok-metall.ru. Все права защищены.</p>
            <p>Цены на сайте не являются публичной офертой и уточняются при заказе.</p>
          </div>
        </div>
      </footer>

      {/* 9. Корзина (Slide-over Drawer) */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-950">Корзина заказа</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                    {count}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Список позиций */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 leading-tight">{item.name}</p>
                        <p className="text-[11px] text-slate-400">{item.category}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold hover:bg-slate-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold hover:bg-slate-50"
                        >
                          +
                        </button>
                        <span className="text-[11px] text-slate-400 ml-1">{item.unit}</span>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-950">
                          {item.price ? `${(item.price * item.quantity).toLocaleString("ru-RU")} ₽` : "По запросу"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="py-16 text-center text-slate-400 space-y-2">
                    <ShoppingCart className="h-10 w-10 mx-auto opacity-30" />
                    <p className="text-xs font-medium">Ваша корзина пока пуста</p>
                  </div>
                )}
              </div>

              {/* Итог и отправка */}
              {items.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">Итого:</span>
                    <span className="text-xl font-black text-slate-950">
                      {totalPrice.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      alert("Заказ оформлен! Менеджер свяжется с вами в течение 5 минут.");
                      clearBasket();
                      setCartOpen(false);
                    }}
                    className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-[0.99] transition-all"
                  >
                    Оформить заказ
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 10. Модалка быстрого заказа */}
      <AnimatePresence>
        {fastOrderProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    Быстрый заказ позиции
                  </span>
                  <h3 className="text-lg font-black text-slate-950 mt-0.5">{fastOrderProduct.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setFastOrderProduct(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(`Заявка на «${fastOrderProduct.name}» принята! Наш специалист перезвонит вам.`);
                  setFastOrderProduct(null);
                }}
                className="space-y-4 pt-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Количество / объём</label>
                  <input
                    type="text"
                    defaultValue="1"
                    placeholder="Например: 5 тонн / 20 м³"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ваш номер телефона *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+7 (___) ___-__-__"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Адрес доставки / комментарий</label>
                  <textarea
                    rows={2}
                    placeholder="Куда доставить или самовывоз с базы"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFastOrderProduct(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
                  >
                    Подтвердить заказ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Карточка товара */
function ProductCardItem({
  product,
  onFastOrder,
}: {
  product: StorefrontProduct;
  onFastOrder: () => void;
}) {
  const { addItem } = useIdealBasket();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.categoryName,
      price: product.price,
      unit: product.unit || "шт",
      weightKg: product.weightKg,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-blue-400/80 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
      <div>
        {/* Бейджи статуса */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {product.gost ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
              {product.gost}
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
              ГОСТ
            </span>
          )}

          {product.isOnOrder ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60">
              Под заказ
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              В наличии
            </span>
          )}
        </div>

        {/* Фото товара / технический чертёж */}
        <div className="relative mb-3 h-36 overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <IdealAsset product={product} className="h-full w-full" />
        </div>

        {/* Название */}
        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
          {product.name}
        </h4>

        <p className="mt-1 text-[11px] text-slate-400 font-medium">
          {product.categoryName}
        </p>
      </div>

      {/* Цена и кнопки */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-lg font-black text-slate-950">
            {product.price ? (
              <>
                {product.price.toLocaleString("ru-RU")} ₽
                <span className="text-xs font-medium text-slate-400 ml-1">
                  /{product.unit || "м"}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-slate-500">Цена по запросу</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all",
              added
                ? "bg-emerald-600 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
            )}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>В корзине</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>В корзину</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onFastOrder}
            className="rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-800 hover:border-slate-400 hover:bg-slate-50 transition-colors"
          >
            Заказать в 1 клик
          </button>
        </div>
      </div>
    </div>
  );
}
