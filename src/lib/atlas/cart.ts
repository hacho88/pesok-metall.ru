import type { AtlasProduct } from "./catalog";
import { formatRub } from "./pricing";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  unit: string | null;
  price: number; // цена за единицу
  qty: number;
  weightKg: number;
  imageLocal: string | null;
  imageUrl: string | null;
  categoryName: string;
}

export interface CartTotals {
  itemsCount: number; // число позиций
  totalQty: number; // сумма qty
  subtotal: number; // сумма товаров
  totalWeightKg: number; // общий вес
  totalWeightTons: number; // общий вес в тоннах
}

export function calcCartTotals(items: CartItem[]): CartTotals {
  let subtotal = 0;
  let totalQty = 0;
  let totalWeightKg = 0;
  for (const item of items) {
    subtotal += item.price * item.qty;
    totalQty += item.qty;
    totalWeightKg += item.weightKg * item.qty;
  }
  return {
    itemsCount: items.length,
    totalQty,
    subtotal,
    totalWeightKg,
    totalWeightTons: totalWeightKg / 1000,
  };
}

export function addToCart(items: CartItem[], product: AtlasProduct, qty: number): CartItem[] {
  const existing = items.find((i) => i.productId === product.id);
  if (existing) {
    return items.map((i) =>
      i.productId === product.id ? { ...i, qty: i.qty + qty } : i
    );
  }
  const price = product.price ?? 0;
  return [
    ...items,
    {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      unit: product.unit,
      price,
      qty,
      weightKg: product.weightKg,
      imageLocal: product.imageLocal,
      imageUrl: product.imageUrl,
      categoryName: product.categoryName,
    },
  ];
}

export function updateCartQty(items: CartItem[], productId: string, qty: number): CartItem[] {
  if (qty <= 0) return items.filter((i) => i.productId !== productId);
  return items.map((i) => (i.productId === productId ? { ...i, qty } : i));
}

export function removeFromCart(items: CartItem[], productId: string): CartItem[] {
  return items.filter((i) => i.productId !== productId);
}

export function formatCartTotal(value: number): string {
  return `${formatRub(value)} ₽`;
}
