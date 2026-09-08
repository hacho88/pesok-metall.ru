"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, CheckCircle2, Loader2, Save, Send, XCircle } from "lucide-react";

export interface ChannelsSettings {
  maxBotToken: string | null;
  maxChatId: string | null;
  notifyEmail: string | null;
  smtpHost: string | null;
  smtpPort: string;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpFrom: string | null;
}

const inputCls = "h-11 rounded-xl border-2 font-bold";
const labelCls = "text-[10px] font-black uppercase tracking-widest text-muted-foreground/60";

function StatusRow({ label, value, error }: { label: string; value: boolean | string | undefined; error?: string }) {
  const ok = value === true;
  const notConfigured = value === "not_configured";
  return (
    <div className="flex items-center gap-2 text-xs font-bold">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : notConfigured ? (
        <XCircle className="h-4 w-4 text-muted-foreground/40" />
      ) : (
        <XCircle className="h-4 w-4 text-red-600" />
      )}
      <span>{label}:</span>
      <span className={ok ? "text-green-600" : notConfigured ? "text-muted-foreground/60" : "text-red-600"}>
        {ok ? "отправлено ✓" : notConfigured ? "не настроено" : value === false ? `ошибка${error ? `: ${error}` : ""}` : String(value ?? "—")}
      </span>
    </div>
  );
}

export function ChannelsConnect({ initial }: { initial: ChannelsSettings }) {
  const [form, setForm] = useState<ChannelsSettings>(initial);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          smtpPort: form.smtpPort ? Number(form.smtpPort) : null,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/notify-test", { method: "POST" });
      setTestResult(await res.json());
    } catch {
      setTestResult({ error: "Ошибка сети" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* MAX — инструкция + API */}
      <div className="space-y-4">
        <div className="rounded-3xl border-2 border-primary/20 bg-primary/5 p-6">
          <p className="text-xs font-black uppercase tracking-widest text-primary">Как подключить мессенджер MAX</p>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/90">
            <li><b>1.</b> Откройте MAX и найдите официального бота <b>@masterbot</b>.</li>
            <li><b>2.</b> Создайте бота («Создать бота»), придумайте имя и скопируйте <b>токен</b>.</li>
            <li><b>3.</b> Вставьте токен в поле «Токен бота MAX» ниже и нажмите «Сохранить».</li>
            <li><b>4.</b> Напишите вашему боту любое сообщение в MAX (это откроет диалог).</li>
            <li><b>5.</b> Нажмите «Проверить» — система найдёт <b>Chat ID</b> автоматически.</li>
            <li><b>6.</b> Вставьте Chat ID в поле, сохраните — заказы начнут приходить в MAX.</li>
          </ol>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={labelCls}>API: токен бота MAX</Label>
              <Input
                className={inputCls}
                type="password"
                value={form.maxBotToken ?? ""}
                placeholder="Токен от @masterbot"
                onChange={(e) => setForm({ ...form, maxBotToken: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>API: Chat ID</Label>
              <Input
                className={inputCls}
                value={form.maxChatId ?? ""}
                placeholder="Появится после «Проверить»"
                onChange={(e) => setForm({ ...form, maxChatId: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Email — инструкция + SMTP */}
        <div className="rounded-3xl border-2 p-6">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Электронная почта (SMTP)</p>
          <ol className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground">
            <li><b>1.</b> Заведите ящик для заказов (например, на Яндексе).</li>
            <li><b>2.</b> Включите «пароль приложения» в настройках почты.</li>
            <li><b>3.</b> Заполните поля ниже и сохраните.</li>
          </ol>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={labelCls}>Email для заказов</Label>
              <Input className={inputCls} value={form.notifyEmail ?? ""} placeholder="zakazy@pesok-metall.ru" onChange={(e) => setForm({ ...form, notifyEmail: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>SMTP-сервер</Label>
              <Input className={inputCls} value={form.smtpHost ?? ""} placeholder="smtp.yandex.ru" onChange={(e) => setForm({ ...form, smtpHost: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Порт</Label>
              <Input className={inputCls} value={form.smtpPort} placeholder="465" onChange={(e) => setForm({ ...form, smtpPort: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Логин</Label>
              <Input className={inputCls} value={form.smtpUser ?? ""} placeholder="zakazy@…" onChange={(e) => setForm({ ...form, smtpUser: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Пароль приложения</Label>
              <Input className={inputCls} type="password" value={form.smtpPass ?? ""} onChange={(e) => setForm({ ...form, smtpPass: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Отправитель</Label>
              <Input className={inputCls} value={form.smtpFrom ?? ""} placeholder="Песок-Металл <zakazy@…>" onChange={(e) => setForm({ ...form, smtpFrom: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="h-11 rounded-xl bg-primary px-6 font-black shadow-lg shadow-primary/20"
            onClick={async () => {
              setSaving(true);
              try {
                const res = await fetch("/api/admin/settings", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...form, smtpPort: form.smtpPort ? Number(form.smtpPort) : null }),
                });
                if (res.ok) {
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2500);
                }
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
          >
            {saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saved ? "СОХРАНЕНО" : saving ? "СОХРАНЕНИЕ…" : "СОХРАНИТЬ"}
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-xl border-2 font-black"
            onClick={async () => {
              setTesting(true);
              setTestResult(null);
              try {
                const res = await fetch("/api/admin/notify-test", { method: "POST" });
                setTestResult(await res.json());
              } catch {
                setTestResult({ error: "Ошибка сети" });
              } finally {
                setTesting(false);
              }
            }}
            disabled={testing}
          >
            {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            ПРОВЕРИТЬ
          </Button>
        </div>

        {testResult && (
          <div className="space-y-1.5 rounded-2xl border-2 p-4">
            <StatusRow label="MAX" value={testResult.max} />
            <StatusRow label="Telegram" value={testResult.telegram} />
            <StatusRow label="Email" value={testResult.email} error={testResult.emailError} />
            {testResult.maxError && (
              <p className="pt-1 text-xs font-bold text-red-600">{testResult.maxError}</p>
            )}
            {testResult.foundChatIds && (
              <p className="pt-1 text-xs font-bold text-primary">
                Найдены Chat ID в MAX: {testResult.foundChatIds.join(", ")} — скопируйте в поле выше и сохраните
              </p>
            )}
          </div>
        )}
      </div>

      {/* Что куда приходит */}
      <div className="space-y-4">
        <div className="rounded-3xl border-2 p-6">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <p className="text-xs font-black uppercase tracking-widest">Что приходит после подключения</p>
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>• <b className="text-foreground">Новый заказ</b> — номер, клиент, телефон, состав, сумма, доставка и комментарий.</li>
            <li>• <b className="text-foreground">Счёт на оплату</b> (безнал) — клиенту в MAX или на email.</li>
            <li>• Сообщение приходит <b className="text-foreground">сразу после оформления</b> — даже если клиент закрыл сайт.</li>
          </ul>
        </div>
        <div className="rounded-3xl border-2 border-dashed p-6">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Частые вопросы</p>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>• <b className="text-foreground">Пишет «ошибка»?</b> Проверьте токен и что вы написали боту в MAX.</li>
            <li>• <b className="text-foreground">Email не приходит?</b> Для Яндекса нужен «пароль приложения», а не обычный пароль. Порт 465.</li>
            <li>• Настройки также доступны в разделе <b className="text-foreground">Интерфейс → Уведомления о заказах</b> — они общие.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
