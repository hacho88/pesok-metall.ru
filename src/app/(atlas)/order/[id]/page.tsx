import type { Metadata } from "next";
import { getPublishedConfig, getDraftConfig } from "@/lib/atlas/config-store";
import { getAtlasCategoryTree } from "@/lib/atlas/catalog";
import { getAtlasZones, getCurrentZone, isPreviewMode } from "@/lib/atlas/server";
import { AtlasTokensProvider } from "@/components/atlas/tokens/AtlasTokensProvider";
import { AtlasChrome } from "@/components/atlas/chrome/AtlasChrome";
import { prisma } from "@/lib/prisma";
import { formatRub } from "@/lib/atlas/pricing";
import { CheckCircle, Clock, Truck, Package, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Статус заказа | pesok-metall.ru",
};

const STATUS_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  NEW: { label: "Новый заказ", icon: Clock, color: "var(--atlas-warning)" },
  CONFIRMED: { label: "Подтверждён", icon: CheckCircle, color: "var(--atlas-primary)" },
  PAID: { label: "Оплачен", icon: CheckCircle, color: "var(--atlas-success)" },
  SHIPPED: { label: "Отгружен", icon: Truck, color: "var(--atlas-primary)" },
  DONE: { label: "Выполнен", icon: Package, color: "var(--atlas-success)" },
  CANCELLED: { label: "Отменён", icon: XCircle, color: "var(--atlas-danger)" },
};

export default async function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const preview = await isPreviewMode();
  const config = preview ? await getDraftConfig() : await getPublishedConfig();
  const [tree, zones, currentZone, order] = await Promise.all([
    getAtlasCategoryTree(),
    getAtlasZones(),
    getCurrentZone(),
    prisma.atlasOrder.findUnique({
      where: { id },
      include: { items: true, geoZone: true },
    }),
  ]);

  if (!order) {
    return (
      <AtlasTokensProvider tokens={config.tokens}>
        <AtlasChrome config={config} tree={tree} zones={zones} currentZone={currentZone} isPreview={preview} sidebar={false}>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-2">Заказ не найден</h1>
            <a href="/shop" className="atlas-btn atlas-btn-primary mt-4">В каталог</a>
          </div>
        </AtlasChrome>
      </AtlasTokensProvider>
    );
  }

  const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.NEW;
  const StatusIcon = statusInfo.icon;

  return (
    <AtlasTokensProvider tokens={config.tokens}>
      <AtlasChrome config={config} tree={tree} zones={zones} currentZone={currentZone} isPreview={preview} sidebar={false}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: `color-mix(in srgb, ${statusInfo.color} 12%, transparent)` }}>
              <StatusIcon size={32} style={{ color: statusInfo.color }} />
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--atlas-font-heading)" }}>
              Заказ #{order.number}
            </h1>
            <p className="text-sm" style={{ color: "var(--atlas-text-muted)" }}>
              {statusInfo.label} · от {new Date(order.createdAt).toLocaleDateString("ru-RU")}
            </p>
          </div>

          <div className="atlas-card p-5 mb-4">
            <h2 className="font-bold mb-3">Состав заказа</h2>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-2" style={{ borderBottom: "1px solid var(--atlas-border)" }}>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>
                      {item.qty} {item.unit} × {formatRub(item.price)} ₽
                    </div>
                  </div>
                  <div className="font-bold">{formatRub(item.total)} ₽</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-3 mt-2 font-bold text-lg" style={{ borderTop: "2px solid var(--atlas-border)" }}>
              <span>Итого:</span>
              <span style={{ color: "var(--atlas-primary)" }}>{formatRub(order.total)} ₽</span>
            </div>
          </div>

          <div className="atlas-card p-5">
            <h2 className="font-bold mb-3">Информация о доставке</h2>
            <div className="text-sm space-y-1">
              <div><span style={{ color: "var(--atlas-text-muted)" }}>Получатель:</span> {order.customerName}</div>
              <div><span style={{ color: "var(--atlas-text-muted)" }}>Телефон:</span> {order.phone}</div>
              {order.email && <div><span style={{ color: "var(--atlas-text-muted)" }}>Email:</span> {order.email}</div>}
              {order.address && <div><span style={{ color: "var(--atlas-text-muted)" }}>Адрес:</span> {order.address}</div>}
              {order.geoZone && <div><span style={{ color: "var(--atlas-text-muted)" }}>Зона:</span> {order.geoZone.name}</div>}
              {order.comment && <div><span style={{ color: "var(--atlas-text-muted)" }}>Комментарий:</span> {order.comment}</div>}
            </div>
          </div>
        </div>
      </AtlasChrome>
    </AtlasTokensProvider>
  );
}
