import OpenAI from "openai";

// DeepSeek API совместим с OpenAI SDK. Официальный эндпоинт: https://api.deepseek.com
const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const apiKey = process.env.DEEPSEEK_API_KEY || "";

export const deepseek = new OpenAI({
  baseURL,
  apiKey,
});

export const DEEPSEEK_MODELS = {
  chat: "deepseek-chat", // DeepSeek-V3
  reasoner: "deepseek-reasoner", // DeepSeek-R1 (рассуждающая модель)
} as const;

export function isDeepSeekConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

export class DeepSeekNotConfiguredError extends Error {
  constructor() {
    super(
      "DEEPSEEK_API_KEY не задан. Добавьте ключ в .env (см. .env.example), затем перезапустите сервер."
    );
    this.name = "DeepSeekNotConfiguredError";
  }
}

export function requireDeepSeek(): void {
  if (!isDeepSeekConfigured()) {
    throw new DeepSeekNotConfiguredError();
  }
}
