import { Check, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatRubles } from "@/lib/calculator";
import { productImageSrc } from "@/lib/product-image";
import type { ProductCardData } from "@/components/blocks/ProductGridCards";

function fmtKg(n: number): string {
  if (n >= 100) return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  if (n >= 10) return n.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

export function B2BProductTable({ products }: { products: ProductCardData[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/40 uppercase tracking-wider text-muted-foreground font-bold text-[10px]">
            <th className="px-4 py-4 font-bold">Фото</th>
            <th className="px-4 py-4 font-bold">Наименование</th>
            <th className="px-4 py-4 font-bold">Длина</th>
            <th className="px-4 py-4 font-bold text-right">Вес</th>
            <th className="px-4 py-4 font-bold text-right">Цена</th>
            <th className="px-4 py-4 font-bold text-right">Цена / тонна</th>
            <th className="px-4 py-4 font-bold">Статус</th>
            <th className="px-4 py-4 text-center font-bold">Заказ</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((p) => {
            const isLinear = p.unit.toLowerCase().includes("метр");
            const weightKg = Number(p.attributes.find(a => a.key === "weight_kg")?.value || p.weightKg || 0.888);
            const priceTon = isLinear && p.price ? (p.price / weightKg) * 1000 : null;
            const weightLabel =
              weightKg > 0
                ? isLinear
                  ? `${fmtKg(weightKg)} кг/м`
                  : `${fmtKg(weightKg)} кг`
                : "—";
            
            return (
              <tr key={p.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="h-12 w-12 overflow-hidden rounded-lg border bg-white">
                    <Image
                      src={productImageSrc(p.imageLocal, p.imageUrl) || "/placeholder.jpg"}
                      alt={p.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/metall/${p.id}`} className="font-bold text-foreground hover:text-primary transition-colors line-clamp-2 max-w-[240px]">
                    {p.name}
                  </Link>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground uppercase font-semibold">{p.categoryName}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {p.attributes.find(a => a.key === "length")?.value || "12м"}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground font-medium">
                  {weightLabel}
                </td>
                <td className="px-4 py-3 text-right">
                  {p.price ? (
                    <span className="font-bold text-foreground">{formatRubles(p.price)} <span className="text-[10px] font-semibold text-muted-foreground">{p.unit}</span></span>
                  ) : (
                    <span className="text-muted-foreground italic">по запросу</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {priceTon ? (
                    <span className="font-bold text-primary">{formatRubles(priceTon)}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    <Check className="h-3 w-3" />
                    В НАЛИЧИИ
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white transition-all hover:scale-110 active:scale-95 shadow-md shadow-primary/10">
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
