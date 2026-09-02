/**
 * Отличает реальное фото товара от заглушки «нет фото» с сайта-донора.
 * Внешний каталог отдаёт no_photo.png (110×110, ~999 байт) — такие товары
 * показываем с буквой-заглушкой категории, а не с пустой картинкой.
 */
export function hasProductImage(
  imageLocal?: string | null,
  imageUrl?: string | null
): boolean {
  if (!imageLocal && !imageUrl) return false;
  const src = imageLocal ?? imageUrl!;
  if (/no_photo/i.test(src)) return false;
  return true;
}

/** Возвращает src фото, если оно реальное, иначе null */
export function productImageSrc(
  imageLocal?: string | null,
  imageUrl?: string | null
): string | null {
  if (!hasProductImage(imageLocal, imageUrl)) return null;
  return imageLocal ?? imageUrl!;
}
