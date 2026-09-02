/**
 * FastCheckout — типы заказа для промышленной витрины «Песок-Металл».
 * Оплата онлайн НЕ принимается: только наличные/перевод водителю (физлица)
 * и безналичный счёт на оплату (юрлица).
 */

/** Тип покупателя */
export type ClientType = "fiz" | "yur";

/** Способ оплаты */
export type PaymentMethod = "cash_on_delivery" | "bank_wire";

/** Позиция корзины: полный трекинг SKU, размерности и пересчитанного веса */
export interface CheckoutCartItem {
  /** ID товара в БД (Product.id) */
  productId: string;
  /** SKU = slug товара (уникальный артикул) */
  sku: string;
  /** Наименование товара, например «Арматура А500С Ø12 мм» */
  name: string;
  /** ГОСТ, например «ГОСТ 34028-2016» (null — нет) */
  gost: string | null;
  /** Единица измерения цены: "м", "т", "шт", "лист", "м³" */
  unit: string | null;
  /** Количество в единицах измерения (метры, тонны, штуки, мешки) */
  quantity: number;
  /** Вес одной единицы в кг (0.888 для метра арматуры, 30 для мешка, 1000 для биг-бэга) */
  weightKg: number;
  /** Пересчитанный вес строки в тоннах = quantity * weightKg / 1000 */
  weightTons: number;
  /** Цена за единицу в рублях (null — «под заказ») */
  pricePerUnit: number | null;
  /** Стоимость строки в рублях (null — «под заказ») */
  lineTotal: number | null;
}

/** Полный payload заказа, отправляемый в /api/orders/create */
export interface CreateOrderPayload {
  clientType: ClientType;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  /** ИНН организации (10 или 12 цифр); пустая строка для физлиц */
  companyInn: string;
  /** Полный состав корзины */
  cartItems: CheckoutCartItem[];
  /** Суммарный вес заказа в тоннах (например, 7.4) */
  totalWeight: number;
}

/** Ответ API создания заказа */
export interface CreateOrderResponse {
  ok: boolean;
  id?: string;
  error?: string;
}

/** Валидация ИНН: 10 цифр (юрлицо) или 12 цифр (ИП) с контрольными суммами */
export function isValidInn(inn: string): boolean {
  const value = inn.replace(/\D/g, "");
  if (value.length === 10) {
    return checkInn10(value);
  }
  if (value.length === 12) {
    return checkInn12(value);
  }
  return false;
}

/** Контрольная сумма для 10-значного ИНН (организации) */
function checkInn10(inn: string): boolean {
  const weights = [2, 4, 10, 3, 5, 9, 4, 6, 8];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(inn[i]) * weights[i];
  const check = (sum % 11) % 10;
  return check === Number(inn[9]);
}

/** Контрольные суммы для 12-значного ИНН (ИП) */
function checkInn12(inn: string): boolean {
  const weights11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
  const weights12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
  let sum11 = 0;
  let sum12 = 0;
  for (let i = 0; i < 10; i++) sum11 += Number(inn[i]) * weights11[i];
  for (let i = 0; i < 11; i++) sum12 += Number(inn[i]) * weights12[i];
  const check11 = (sum11 % 11) % 10;
  const check12 = (sum12 % 11) % 10;
  return check11 === Number(inn[10]) && check12 === Number(inn[11]);
}

/** Маска российского телефона: +7 (999) 999-99-99 */
export function formatPhoneMask(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (!digits.startsWith("7")) digits = "7" + digits;
  digits = digits.slice(0, 11);

  let out = "+7";
  if (digits.length > 1) out += ` (${digits.slice(1, 4)}`;
  if (digits.length >= 4) out += ")";
  if (digits.length > 4) out += ` ${digits.slice(4, 7)}`;
  if (digits.length > 7) out += `-${digits.slice(7, 9)}`;
  if (digits.length > 9) out += `-${digits.slice(9, 11)}`;
  return out;
}

/** Полнота номера: ровно 11 цифр после нормализации */
export function isPhoneComplete(phone: string): boolean {
  return phone.replace(/\D/g, "").length === 11;
}
