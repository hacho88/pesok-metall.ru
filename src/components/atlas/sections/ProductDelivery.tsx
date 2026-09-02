"use client";

import { Truck, Warehouse, CreditCard, Banknote, FileText } from "lucide-react";
import type { SectionComponentProps } from "./index";

export function ProductDelivery({ props }: SectionComponentProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--atlas-font-heading)" }}>Доставка и оплата</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="atlas-card p-4">
          <div className="flex items-center gap-2 font-semibold mb-2">
            <Truck size={20} style={{ color: "var(--atlas-primary)" }} />
            Доставка
          </div>
          <ul className="text-sm space-y-1.5" style={{ color: "var(--atlas-text-muted)" }}>
            <li>Доставка по Москве и МО в день заказа</li>
            <li>Газель, манипулятор, самосвал — подберём транспорт под объём</li>
            <li>Стоимость доставки зависит от расстояния от МКАД</li>
            <li>Возможен самовывоз со склада</li>
          </ul>
        </div>
        <div className="atlas-card p-4">
          <div className="flex items-center gap-2 font-semibold mb-2">
            <Warehouse size={20} style={{ color: "var(--atlas-primary)" }} />
            Самовывоз
          </div>
          <ul className="text-sm space-y-1.5" style={{ color: "var(--atlas-text-muted)" }}>
            <li>Склад в Москве, Пн–Сб 8:00–20:00</li>
            <li>Предварительно уточните наличие у менеджера</li>
            <li>Погрузка манипулятором или вручную</li>
          </ul>
        </div>
        <div className="atlas-card p-4 md:col-span-2">
          <div className="flex items-center gap-2 font-semibold mb-2">
            <CreditCard size={20} style={{ color: "var(--atlas-primary)" }} />
            Оплата
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2"><CreditCard size={16} /> Картой при получении</span>
            <span className="flex items-center gap-2"><Banknote size={16} /> Наличными водителю</span>
            <span className="flex items-center gap-2"><FileText size={16} /> По счёту для юрлиц</span>
          </div>
        </div>
      </div>
    </div>
  );
}
