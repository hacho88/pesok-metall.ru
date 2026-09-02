"use client";

/**
 * city-met — одностраничное быстрое оформление заказа.
 * Без онлайн-карт: две вкладки покупателя [Физическое лицо (Наличные)]
 * и [Юридическое лицо (Безналичный расчет)]. Справа — липкая вертикальная
 * сводка «Общий вес груза в тоннах» (Total Combined Cargo Weight).
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  Phone,
  FileText,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Truck,
  Scale,
  X,
  ShieldCheck,
  ArrowRight,
  Package,
} from "lucide-react";
import type { ClientType, CreateOrderPayload, CreateOrderResponse } from "@/types/checkout";
import { formatPhoneMask, isPhoneComplete, isValidInn } from "@/types/checkout";
import { useCityMetBasket } from "./basket-context";
import { cn } from "@/lib/utils";

const SUCCESS_COPY: Record<ClientType, { title: string; text: string }> = {
  fiz: {
    title: "Заявка принята!",
    text: "Менеджер свяжется с вами в течение 10 минут для подтверждения заказа и расчёта доставки самосвалом или манипулятором.",
  },
  yur: {
    title: "Реквизиты приняты!",
    text: "Тендерный отдел формирует счёт на оплату по указанному ИНН. Спецификация отправлена менеджеру.",
  },
};

interface FastCheckoutProps {
  onClose?: () => void;
}

export default function FastCheckout({ onClose }: FastCheckoutProps) {
  const { items, totalWeightTons, totalPrice, removeItem } = useCityMetBasket();

  const [clientType, setClientType] = useState<ClientType>("fiz");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [companyInn, setCompanyInn] = useState("");
  const [touched, setTouched] = useState<{ name?: boolean; phone?: boolean; inn?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentMethod = clientType === "fiz" ? "cash_on_delivery" : "bank_wire";
  const nameValid = customerName.trim().length >= 2;
  const phoneValid = isPhoneComplete(customerPhone);
  const innValid = clientType !== "yur" || isValidInn(companyInn);
  const formValid = nameValid && phoneValid && innValid && items.length > 0;

  /** Сводка веса по позициям (для липкой колонки) */
  const weightSummary = useMemo(
    () =>
      items.map((i) => ({
        name: i.name,
        kind: i.kind,
        weightTons: i.weightTons,
        quantity: i.quantity,
        unitLabel: i.unitLabel,
      })),
    [items]
  );

  /** Разбивка: металл (спарсенный массив) и сыпучие в мешках (BagsQty * BagWeight) */
  const metalTons = items.filter((i) => i.kind === "metal").reduce((s, i) => s + i.weightTons, 0);
  const bulkTons = items.filter((i) => i.kind === "bulk").reduce((s, i) => s + i.weightTons, 0);

  const handleSubmit = async () => {
    if (!formValid || submitting) return;
    setSubmitting(true);
    setError(null);

    const payload: CreateOrderPayload = {
      clientType,
      paymentMethod,
      customerName: customerName.trim(),
      customerPhone,
      companyInn: clientType === "yur" ? companyInn.replace(/\D/g, "") : "",
      cartItems: items.map((i) => ({
        productId: i.rowId,
        sku: i.rowId,
        name: i.name,
        gost: i.gost,
        unit: i.unitLabel,
        quantity: i.quantity,
        weightKg: i.weightTons * 1000,
        weightTons: i.weightTons,
        pricePerUnit: i.pricePerUnit,
        lineTotal: i.lineTotal,
      })),
      totalWeight: Math.round(totalWeightTons * 1000) / 1000,
    };

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as CreateOrderResponse;
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Не удалось отправить заказ. Попробуйте ещё раз.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Ошибка соединения. Проверьте интернет и попробуйте снова.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Экран успеха ---------- */
  if (submitted) {
    const copy = SUCCESS_COPY[clientType];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative overflow-hidden rounded-none border border-neutral-200 bg-white p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-red-600/10" />
        <div className="relative">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-none bg-red-600 text-white"
          >
            <CheckCircle2 className="h-8 w-8" />
          </motion.div>
          <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900">{copy.title}</h3>
          <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-neutral-500">{copy.text}</p>

          <div className="mt-6 divide-y divide-neutral-200 rounded-none border border-neutral-200">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                <Package className="h-4 w-4 text-red-600" />
                Позиций в заказе
              </span>
              <span className="text-sm font-black text-neutral-900">{items.length}</span>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                <Scale className="h-4 w-4 text-red-600" />
                Общий вес груза
              </span>
              <span className="text-sm font-black text-neutral-900">
                {totalWeightTons.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} т
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                {clientType === "fiz" ? <ShieldCheck className="h-4 w-4 text-red-600" /> : <FileText className="h-4 w-4 text-red-600" />}
                Оплата
              </span>
              <span className="text-sm font-black text-neutral-900">
                {clientType === "fiz" ? "Наличными водителю" : "Счёт на оплату"}
              </span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-none bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700"
            >
              Продолжить покупки <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  /* ---------- Форма оформления ---------- */
  return (
    <div className="relative overflow-hidden rounded-none border border-neutral-200 bg-white">
      {/* Шапка */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-4">
        <div>
          <div className="text-sm font-black uppercase tracking-widest text-neutral-900">
            Оформление заказа
          </div>
          <div className="mt-0.5 text-[11px] font-semibold text-neutral-500">
            Без онлайн-оплаты: наличные или счёт
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-neutral-200 text-neutral-500 transition-colors hover:text-neutral-900"
            aria-label="Закрыть оформление"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_280px]">
        {/* Левая колонка: форма */}
        <div className="space-y-5">
          {/* Вкладки покупателя */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setClientType("fiz")}
              className={cn(
                "flex flex-col items-start gap-1.5 rounded-none p-3 text-left transition-all",
                clientType === "fiz"
                  ? "bg-red-600 text-white"
                  : "border border-neutral-200 bg-white hover:border-red-600"
              )}
            >
              <User className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-wider">Физическое лицо</span>
              <span className={cn("text-[10px] font-semibold", clientType === "fiz" ? "text-white/80" : "text-neutral-500")}>
                Наличные водителю
              </span>
            </button>
            <button
              type="button"
              onClick={() => setClientType("yur")}
              className={cn(
                "flex flex-col items-start gap-1.5 rounded-none p-3 text-left transition-all",
                clientType === "yur"
                  ? "bg-red-600 text-white"
                  : "border border-neutral-200 bg-white hover:border-red-600"
              )}
            >
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-wider">Юридическое лицо</span>
              <span className={cn("text-[10px] font-semibold", clientType === "yur" ? "text-white/80" : "text-neutral-500")}>
                Безналичный счёт / ИНН
              </span>
            </button>
          </div>

          {/* Поля */}
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-neutral-500">
                {clientType === "fiz" ? "Ваше имя" : "Контактное лицо"}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder={clientType === "fiz" ? "Например: Иванов Иван" : "Например: Петров Пётр, снабжение"}
                className={cn(
                  "w-full rounded-none border bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/20",
                  touched.name && !nameValid ? "border-red-500" : "border-neutral-200"
                )}
              />
              {touched.name && !nameValid && (
                <p className="mt-1 text-[10px] font-bold text-red-600">Укажите имя (минимум 2 символа)</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-neutral-500">
                Мобильный телефон
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-red-600" />
                <input
                  type="tel"
                  inputMode="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(formatPhoneMask(e.target.value))}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  placeholder="+7 (999) 999-99-99"
                  className={cn(
                    "w-full rounded-none border bg-white py-2.5 pl-10 pr-3.5 text-sm font-semibold tracking-wide text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/20",
                    touched.phone && !phoneValid ? "border-red-500" : "border-neutral-200"
                  )}
                />
              </div>
              {touched.phone && !phoneValid && (
                <p className="mt-1 text-[10px] font-bold text-red-600">Введите номер полностью: +7 (999) 999-99-99</p>
              )}
            </div>

            {/* ИНН для юрлиц */}
            <AnimatePresence>
              {clientType === "yur" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-0.5">
                    <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-neutral-500">
                      ИНН организации
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={companyInn}
                      onChange={(e) => setCompanyInn(e.target.value.replace(/\D/g, "").slice(0, 12))}
                      onBlur={() => setTouched((t) => ({ ...t, inn: true }))}
                      placeholder="10 или 12 цифр"
                      className={cn(
                        "w-full rounded-none border bg-white px-3.5 py-2.5 text-sm font-semibold tracking-[0.15em] text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/20",
                        touched.inn && !innValid ? "border-red-500" : companyInn.length >= 10 ? "border-green-500" : "border-neutral-200"
                      )}
                    />
                    <p className="mt-1 text-[10px] font-medium text-neutral-500">
                      {companyInn.length === 0
                        ? "ИНН проверяется автоматически: 10 цифр (организация) или 12 (ИП)"
                        : companyInn.length < 10
                        ? `Введено ${companyInn.length} из 10–12 цифр`
                        : innValid
                        ? "✓ ИНН корректен (контрольная сумма совпадает)"
                        : "ИНН не прошёл проверку контрольной суммы"}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ошибка */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 rounded-none border border-red-500/40 bg-red-50 p-3"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-xs font-bold text-red-600">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Кнопка отправки */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formValid || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-none bg-red-600 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Отправляем заявку...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                {clientType === "fiz"
                  ? "Подтвердить заказ — наличными водителю"
                  : "Отправить реквизиты — получить счёт"}
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-[10px] font-semibold text-neutral-500">
            <ShieldCheck className="h-3 w-3 text-red-600" />
            Без предоплаты и онлайн-оплаты. Реквизиты защищены.
          </p>
        </div>

        {/* Правая колонка: липкая сводка «Общий вес груза» */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-none border border-neutral-200 bg-neutral-50">
            <div className="border-b border-neutral-200 bg-neutral-900 px-4 py-3">
              <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white">
                <Truck className="h-4 w-4 text-red-500" />
                Общий вес груза
              </span>
            </div>

            <div className="border-b border-neutral-200 px-4 py-4">
              <div className="text-3xl font-black tabular-nums text-red-600">
                {totalWeightTons.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}
                <span className="ml-1 text-sm font-black text-neutral-900">тонн</span>
              </div>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                Total Combined Cargo Weight
              </p>
              <div className="mt-3 space-y-1.5 border-t border-neutral-200 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Металлопрокат
                  </span>
                  <span className="text-xs font-black tabular-nums text-neutral-900">
                    {metalTons.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} т
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Сыпучие в мешках
                  </span>
                  <span className="text-xs font-black tabular-nums text-neutral-900">
                    {bulkTons.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} т
                  </span>
                </div>
              </div>
            </div>

            {/* Позиции */}
            <div className="max-h-56 divide-y divide-neutral-200 overflow-y-auto">
              {weightSummary.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs font-semibold text-neutral-400">
                  Корзина пуста — добавьте товары из таблицы
                </div>
              ) : (
                weightSummary.map((w, idx) => (
                  <div key={`${w.name}-${w.unitLabel}-${idx}`} className="flex items-start justify-between gap-2 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-neutral-900">{w.name}</p>
                      <p className="text-[10px] font-semibold text-neutral-500">
                        {w.quantity} {w.unitLabel}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-black tabular-nums text-neutral-900">
                      {w.weightTons.toLocaleString("ru-RU", { maximumFractionDigits: 3 })} т
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Итог по прайсу */}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
                Итого по прайсу
              </span>
              <span className="text-sm font-black text-neutral-900">
                {totalPrice != null ? `${totalPrice.toLocaleString("ru-RU")} ₽` : "—"}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
