import { prisma } from "@/lib/prisma";
import { ShoppingCart } from "lucide-react";
import { OrdersManager } from "./OrdersManager";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.atlasOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true, geoZone: { select: { name: true } } },
  });

  const newCount = await prisma.atlasOrder.count({ where: { status: "NEW" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-black tracking-tight">Заказы</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {newCount > 0 ? `${newCount} новых` : "Нет новых"} · всего {orders.length}
          </p>
        </div>
      </div>

      <OrdersManager
        initialOrders={orders.map((o) => ({
          ...o,
          lat: o.lat ? Number(o.lat) : null,
          lng: o.lng ? Number(o.lng) : null,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        }))}
        initialNewCount={newCount}
      />
    </div>
  );
}
