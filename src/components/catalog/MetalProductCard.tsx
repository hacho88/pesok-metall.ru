import Image from "next/image";
import { formatRubles, formatNumber } from "@/lib/calculator";
import { productImageSrc } from "@/lib/product-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface MetalProductData {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  price: number | null; // null = «под заказ»
  isOnOrder?: boolean;
  unit?: string | null;
  weightKg: number;
  attributes: { key: string; value: string }[];
  imageUrl?: string | null;
  imageLocal?: string | null;
  inStock: boolean;
  pricePerTon?: number | null;
}

const UNIT_LABELS: Record<string, string> = {
  м: "за метр",
  т: "за тонну",
  шт: "за штуку",
  лист: "за лист",
  "м²": "за м²",
  кг: "за кг",
};

export function MetalProductCard({ product }: { product: MetalProductData }) {
  const unitLabel = product.unit ? (UNIT_LABELS[product.unit] ?? `за ${product.unit}`) : "за ед.";

  return (
    <Card className="group flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-muted to-secondary/60">
        {productImageSrc(product.imageLocal, product.imageUrl) ? (
          <Image
            src={productImageSrc(product.imageLocal, product.imageUrl)!}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 40vw, 300px"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-4xl font-black text-primary/20 transition-transform group-hover:scale-110">
            {product.categoryName.slice(0, 1)}
          </span>
        )}
        {product.isOnOrder ? (
          <Badge className="absolute left-3 top-3 bg-amber-500 text-white">
            Под заказ
          </Badge>
        ) : (
          product.inStock && (
            <Badge className="absolute left-3 top-3 bg-emerald-600 text-white">
              ✓ в наличии
            </Badge>
          )
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-xs font-medium text-muted-foreground">{product.categoryName}</p>
        <h3 className="font-semibold leading-snug">{product.name}</h3>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {product.attributes.slice(0, 3).map((a) => (
            <li key={a.key}>
              {a.key}: <span className="text-foreground">{a.value}</span>
            </li>
          ))}
          {product.weightKg > 0 && (
            <li>
              Вес: <span className="text-foreground">{formatNumber(product.weightKg, 3)} кг</span>
            </li>
          )}
        </ul>
        <div className="mt-auto space-y-2 border-t pt-3">
          {product.isOnOrder ? (
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs text-muted-foreground">Цена</p>
              <p className="text-lg font-semibold text-amber-600">Под заказ 1-3 дня</p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs text-muted-foreground">Цена {unitLabel}</p>
                <p className="text-xl font-bold text-primary">{formatRubles(product.price!)}</p>
              </div>
              {product.pricePerTon != null && product.unit !== "т" && (
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Цена за тонну</p>
                  <p className="text-sm font-medium">{formatRubles(product.pricePerTon)}</p>
                </div>
              )}
            </>
          )}
          <a
            href="tel:+74950000000"
            className="mt-1 block rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {product.isOnOrder ? "Узнать цену" : "Заказать"}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
