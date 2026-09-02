import { createHmac, timingSafeEqual } from "node:crypto";
import { ATLAS_PREVIEW_TTL } from "./constants";

/** Секрет для подписи токена предпросмотра */
function getPreviewSecret(): string {
  return process.env.PREVIEW_SECRET || process.env.CRON_SECRET || "atlas-preview-dev-secret";
}

/**
 * Создаёт подписанный токен предпросмотра.
 * Формат: <exp>:<hmac>
 */
export function signPreviewToken(expiresInSeconds = ATLAS_PREVIEW_TTL): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const secret = getPreviewSecret();
  const hmac = createHmac("sha256", secret).update(String(exp)).digest("hex");
  return `${exp}:${hmac}`;
}

/** Проверяет токен предпросмотра; возвращает true если валиден и не истёк */
export function verifyPreviewToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 2) return false;
  const exp = Number(parts[0]);
  const sig = parts[1];
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;

  const secret = getPreviewSecret();
  const expectedSig = createHmac("sha256", secret).update(String(exp)).digest("hex");

  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
