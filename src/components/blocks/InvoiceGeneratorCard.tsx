"use client";

import { useEffect, useState } from "react";
import { Check, FileText, Phone, Plus, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRubles } from "@/lib/calculator";
import type { InvoiceGeneratorCardBlock } from "@/types/page-builder";

interface InvoiceLine {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

const COMPANY = {
  name: "ООО «ПесокМеталл»",
  inn: "7700000000",
  kpp: "770001001",
  ogrn: "1237700000000",
  address: "г. Москва, ул. Складская, д. 1, стр. 2",
  phone: "+7 (495) 000-00-00",
};

function emptyLine(id: number): InvoiceLine {
  return { id, name: "", quantity: 1, unit: "шт", price: 0 };
}

export function InvoiceGeneratorCard({
  title,
  description,
}: InvoiceGeneratorCardProps) {
  const [customer, setCustomer] = useState("");
  const [customerInn, setCustomerInn] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [leadSent, setLeadSent] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [lines, setLines] = useState<InvoiceLine[]>([emptyLine(1)]);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  useEffect(() => {
    setInvoiceNumber(
      `СЧ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
    );
  }, []);

  const total = lines.reduce((sum, l) => sum + l.quantity * l.price, 0);

  function updateLine(id: number, patch: Partial<InvoiceLine>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine(Math.max(...prev.map((l) => l.id)) + 1)]);
  }

  function removeLine(id: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }

  async function sendLead() {
    if (!customer.trim() || !customerPhone.trim() || leadSent) return;
    setLeadError(null);
    const summary = [
      `Счёт ${invoiceNumber} на сумму ${formatRubles(total)}`,
      ...lines
        .filter((l) => l.name.trim())
        .map((l) => `${l.name} — ${l.quantity} ${l.unit} × ${formatRubles(l.price)}`),
    ].join("\n");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customer.trim(),
          phone: customerPhone.trim(),
          email: null,
          source: "invoice",
          message: summary,
        }),
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      setLeadSent(true);
    } catch {
      setLeadError("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  }

  return (
    <Card id="invoice" className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Реквизиты покупателя - Упрощенная форма */}
        <div className="grid gap-6">
          <div className="space-y-3">
            <Label htmlFor="customer" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Имя или Организация</Label>
            <Input
              id="customer"
              value={customer}
              className="h-16 rounded-xl border-2 text-xl font-bold transition-all focus:border-primary focus:ring-0"
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Иван Иванов"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="customer-phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Телефон для связи</Label>
            <Input
              id="customer-phone"
              value={customerPhone}
              className="h-16 rounded-xl border-2 text-xl font-bold transition-all focus:border-primary focus:ring-0"
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+7 (___) ___-__-__"
              type="tel"
            />
          </div>
        </div>

        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="invoice-number" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Номер счёта</Label>
              <Input
                id="invoice-number"
                value={invoiceNumber}
                className="h-8 border-none bg-transparent p-0 text-sm font-bold focus:ring-0"
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1 text-right">
               <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ИНН (необязательно)</Label>
               <Input
                id="customer-inn"
                value={customerInn}
                className="h-8 border-none bg-transparent p-0 text-right text-sm font-bold focus:ring-0"
                onChange={(e) => setCustomerInn(e.target.value)}
                placeholder="7700000000"
              />
            </div>
          </div>
        </div>

        {/* Позиции */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Позиции</Label>
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus />
              Добавить
            </Button>
          </div>
          <div className="space-y-2">
            {lines.map((line) => (
              <div key={line.id} className="grid grid-cols-12 gap-2">
                <Input
                  className="col-span-5"
                  value={line.name}
                  onChange={(e) => updateLine(line.id, { name: e.target.value })}
                  placeholder="Наименование товара"
                />
                <Input
                  className="col-span-2"
                  type="number"
                  min={0}
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(line.id, { quantity: Number(e.target.value) })
                  }
                />
                <Input
                  className="col-span-2"
                  value={line.unit}
                  onChange={(e) => updateLine(line.id, { unit: e.target.value })}
                  placeholder="ед."
                />
                <Input
                  className="col-span-2"
                  type="number"
                  min={0}
                  value={line.price}
                  onChange={(e) => updateLine(line.id, { price: Number(e.target.value) })}
                  placeholder="Цена"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="col-span-1"
                  onClick={() => removeLine(line.id)}
                  disabled={lines.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Итог */}
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
          <p className="text-sm font-medium">Итого к оплате (без НДС)</p>
          <p className="text-2xl font-bold text-primary">{formatRubles(total)}</p>
        </div>

        {/* Печатная форма */}
        <div className="rounded-lg border p-5 print-area">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="font-bold">{COMPANY.name}</p>
              <p className="text-xs text-muted-foreground">
                ИНН {COMPANY.inn} · КПП {COMPANY.kpp} · ОГРН {COMPANY.ogrn}
              </p>
              <p className="text-xs text-muted-foreground">{COMPANY.address}</p>
              <p className="text-xs text-muted-foreground">{COMPANY.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">Счёт на оплату № {invoiceNumber}</p>
              <p className="text-xs text-muted-foreground">
                от {new Date().toLocaleDateString("ru-RU")}
              </p>
            </div>
          </div>
          <p className="mb-4 text-sm">
            Покупатель: <span className="font-medium">{customer || "—"}</span>
            {customerInn && <span className="text-muted-foreground"> · ИНН {customerInn}</span>}
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-2 font-medium">№</th>
                <th className="py-2 pr-2 font-medium">Наименование</th>
                <th className="py-2 pr-2 text-right font-medium">Кол-во</th>
                <th className="py-2 pr-2 text-right font-medium">Цена</th>
                <th className="py-2 text-right font-medium">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={line.id} className="border-b">
                  <td className="py-2 pr-2">{i + 1}</td>
                  <td className="py-2 pr-2">{line.name || "—"}</td>
                  <td className="py-2 pr-2 text-right">
                    {line.quantity} {line.unit}
                  </td>
                  <td className="py-2 pr-2 text-right">{formatRubles(line.price)}</td>
                  <td className="py-2 text-right">
                    {formatRubles(line.quantity * line.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-right text-lg font-bold">
            Итого: {formatRubles(total)}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button 
            className="h-14 flex-1 rounded-full text-lg font-bold transition-all hover:bg-secondary hover:text-foreground" 
            variant="outline" 
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-5 w-5" />
            Распечатать
          </Button>
          {leadSent ? (
            <div className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full border-2 border-green-500 bg-green-50 px-4 py-2 text-lg font-bold text-green-700 animate-fade-up">
              <Check className="h-6 w-6" />
              Отправлено!
            </div>
          ) : (
            <Button
              className="h-14 flex-1 rounded-full bg-primary text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={sendLead}
              disabled={!customer.trim() || !customerPhone.trim()}
            >
              <Phone className="mr-2 h-5 w-5" />
              Оформить заказ
            </Button>
          )}
        </div>
        {leadError && <p className="text-xs text-red-600">{leadError}</p>}
      </CardContent>
    </Card>
  );
}

interface InvoiceGeneratorCardProps extends InvoiceGeneratorCardBlock {}
