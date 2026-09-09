"use client";

import { useState, useEffect, useRef } from "react";
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
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 24px; text-align: center; margin-bottom: 5px; }
          .sub { text-align: center; color: #666; font-size: 14px; margin-bottom: 30px; }
          .info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
          .info div { line-height: 1.8; }
          .info b { font-weight: 700; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f5f5f5; padding: 10px 8px; text-align: left; font-size: 12px; border-bottom: 2px solid #ddd; }
          td { padding: 10px 8px; border-bottom: 1px solid #eee; font-size: 13px; }
          .right { text-align: right; }
          .center { text-align: center; }
          .total-row { background: #f9f9f9; font-weight: 700; font-size: 16px; }
          .total-row td { padding: 14px 8px; border-top: 2px solid #ddd; border-bottom: none; }
          .sign { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; }
          .sign-line { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 5px; }
          .note { margin-top: 20px; font-size: 13px; color: #666; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
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
          <Button className="h-11 rounded-xl bg-primary px-6 font-black" onClick={handlePrint}>
            <Printer className="mr-2 h-5 w-5" />
            Печать / PDF
          </Button>
        </div>
      </div>

      <div ref={settingsRef} className="rounded-3xl border-2 bg-white p-10">
        <h1 style={{ fontSize: "24px", textAlign: "center", marginBottom: "5px" }}>ТОВАРНЫЙ ЧЕК № {receipt.number}</h1>
        <div style={{ textAlign: "center", color: "#666", fontSize: "14px", marginBottom: "30px" }}>
          от {new Date(receipt.createdAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "14px" }}>
          <div style={{ lineHeight: "1.8" }}>
            <b>Покупатель:</b> {receipt.customerName}<br />
            {receipt.customerPhone && <><b>Телефон:</b> {receipt.customerPhone}<br /></>}
            {receipt.customerInn && <><b>ИНН:</b> {receipt.customerInn}<br /></>}
          </div>
          <div style={{ lineHeight: "1.8", textAlign: "right" }}>
            <b>Песок-Металл</b><br />
            г. Москва<br />
            +7 (495) 000-00-00
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "12px" }}>№</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "12px" }}>Наименование</th>
              <th style={{ padding: "10px 8px", textAlign: "center", fontSize: "12px" }}>Ед.</th>
              <th style={{ padding: "10px 8px", textAlign: "right", fontSize: "12px" }}>Кол-во</th>
              <th style={{ padding: "10px 8px", textAlign: "right", fontSize: "12px" }}>Цена, ₽</th>
              <th style={{ padding: "10px 8px", textAlign: "right", fontSize: "12px" }}>Сумма, ₽</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((it, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px 8px", fontSize: "13px" }}>{i + 1}</td>
                <td style={{ padding: "10px 8px", fontSize: "13px" }}>{it.name}</td>
                <td style={{ padding: "10px 8px", fontSize: "13px", textAlign: "center" }}>{it.unit}</td>
                <td style={{ padding: "10px 8px", fontSize: "13px", textAlign: "right" }}>{it.qty}</td>
                <td style={{ padding: "10px 8px", fontSize: "13px", textAlign: "right" }}>{Number(it.price).toLocaleString("ru-RU")}</td>
                <td style={{ padding: "10px 8px", fontSize: "13px", textAlign: "right", fontWeight: 700 }}>{Number(it.total).toLocaleString("ru-RU")}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f9f9f9", borderTop: "2px solid #ddd" }}>
              <td colSpan={5} style={{ padding: "14px 8px", fontSize: "16px", textAlign: "right", fontWeight: 700 }}>Итого:</td>
              <td style={{ padding: "14px 8px", fontSize: "16px", textAlign: "right", fontWeight: 700 }}>{receipt.total.toLocaleString("ru-RU")} ₽</td>
            </tr>
          </tfoot>
        </table>

        {receipt.note && (
          <div style={{ marginTop: "20px", fontSize: "13px", color: "#666" }}>
            <b>Примечание:</b> {receipt.note}
          </div>
        )}

        <div style={{ marginTop: "50px", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
          <div>
            <div style={{ borderTop: "1px solid #333", width: "200px", textAlign: "center", paddingTop: "5px" }}>
              Подпись продавца
            </div>
          </div>
          <div>
            <div style={{ borderTop: "1px solid #333", width: "200px", textAlign: "center", paddingTop: "5px" }}>
              Подпись покупателя
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
