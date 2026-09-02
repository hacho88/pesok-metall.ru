"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Check, Phone, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toZone } from "@/lib/geo-declensions";
import type { AiChatWidgetBlock } from "@/types/page-builder";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AiChatWidgetProps extends AiChatWidgetBlock {
  geoZoneName?: string;
}

export function AiChatWidget({
  title,
  placeholder = "Задайте вопрос о товарах и доставке...",
  geoZoneName,
}: AiChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Здравствуйте! Я ИИ-менеджер pesok-metall.ru${
        geoZoneName ? `, отвечаю по доставке в ${toZone(geoZoneName)}` : ""
      }. Подскажу цены, наличие, тару и машину под ваш заказ.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSent, setLeadSent] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, geoZoneName }),
      });
      const data = await response.json();
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...history,
        {
          role: "assistant",
          content: "Не удалось получить ответ. Проверьте подключение и попробуйте ещё раз.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendLead() {
    if (!leadName.trim() || !leadPhone.trim() || leadSent) return;
    setLeadError(null);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName.trim(),
          phone: leadPhone.trim(),
          source: "chat",
          message: messages.filter((m) => m.role === "user").at(-1)?.content ?? null,
        }),
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      setLeadSent(true);
    } catch {
      setLeadError("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Bot className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>
          DeepSeek-V3 отвечает на вопросы о товарах, таре и доставке.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex max-h-80 min-h-64 flex-col gap-3 overflow-y-auto rounded-lg border bg-muted/30 p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-2",
                m.role === "user" && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  m.role === "assistant"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {m.role === "assistant" ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  m.role === "assistant"
                    ? "bg-background text-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bot className="h-4 w-4 animate-pulse" />
              ИИ-менеджер печатает...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={placeholder}
            disabled={loading}
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            <Send />
          </Button>
        </div>

        {/* Заявка на обратный звонок */}
        <div className="rounded-lg border bg-muted/30 p-4">
          {leadSent ? (
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <Check className="h-4 w-4" />
              Заявка отправлена! Менеджер свяжется с вами в ближайшее время.
            </div>
          ) : (
            <>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <Phone className="h-4 w-4 text-primary" />
                Заказать обратный звонок
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Ваше имя"
                  className="sm:w-1/3"
                />
                <Input
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  className="sm:w-1/3"
                />
                <Button
                  variant="secondary"
                  onClick={sendLead}
                  disabled={!leadName.trim() || !leadPhone.trim()}
                >
                  Отправить
                </Button>
              </div>
              {leadError && <p className="mt-2 text-xs text-red-600">{leadError}</p>}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
