import Image from "next/image";
import { formatRubles, formatNumber } from "@/lib/calculator";
import { productImageSrc } from "@/lib/product-image";
import type { MetalProductData } from "./MetalProductCard";

// Табличный вид каталога (как на city-met.ru): фото, название, длина, вес,
// цена за метр и за тонну — удобно сравнивать размеры и цены
export function MetalProductTable({ products }: { products: MetalProductData[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="p-3 font-medium">Фото</th>
            <th className="p-3 font-medium">Наименование</th>
            <th className="p-3 font-medium">Длина</th>
            <th className="p-3 font-medium">Вес</th>
            <th className="p-3 text-right font-medium">Цена</th>
            <th className="p-3 text-right font-medium">За тонну</th>
            <th className="p-3 text-right font-medium">Заказ</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const lengthAttr = p.attributes.find((a) => /длина/i.test(a.key));
            return (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gradient-to-br from-muted to-secondary/60">
                    {productImageSrc(p.imageLocal, p.imageUrl) ? (
                      <Image
                        src={productImageSrc(p.imageLocal, p.imageUrl)!}
                        alt={p.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-lg font-black text-primary/20">
                        {p.categoryName.slice(0, 1)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 font-medium leading-snug">{p.name}</td>
                <td className="whitespace-nowrap p-3 text-muted-foreground">
                  {lengthAttr?.value ?? "—"}
                </td>
                <td className="whitespace-nowrap p-3 text-muted-foreground">
                  {p.weightKg > 0 ? `${formatNumber(p.weightKg, 3)} кг` : "—"}
                </td>
                <td className="whitespace-nowrap p-3 text-right font-bold text-primary">
                  {p.isOnOrder ? (
                    <span className="font-semibold text-amber-600">Под заказ</span>
                  ) : (
                    <>
                      {formatRubles(p.price!)}
                      {p.unit ? <span className="ml-0.5 text-xs font-normal text-muted-foreground">/{p.unit}</span> : null}
                    </>
                  )}
                </td>
                <td className="whitespace-nowrap p-3 text-right text-muted-foreground">
                  {p.isOnOrder ? "—" : p.pricePerTon != null && p.unit !== "т" ? formatRubles(p.pricePerTon) : "—"}
                </td>
                <td className="p-3 text-right">
                  <a
                    href="tel:+74950000000"
                    className="inline-block rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {p.isOnOrder ? "Узнать цену" : "Заказать"}
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
