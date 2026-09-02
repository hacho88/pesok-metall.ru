"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart, Phone, Mail, MapPin, Calendar, Package,
  CheckCircle, Clock, Truck, XCircle, Eye, ChevronDown,
} from "lucide-react";

interface OrderItem {
  id: string;
  productId: string | null;
  name: string;
  unit: string;
  qty: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  number: string;
  status: string;
  customerName: string;
  phone: string;
  email: string | null;
  company: string | null;
  inn: string | null;
  deliveryType: string;
  address: string | null;
  comment: string | null;
  subtotal: number;
  deliveryCost: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  geoZone?: { name: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  NEW: { label: "Новый", color: "bg-amber-100 text-amber-700", icon: Clock },
  CONFIRMED: { label: "Подтверждён", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  PAID: { label: "Оплачен", color: "bg-green-100 text-green-700", icon: CheckCircle },
  SHIPPED: { label: "Отгружен", color: "bg-blue-100 text-blue-700", icon: Truck },
  DONE: { label: "Выполнен", color: "bg-green-100 text-green-700", icon: Package },
  CANCELLED: { label: "Отменён", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const resp = await fetch("/api/atlas/admin/orders");
      if (resp.ok) {
        const data = await resp.json();
        setOrders(data.orders);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/atlas/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      loadOrders();
    } catch {}
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Заказы Atlas</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление заказами интернет-магазина</p>
        </div>
        <div className="flex gap-2">
          {["all", "NEW", "CONFIRMED", "PAID", "SHIPPED", "DONE", "CANCELLED"].map((s) => (
            <button
              key={s}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === s ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "Все" : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium">Заказов нет</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.NEW;
            const StatusIcon = statusCfg.icon;
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="bg-card rounded-xl border overflow-hidden">
                {/* Header row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${statusCfg.color}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {statusCfg.label}
                  </div>
                  <div className="font-bold">#{order.number}</div>
                  <div className="text-sm text-muted-foreground">{order.customerName}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {order.phone}
                  </div>
                  <div className="ml-auto flex items-center gap-4">
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                    </div>
                    <div className="font-bold text-lg">{order.total.toLocaleString("ru-RU")} ₽</div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t p-4 space-y-4 bg-muted/10">
                    {/* Items */}
                    <div>
                      <h4 className="text-sm font-bold mb-2">Состав заказа</h4>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-border/50">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-muted-foreground ml-2">{item.qty} {item.unit} × {item.price.toLocaleString("ru-RU")} ₽</span>
                            </div>
                            <div className="font-bold">{item.total.toLocaleString("ru-RU")} ₽</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between pt-2 font-bold">
                        <span>Итого:</span>
                        <span>{order.total.toLocaleString("ru-RU")} ₽</span>
                      </div>
                    </div>

                    {/* Customer info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <h4 className="font-bold">Покупатель</h4>
                        <div>{order.customerName}</div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3 w-3" /> {order.phone}</div>
                        {order.email && <div className="flex items-center gap-1.5 text-muted-foreground"><Mail className="h-3 w-3" /> {order.email}</div>}
                        {order.company && <div>Компания: {order.company}</div>}
                        {order.inn && <div>ИНН: {order.inn}</div>}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold">Доставка</h4>
                        <div>{order.deliveryType === "delivery" ? "Доставка" : "Самовывоз"}</div>
                        {order.address && <div className="flex items-start gap-1.5 text-muted-foreground"><MapPin className="h-3 w-3 mt-0.5" /> {order.address}</div>}
                        {order.geoZone && <div>Зона: {order.geoZone.name}</div>}
                        {order.comment && <div className="text-muted-foreground">Комментарий: {order.comment}</div>}
                      </div>
                    </div>

                    {/* Status actions */}
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-sm font-bold self-center mr-2">Изменить статус:</span>
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <button
                          key={key}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${order.status === key ? cfg.color + " border-transparent" : "border-border hover:bg-muted"}`}
                          onClick={() => updateStatus(order.id, key)}
                        >
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
