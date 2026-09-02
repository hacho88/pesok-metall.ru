"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  Phone,
  Banknote,
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
import type {
  ClientType,
  CheckoutCartItem,
  CreateOrderPayload,
  CreateOrderResponse,
} from "@/types/checkout";
import { formatPhoneMask, isPhoneComplete, isValidInn } from "@/types/checkout";
import type { CheckoutLayout } from "@/types/striker-engine";

/** Режим оформления STRIKER.Engine */
export type CheckoutVariant = "city" | "vi";

/** Промышленные барьеры веса груза: 20 т — манипулятор/борт, 40 т — автопоезд */
const WEIGHT_BARRIER_1 = 20;
const WEIGHT_BARRIER_2 = 40;

interface FastCheckoutProps {
  /** 'city' — брутальный индустриальный; 'vi' — мягкий корпоративный */
  variant: CheckoutVariant;
  /** ULTRA: раскладка экрана оформления (сплит-превью / минималистичный флайаут) */
  checkoutLayout?: CheckoutLayout;
  /** Состав корзины (уже агрегированный, с пересчитанным весом в тоннах) */
  cartItems: CheckoutCartItem[];
  /** Удалить позицию из корзины по SKU */
  onRemoveItem?: (sku: string) => void;
  /** Закрыть оформление (если открыто в модальном окне) */
  onClose?: () => void;
  /** Вызывается после успешного сохранения заказа (например, очистка корзины) */
  onSuccess?: () => void;
}

/**
 * Плавающий агрегат «Общий вес груза» в тоннах.
 * При превышении промышленных барьеров (20 т / 40 т) текст вспыхивает
 * аварийным оранжевым/красным и пульсирует.
 */
function PayloadWeightLabel({ weightTons, sharp }: { weightTons: number; sharp: boolean }) {
  const alert1 = weightTons > WEIGHT_BARRIER_1;
  const alert2 = weightTons > WEIGHT_BARRIER_2;
  const tone = alert2 ? "#ef4444" : alert1 ? "#f97316" : "var(--theme-primary)";
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-3 border border-[var(--theme-border)] bg-[var(--theme-background)] px-4 py-3"
      style={{ borderRadius: sharp ? 0 : 12 }}
    >
      <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[var(--theme-muted-foreground)]">
        <Truck className="h-4 w-4" style={{ color: tone }} />
        Общий вес груза
      </span>
      <motion.span
        key={alert2 ? "red" : alert1 ? "orange" : "normal"}
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className={`text-lg font-black tabular-nums ${alert1 ? "animate-pulse" : ""}`}
        style={{ color: tone }}
      >
        {weightTons.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} т
      </motion.span>
    </motion.div>
  );
}

/** Тексты успешной отправки по типу покупателя */
const SUCCESS_COPY: Record<ClientType, { title: string; text: string }> = {
  fiz: {
    title: "Заявка принята!",
    text: "Менеджер свяжется с вами в течение 10 минут для подтверждения заказа и расчета стоимости доставки самосвалом/грузовиком.",
  },
  yur: {
    title: "Реквизиты приняты!",
    text: "Наш тендерный отдел уже формирует счет на оплату по указанному ИНН. Спецификация отправлена менеджеру.",
  },
};

export default function FastCheckout({
  variant,
  checkoutLayout = "minimalist-modal-flyout",
  cartItems,
  onRemoveItem,
  onClose,
  onSuccess,
}: FastCheckoutProps) {
  const isCity = variant === "city";
  const isSplit = checkoutLayout === "split-screen-preview";

  /* ---------- Состояние формы ---------- */
  const [clientType, setClientType] = useState<ClientType>("fiz");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [companyInn, setCompanyInn] = useState("");
  const [touched, setTouched] = useState<{ name?: boolean; phone?: boolean; inn?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Производные значения ---------- */
  const paymentMethod = clientType === "fiz" ? "cash_on_delivery" : "bank_wire";
  const totalWeight = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.weightTons, 0),
    [cartItems]
  );
  const totalPrice = useMemo(
    () =>
      cartItems.reduce<number | null>((sum, item) => {
        if (sum === null || item.lineTotal === null) return null;
        return sum + item.lineTotal;
      }, 0),
    [cartItems]
  );

  const nameValid = customerName.trim().length >= 2;
  const phoneValid = isPhoneComplete(customerPhone);
  const innValid = clientType !== "yur" || isValidInn(companyInn);
  const formValid = nameValid && phoneValid && innValid;

  /* ---------- Обработчики ---------- */
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
      cartItems,
      totalWeight: Math.round(totalWeight * 1000) / 1000,
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
      onSuccess?.();
    } catch {
      setError("Ошибка соединения. Проверьте интернет и попробуйте снова.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Классы по варианту ---------- */
  const shape = isCity ? "rounded-none" : "rounded-lg";
  const inputShape = isCity ? "rounded-none" : "rounded-lg";
  const btnShape = isCity ? "rounded-none" : "rounded-lg";
  const tabShape = isCity ? "rounded-none" : "rounded-lg";
  const fontTitle = isCity ? "text-sm font-black uppercase tracking-widest" : "text-base font-black";
  const gridLine = isCity ? "border border-[var(--theme-border)]" : "border border-[var(--theme-border)]";

  /* ================================================================ */
  /* Экран успеха (Framer Motion: форма сворачивается в карточку)      */
  /* ================================================================ */
  if (submitted) {
    const copy = SUCCESS_COPY[clientType];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`relative overflow-hidden ${shape} border border-[var(--theme-border)] bg-[var(--theme-card)] p-6 sm:p-8`}
      >
        {/* Индустриальная подсветка */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20"
          style={{ background: "var(--theme-primary)" }}
        />
        <div className="relative">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
            className={`mb-5 flex h-16 w-16 items-center justify-center ${shape} text-white`}
            style={{ background: "var(--theme-primary)" }}
          >
            <CheckCircle2 className="h-8 w-8" />
          </motion.div>

          <h3 className={`${fontTitle} text-[var(--theme-foreground)]`}>{copy.title}</h3>
          <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-[var(--theme-muted-foreground)]">
            {copy.text}
          </p>

          {/* Сводка заказа */}
          <div className={`mt-6 ${shape} ${gridLine} divide-y divide-[var(--theme-border)]`}>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--theme-muted-foreground)]">
                <Package className="h-4 w-4" style={{ color: "var(--theme-primary)" }} />
                Позиций в заказе
              </span>
              <span className="text-sm font-black text-[var(--theme-foreground)]">{cartItems.length}</span>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--theme-muted-foreground)]">
                <Scale className="h-4 w-4" style={{ color: "var(--theme-primary)" }} />
                Общий вес
              </span>
              <span className="text-sm font-black text-[var(--theme-foreground)]">
                {totalWeight.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} т
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--theme-muted-foreground)]">
                {clientType === "fiz" ? (
                  <Banknote className="h-4 w-4" style={{ color: "var(--theme-primary)" }} />
                ) : (
                  <FileText className="h-4 w-4" style={{ color: "var(--theme-primary)" }} />
                )}
                Оплата
              </span>
              <span className="text-sm font-black text-[var(--theme-foreground)]">
                {clientType === "fiz" ? "Наличными водителю" : "Счёт на оплату"}
              </span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className={`mt-6 flex w-full items-center justify-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition-opacity hover:opacity-90 ${btnShape}`}
              style={{ background: "var(--theme-primary)" }}
            >
              Продолжить покупки <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  /* ================================================================ */
  /* Форма оформления заказа                                           */
  /* ================================================================ */
  return (
    <div
      className={`relative overflow-hidden ${shape} border border-[var(--theme-border)] bg-[var(--theme-card)]`}
    >
      {/* Шапка */}
      <div
        className={`flex items-center justify-between gap-3 border-b border-[var(--theme-border)] px-5 py-4`}
        style={{ background: "var(--theme-muted)" }}
      >
        <div>
          <div className={`${fontTitle} text-[var(--theme-foreground)]`}>Оформление заказа</div>
          <div className="mt-0.5 text-[11px] font-semibold text-[var(--theme-muted-foreground)]">
            Оплата онлайн не принимается — только наличные или счёт
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex h-8 w-8 shrink-0 items-center justify-center ${shape} border border-[var(--theme-border)] text-[var(--theme-muted-foreground)] transition-colors hover:text-[var(--theme-foreground)]`}
            aria-label="Закрыть оформление"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className={isSplit ? "grid gap-5 p-5 sm:p-6 lg:grid-cols-2" : "space-y-5 p-5 sm:p-6"}>
        {/* Плавающий агрегат «Общий вес груза» (только в сплит-режиме) */}
        {isSplit && (
          <div className="lg:col-start-1 lg:row-start-1">
            <PayloadWeightLabel weightTons={totalWeight} sharp={isCity} />
          </div>
        )}

        {/* ---------- Вкладки: тип покупателя ---------- */}
        <div className={`grid grid-cols-2 gap-2 ${isSplit ? "lg:col-start-2 lg:row-start-1" : ""}`}>
          <button
            type="button"
            onClick={() => setClientType("fiz")}
            className={`flex flex-col items-start gap-1.5 p-3 text-left transition-all ${tabShape} ${
              clientType === "fiz"
                ? "border-2 text-white"
                : `border border-[var(--theme-border)] bg-[var(--theme-background)] hover:border-[var(--theme-primary)]`
            }`}
            style={clientType === "fiz" ? { background: "var(--theme-primary)", borderColor: "var(--theme-primary)" } : undefined}
          >
            <User className="h-4 w-4" style={clientType === "fiz" ? { color: "var(--theme-background)" } : { color: "var(--theme-primary)" }} />
            <span className={`text-xs font-black uppercase tracking-wider ${clientType === "fiz" ? "text-[var(--theme-background)]" : "text-[var(--theme-foreground)]"}`}>
              Физическое лицо
            </span>
            <span className={`text-[10px] font-semibold leading-tight ${clientType === "fiz" ? "text-[var(--theme-background)]/80" : "text-[var(--theme-muted-foreground)]"}`}>
              Наличный расчёт / оплата на объекте
            </span>
          </button>

          <button
            type="button"
            onClick={() => setClientType("yur")}
            className={`flex flex-col items-start gap-1.5 p-3 text-left transition-all ${tabShape} ${
              clientType === "yur"
                ? "border-2 text-white"
                : `border border-[var(--theme-border)] bg-[var(--theme-background)] hover:border-[var(--theme-primary)]`
            }`}
            style={clientType === "yur" ? { background: "var(--theme-primary)", borderColor: "var(--theme-primary)" } : undefined}
          >
            <Building2 className="h-4 w-4" style={clientType === "yur" ? { color: "var(--theme-background)" } : { color: "var(--theme-primary)" }} />
            <span className={`text-xs font-black uppercase tracking-wider ${clientType === "yur" ? "text-[var(--theme-background)]" : "text-[var(--theme-foreground)]"}`}>
              Юридическое лицо
            </span>
            <span className={`text-[10px] font-semibold leading-tight ${clientType === "yur" ? "text-[var(--theme-background)]/80" : "text-[var(--theme-muted-foreground)]"}`}>
              Безналичный расчёт / счёт на оплату
            </span>
          </button>
        </div>

        {/* Инфо-плашка способа оплаты */}
        <AnimatePresence mode="wait">
          <motion.div
            key={clientType}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className={`flex items-start gap-2.5 ${shape} border border-dashed border-[var(--theme-border)] bg-[var(--theme-background)] p-3 ${isSplit ? "lg:col-start-2 lg:row-start-2" : ""}`}
          >
            {clientType === "fiz" ? (
              <Banknote className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--theme-primary)" }} />
            ) : (
              <FileText className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--theme-primary)" }} />
            )}
            <p className="text-[11px] font-medium leading-relaxed text-[var(--theme-muted-foreground)]">
              {clientType === "fiz"
                ? "Оплата производится наличными или переводом водителю при получении груза на строительном объекте."
                : "После подтверждения заказа мы выставим счёт на оплату с реквизитами организации. Отгрузка — после поступления средств."}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ---------- Поля формы ---------- */}
        <div className={`space-y-3 ${isSplit ? "lg:col-start-2 lg:row-start-3" : ""}`}>
          {/* Имя */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--theme-muted-foreground)]">
              {clientType === "fiz" ? "Ваше имя" : "Контактное лицо"}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder={clientType === "fiz" ? "Например: Иванов Иван" : "Например: Петров Пётр, снабжение"}
              className={`w-full ${inputShape} border bg-[var(--theme-background)] px-3.5 py-2.5 text-sm font-semibold text-[var(--theme-foreground)] outline-none transition-all placeholder:text-[var(--theme-muted-foreground)]/50 focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/25 ${
                touched.name && !nameValid ? "border-red-500/60" : "border-[var(--theme-border)]"
              }`}
            />
            {touched.name && !nameValid && (
              <p className="mt-1 text-[10px] font-bold text-red-500">Укажите имя (минимум 2 символа)</p>
            )}
          </div>

          {/* Телефон */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--theme-muted-foreground)]">
              Мобильный телефон
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--theme-primary)" }} />
              <input
                type="tel"
                inputMode="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(formatPhoneMask(e.target.value))}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                placeholder="+7 (999) 999-99-99"
                className={`w-full ${inputShape} border bg-[var(--theme-background)] py-2.5 pl-10 pr-3.5 text-sm font-semibold tracking-wide text-[var(--theme-foreground)] outline-none transition-all placeholder:text-[var(--theme-muted-foreground)]/50 focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/25 ${
                  touched.phone && !phoneValid ? "border-red-500/60" : "border-[var(--theme-border)]"
                }`}
              />
            </div>
            {touched.phone && !phoneValid && (
              <p className="mt-1 text-[10px] font-bold text-red-500">Введите номер полностью: +7 (999) 999-99-99</p>
            )}
          </div>

          {/* ИНН (только для юрлиц) */}
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
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--theme-muted-foreground)]">
                    ИНН организации
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={companyInn}
                      onChange={(e) => setCompanyInn(e.target.value.replace(/\D/g, "").slice(0, 12))}
                      onBlur={() => setTouched((t) => ({ ...t, inn: true }))}
                      placeholder="10 или 12 цифр"
                      className={`w-full ${inputShape} border bg-[var(--theme-background)] px-3.5 py-2.5 pr-10 text-sm font-semibold tracking-[0.15em] text-[var(--theme-foreground)] outline-none transition-all placeholder:tracking-normal placeholder:text-[var(--theme-muted-foreground)]/50 focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/25 ${
                        touched.inn && !innValid
                          ? "border-red-500/60"
                          : companyInn.length >= 10
                          ? "border-emerald-500/60"
                          : "border-[var(--theme-border)]"
                      }`}
                    />
                    {/* Индикатор валидности ИНН */}
                    {companyInn.length >= 10 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {innValid ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] font-medium text-[var(--theme-muted-foreground)]">
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

        {/* ---------- Состав заказа ---------- */}
        <div className={`${shape} ${gridLine} divide-y divide-[var(--theme-border)] ${isSplit ? "lg:col-start-1 lg:row-start-2" : ""}`}>
          <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "var(--theme-muted)" }}>
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--theme-muted-foreground)]">
              Состав заказа
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--theme-foreground)]">
              {cartItems.length} поз.
            </span>
          </div>

          {cartItems.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs font-semibold text-[var(--theme-muted-foreground)]">
              Корзина пуста — добавьте товары из каталога
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.sku} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-xs font-black text-[var(--theme-foreground)]">{item.name}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-semibold text-[var(--theme-muted-foreground)]">
                    <span className="font-mono uppercase">SKU: {item.sku}</span>
                    {item.gost && <span style={{ color: "var(--theme-primary)" }}>{item.gost}</span>}
                    <span>
                      {item.quantity} {item.unit ?? "ед."}
                    </span>
                    <span className="font-bold text-[var(--theme-foreground)]">
                      {item.weightTons.toLocaleString("ru-RU", { maximumFractionDigits: 3 })} т
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {item.lineTotal != null && (
                    <span className="text-xs font-black text-[var(--theme-foreground)]">
                      {item.lineTotal.toLocaleString("ru-RU")} ₽
                    </span>
                  )}
                  {onRemoveItem && (
                    <button
                      onClick={() => onRemoveItem(item.sku)}
                      className={`flex h-6 w-6 items-center justify-center ${shape} border border-[var(--theme-border)] text-[var(--theme-muted-foreground)] transition-colors hover:border-red-500 hover:text-red-500`}
                      aria-label={`Удалить ${item.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ---------- Итоги ---------- */}
        <div className={`${shape} ${gridLine} divide-y divide-[var(--theme-border)] ${isSplit ? "lg:col-start-1 lg:row-start-3" : ""}`}>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--theme-muted-foreground)]">
              <Scale className="h-4 w-4" style={{ color: "var(--theme-primary)" }} />
              Общий вес
            </span>
            <span className="text-base font-black text-[var(--theme-foreground)]">
              {totalWeight.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} т
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--theme-muted-foreground)]">
              <Truck className="h-4 w-4" style={{ color: "var(--theme-primary)" }} />
              Доставка
            </span>
            <span className="text-xs font-bold text-[var(--theme-muted-foreground)]">
              Рассчитает менеджер
            </span>
          </div>
          {totalPrice != null && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--theme-foreground)]">
                Итого по прайсу
              </span>
              <span className="text-lg font-black" style={{ color: "var(--theme-primary)" }}>
                {totalPrice.toLocaleString("ru-RU")} ₽
              </span>
            </div>
          )}
        </div>

        {/* Ошибка отправки */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-start gap-2 ${shape} border border-red-500/40 bg-red-500/10 p-3 ${isSplit ? "lg:col-start-2 lg:row-start-4" : ""}`}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-xs font-bold text-red-500">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- Кнопка отправки ---------- */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!formValid || submitting}
          className={`flex w-full items-center justify-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${btnShape} ${isSplit ? "lg:col-start-2 lg:row-start-5" : ""} ${
            isCity ? "shadow-[0_0_0_1px_rgba(0,0,0,0.3)]" : "shadow-lg"
          }`}
          style={{
            background: "var(--theme-primary)",
            boxShadow: isCity ? "0 0 0 1px var(--theme-border)" : undefined,
          }}
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

        <p className={`flex items-center justify-center gap-1.5 text-center text-[10px] font-semibold text-[var(--theme-muted-foreground)] ${isSplit ? "lg:col-start-2 lg:row-start-6" : ""}`}>
          <ShieldCheck className="h-3 w-3" style={{ color: "var(--theme-primary)" }} />
          Без предоплаты и онлайн-оплаты. Реквизиты защищены.
        </p>
      </div>
    </div>
  );
}
