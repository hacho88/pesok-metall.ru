"use client";

import { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import {
  Plus,
  Trash2,
  Search,
  Save,
  Printer,
  ArrowLeft,
  Receipt as ReceiptIcon,
  Loader2,
  CheckCircle2,
  X,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReceiptItem {
  name: string;
  unit: string;
  qty: number;
  price: number;
  total: number;
}

interface Receipt {
  id: string;
  number: string;
  customerName: string;
  customerPhone: string | null;
  customerInn: string | null;
  items: ReceiptItem[];
  total: number;
  note: string | null;
  createdAt: string;
}

interface ProductSearchResult {
  id: string;
  name: string;
  unit: string | null;
  priceRetailBase: string | null;
}

// Сумма прописью (рубли)
function sumToWords(n: number): string {
  const ones = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять",
    "десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать",
    "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];
  const tens = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
  const hundreds = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];
  const rub = ["рубль", "рубля", "рублей"];
  const ths = ["тысяча", "тысячи", "тысяч"];
  const mln = ["миллион", "миллиона", "миллионов"];

  const morph = (n: number, forms: string[]) => {
    const m = n % 100;
    if (m > 10 && m < 20) return forms[2];
    const d = m % 10;
    if (d === 1) return forms[0];
    if (d >= 2 && d <= 4) return forms[1];
    return forms[2];
  };

  const tri = (n: number, feminine: boolean): string => {
    const parts: string[] = [];
    const h = Math.floor(n / 100);
    const rest = n % 100;
    if (h) parts.push(hundreds[h]);
    if (rest >= 20) {
      parts.push(tens[Math.floor(rest / 10)]);
      const o = rest % 10;
      if (o) parts.push(feminine && o === 1 ? "одна" : feminine && o === 2 ? "две" : ones[o]);
    } else if (rest > 0) {
      if (feminine && rest === 1) parts.push("одна");
      else if (feminine && rest === 2) parts.push("две");
      else parts.push(ones[rest]);
    }
    return parts.join(" ");
  };

  const rubles = Math.floor(Math.abs(n));
  const kopecks = Math.round((Math.abs(n) - rubles) * 100);
  if (rubles === 0) return `Ноль ${rub[2]} ${String(kopecks).padStart(2, "0")} коп.`;

  const parts: string[] = [];
  const m = Math.floor(rubles / 1_000_000);
  const t = Math.floor((rubles % 1_000_000) / 1000);
  const r = rubles % 1000;
  if (m) parts.push(`${tri(m, false)} ${morph(m, mln)}`);
  if (t) parts.push(`${tri(t, true)} ${morph(t, ths)}`);
  if (r) parts.push(tri(r, false));
  const words = parts.join(" ");
  const cap = words.charAt(0).toUpperCase() + words.slice(1);
  return `${cap} ${morph(rubles, rub)} ${String(kopecks).padStart(2, "0")} коп.`;
}

export function ReceiptManager() {
  const [view, setView] = useState<"list" | "edit" | "print">("list");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<Receipt | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerInn, setCustomerInn] = useState("");
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Product search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/receipts");
      const data = await res.json();
      setReceipts(data.receipts || []);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = (query: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/products?search=${encodeURIComponent(query)}&limit=10`);
        const data = await res.json();
        setSearchResults(data.products || []);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const addProductItem = (p: ProductSearchResult) => {
    const price = p.priceRetailBase ? Number(p.priceRetailBase) : 0;
    setItems((prev) => [
      ...prev,
      {
        name: p.name,
        unit: p.unit || "шт",
        qty: 1,
        price,
        total: price,
      },
    ]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const addManualItem = () => {
    setItems((prev) => [...prev, { name: "", unit: "шт", qty: 1, price: 0, total: 0 }]);
  };

  const updateItem = (index: number, patch: Partial<ReceiptItem>) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        const updated = { ...it, ...patch };
        updated.total = Number(updated.qty) * Number(updated.price);
        return updated;
      })
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalSum = items.reduce((sum, it) => sum + (Number(it.qty) * Number(it.price) || 0), 0);

  const handleSave = async () => {
    if (!customerName || items.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        customerName,
        customerPhone,
        customerInn,
        items: items.map((it) => ({
          name: it.name,
          unit: it.unit,
          qty: Number(it.qty),
          price: Number(it.price),
          total: Number(it.qty) * Number(it.price),
        })),
        note,
      };

      const url = editId ? `/api/admin/receipts/${editId}` : "/api/admin/receipts";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.receipt) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        await loadReceipts();
        setCurrent(data.receipt);
        setView("print");
      }
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => {
    setEditId(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerInn("");
    setItems([]);
    setNote("");
    setCurrent(null);
    setView("edit");
  };

  const openEdit = (r: Receipt) => {
    setEditId(r.id);
    setCustomerName(r.customerName);
    setCustomerPhone(r.customerPhone || "");
    setCustomerInn(r.customerInn || "");
    setItems(r.items);
    setNote(r.note || "");
    setCurrent(r);
    setView("edit");
  };

  const openPrint = (r: Receipt) => {
    setCurrent(r);
    setView("print");
  };

  const deleteReceipt = async (id: string) => {
    if (!confirm("Удалить чек?")) return;
    await fetch(`/api/admin/receipts/${id}`, { method: "DELETE" });
    await loadReceipts();
  };

  // === LIST VIEW ===
  if (view === "list") {
    return (
      <div className="space-y-6 font-jakarta">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight uppercase">
              <ReceiptIcon className="h-8 w-8 text-primary" />
              Товарные чеки
            </h1>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Создание и печать товарных чеков
            </p>
          </div>
          <Button className="h-12 rounded-xl bg-primary px-6 font-black shadow-lg shadow-primary/20" onClick={openNew}>
            <Plus className="mr-2 h-5 w-5" />
            НОВЫЙ ЧЕК
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : receipts.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-muted-foreground/20 py-20 text-center">
            <ReceiptIcon className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Чеков пока нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {receipts.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-2xl border-2 bg-card p-5 transition-colors hover:bg-muted/20"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">{r.number}</span>
                    <p className="truncate font-bold">{r.customerName}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {" · "}
                    {r.items.length} поз.
                    {" · "}
                    <span className="font-bold text-foreground">{r.total.toLocaleString("ru-RU")} ₽</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => openPrint(r)}>
                    <Printer className="mr-1.5 h-4 w-4" />
                    Печать
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => openEdit(r)}>
                    Изменить
                  </Button>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                    onClick={() => deleteReceipt(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // === EDIT VIEW ===
  if (view === "edit") {
    return (
      <div className="space-y-6 font-jakarta">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 hover:bg-muted"
              onClick={() => setView("list")}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-black tracking-tight uppercase">
              {editId ? "Редактировать чек" : "Новый чек"}
            </h1>
          </div>
          <Button
            className="h-12 rounded-xl bg-primary px-6 font-black shadow-lg shadow-primary/20"
            onClick={handleSave}
            disabled={saving || !customerName || items.length === 0}
          >
            {saved ? <CheckCircle2 className="mr-2 h-5 w-5" /> : saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {saved ? "СОХРАНЕНО" : saving ? "СОХРАНЕНИЕ…" : "СОХРАНИТЬ"}
          </Button>
        </div>

        {/* Customer info */}
        <div className="rounded-3xl border-2 bg-card p-5">
          <h2 className="mb-4 text-sm font-black uppercase tracking-widest">Покупатель</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">ФИО / Компания</Label>
              <Input
                className="h-11 rounded-xl border-2 font-bold"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Иванов И.И. или ООО Строй"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Телефон</Label>
              <Input
                className="h-11 rounded-xl border-2 font-bold"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+7 (999) 999-99-99"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">ИНН</Label>
              <Input
                className="h-11 rounded-xl border-2 font-bold"
                value={customerInn}
                onChange={(e) => setCustomerInn(e.target.value)}
                placeholder="7701234567"
              />
            </div>
          </div>
        </div>

        {/* Product search */}
        <div className="rounded-3xl border-2 bg-card p-5">
          <h2 className="mb-4 text-sm font-black uppercase tracking-widest">Добавить товар</h2>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                className="h-12 rounded-xl border-2 pl-10 font-bold"
                placeholder="Поиск по каталогу (минимум 2 символа)…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchProducts(e.target.value);
                }}
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border-2 bg-card shadow-xl">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-primary/5"
                    onClick={() => addProductItem(p)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.unit || "шт"}</p>
                    </div>
                    <span className="shrink-0 pl-3 text-sm font-black text-primary">
                      {p.priceRetailBase ? `${Number(p.priceRetailBase).toLocaleString("ru-RU")} ₽` : "под заказ"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="mt-3 text-xs font-black uppercase tracking-widest text-primary hover:underline"
            onClick={addManualItem}
          >
            + Добавить произвольную позицию
          </button>
        </div>

        {/* Items table */}
        {items.length > 0 && (
          <div className="rounded-3xl border-2 bg-card p-5">
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest">Позиции чека</h2>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_80px_100px_100px_40px] items-center gap-2 rounded-xl border bg-muted/20 p-2">
                  <Input
                    className="h-10 rounded-lg border-2 text-sm font-bold"
                    value={it.name}
                    onChange={(e) => updateItem(i, { name: e.target.value })}
                    placeholder="Наименование"
                  />
                  <Input
                    className="h-10 rounded-lg border-2 text-center text-sm"
                    value={it.unit}
                    onChange={(e) => updateItem(i, { unit: e.target.value })}
                    placeholder="ед."
                  />
                  <Input
                    className="h-10 rounded-lg border-2 text-center text-sm"
                    type="number"
                    value={it.qty}
                    onChange={(e) => updateItem(i, { qty: Number(e.target.value) })}
                    placeholder="кол-во"
                  />
                  <Input
                    className="h-10 rounded-lg border-2 text-center text-sm"
                    type="number"
                    value={it.price}
                    onChange={(e) => updateItem(i, { price: Number(e.target.value) })}
                    placeholder="цена"
                  />
                  <span className="text-right text-sm font-black">
                    {(Number(it.qty) * Number(it.price)).toLocaleString("ru-RU")} ₽
                  </span>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                    onClick={() => removeItem(i)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-primary/5 p-4">
              <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">Итого:</span>
              <span className="text-2xl font-black text-primary">{totalSum.toLocaleString("ru-RU")} ₽</span>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="rounded-3xl border-2 bg-card p-5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Примечание</Label>
          <Textarea
            className="mt-2 min-h-16 rounded-xl border-2 text-sm"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Дополнительная информация для чека…"
          />
        </div>
      </div>
    );
  }

  // === PRINT VIEW ===
  if (view === "print" && current) {
    return <ReceiptPrint receipt={current} onBack={() => setView("list")} onEdit={() => openEdit(current)} />;
  }

  return null;
}

// === PRINT COMPONENT ===
function ReceiptPrint({ receipt, onBack, onEdit }: { receipt: Receipt; onBack: () => void; onEdit: () => void }) {
  const settingsRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const handlePrint = () => {
    const content = settingsRef.current?.innerHTML;
    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="utf-8">
        <title>Товарный чек ${receipt.number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; color: #000; padding: 30px; max-width: 800px; margin: 0 auto; font-size: 13px; }
          table { border-collapse: collapse; }
          @media print { body { padding: 15px; } }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const handleDownloadPdf = async () => {
    if (!settingsRef.current) return;
    setGenerating(true);
    try {
      const element = settingsRef.current;
      const opt = {
        margin: 10,
        filename: `чек-${receipt.number}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      };
      await html2pdf().set(opt).from(element).save();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 font-jakarta">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 hover:bg-muted"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-black tracking-tight uppercase">Чек {receipt.number}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-11 rounded-xl font-bold" onClick={onEdit}>
            Изменить
          </Button>
          <Button variant="outline" className="h-11 rounded-xl font-bold" onClick={handleDownloadPdf} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
            {generating ? "ГЕНЕРАЦИЯ…" : "Скачать PDF"}
          </Button>
          <Button className="h-11 rounded-xl bg-primary px-6 font-black" onClick={handlePrint}>
            <Printer className="mr-2 h-5 w-5" />
            Печать
          </Button>
        </div>
      </div>

      <div ref={settingsRef} className="rounded-3xl border-2 bg-white p-10" style={{ fontFamily: "'Times New Roman', serif" }}>
        {/* Шапка */}
        <table style={{ width: "100%", marginBottom: "4px" }}>
          <tbody>
            <tr>
              <td style={{ fontSize: "13px", verticalAlign: "bottom" }}>
                ТОВАРНЫЙ ЧЕК № <b>{receipt.number}</b>
              </td>
              <td style={{ fontSize: "13px", textAlign: "right", verticalAlign: "bottom" }}>
                от «{new Date(receipt.createdAt).getDate()}» {new Date(receipt.createdAt).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ borderBottom: "2px solid #000", marginBottom: "16px" }} />

        {/* Продавец / Покупатель */}
        <table style={{ width: "100%", fontSize: "13px", marginBottom: "16px", lineHeight: "1.6" }}>
          <tbody>
            <tr>
              <td style={{ width: "90px", fontWeight: 700, verticalAlign: "top" }}>Продавец:</td>
              <td style={{ borderBottom: "1px solid #999" }}>
                ИП / ООО «Песок-Металл», г. Москва, тел. +7 (495) 000-00-00
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700, verticalAlign: "top" }}>Покупатель:</td>
              <td style={{ borderBottom: "1px solid #999" }}>
                {receipt.customerName}
                {receipt.customerInn ? `, ИНН ${receipt.customerInn}` : ""}
                {receipt.customerPhone ? `, тел. ${receipt.customerPhone}` : ""}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Таблица позиций */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", fontSize: "13px" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #000", padding: "6px 8px", fontSize: "12px", width: "36px" }}>№</th>
              <th style={{ border: "1px solid #000", padding: "6px 8px", fontSize: "12px", textAlign: "left" }}>Наименование товара</th>
              <th style={{ border: "1px solid #000", padding: "6px 8px", fontSize: "12px", width: "56px" }}>Ед. изм.</th>
              <th style={{ border: "1px solid #000", padding: "6px 8px", fontSize: "12px", width: "70px" }}>Кол-во</th>
              <th style={{ border: "1px solid #000", padding: "6px 8px", fontSize: "12px", width: "90px" }}>Цена, руб.</th>
              <th style={{ border: "1px solid #000", padding: "6px 8px", fontSize: "12px", width: "100px" }}>Сумма, руб.</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((it, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #000", padding: "6px 8px", textAlign: "center" }}>{i + 1}</td>
                <td style={{ border: "1px solid #000", padding: "6px 8px" }}>{it.name}</td>
                <td style={{ border: "1px solid #000", padding: "6px 8px", textAlign: "center" }}>{it.unit}</td>
                <td style={{ border: "1px solid #000", padding: "6px 8px", textAlign: "right" }}>{it.qty}</td>
                <td style={{ border: "1px solid #000", padding: "6px 8px", textAlign: "right" }}>{Number(it.price).toLocaleString("ru-RU", { minimumFractionDigits: 2 })}</td>
                <td style={{ border: "1px solid #000", padding: "6px 8px", textAlign: "right" }}>{Number(it.total).toLocaleString("ru-RU", { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={5} style={{ border: "1px solid #000", padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>Итого:</td>
              <td style={{ border: "1px solid #000", padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>
                {receipt.total.toLocaleString("ru-RU", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Сумма прописью */}
        <div style={{ fontSize: "13px", marginBottom: "6px" }}>
          Всего наименований {receipt.items.length}, на сумму {receipt.total.toLocaleString("ru-RU", { minimumFractionDigits: 2 })} руб.
        </div>
        <div style={{ fontSize: "13px", fontWeight: 700, borderBottom: "1px solid #999", paddingBottom: "2px", marginBottom: "24px" }}>
          {sumToWords(receipt.total)}
        </div>

        {receipt.note && (
          <div style={{ fontSize: "12px", color: "#444", marginBottom: "16px" }}>
            <b>Примечание:</b> {receipt.note}
          </div>
        )}

        {/* Подписи */}
        <table style={{ width: "100%", fontSize: "13px", marginTop: "30px" }}>
          <tbody>
            <tr>
              <td style={{ width: "50%" }}>
                Отпустил _________________ / _________________ /
                <div style={{ fontSize: "10px", color: "#666", marginTop: "2px", paddingLeft: "80px" }}>
                  подпись&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;расшифровка
                </div>
              </td>
              <td style={{ width: "50%", paddingLeft: "40px" }}>
                Получил _________________ / _________________ /
                <div style={{ fontSize: "10px", color: "#666", marginTop: "2px", paddingLeft: "80px" }}>
                  подпись&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;расшифровка
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: "13px", marginTop: "20px" }}>М.П.</div>
      </div>
    </div>
  );
}
