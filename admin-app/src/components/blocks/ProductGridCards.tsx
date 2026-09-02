import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { formatRubles } from "@/lib/calculator";
import { productImageSrc } from "@/lib/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ProductCardData {
  id: string;
  name: string;
  categoryName: string;
  type: string;
  price: number | null; // null = «под заказ»
  isOnOrder?: boolean;
  unit: string;
  attributes: { key: string; value: string }[];
  imageUrl?: string | null;
  imageLocal?: string | null;
}

export const DEMO_PRODUCTS: ProductCardData[] = [
  {
    id: "demo-1",
    name: "Арматура А500С 12 мм",
    categoryName: "Арматура",
    type: "Металлопрокат",
    price: 52,
    unit: "за метр",
    attributes: [
      { key: "Диаметр", value: "12 мм" },
      { key: "Сталь", value: "А500С" },
    ],
  },
  {
    id: "demo-2",
    name: "Труба профильная 40x20x2",
    categoryName: "Трубы",
    type: "Металлопрокат",
    price: 189,
    unit: "за метр",
    attributes: [
      { key: "Сечение", value: "40x20 мм" },
      { key: "Стенка", value: "2 мм" },
    ],
  },
  {
    id: "demo-3",
    name: "Песок мытый — мешок 30 кг",
    categoryName: "Песок",
    type: "Мешок 30 кг",
    price: 190,
    unit: "за мешок",
    attributes: [
      { key: "Фракция", value: "0.5-2.5 мм" },
      { key: "ГОСТ", value: "8736-2014" },
    ],
  },
  {
    id: "demo-4",
    name: "Песок мытый — биг-бег 1 т",
    categoryName: "Песок",
    type: "Биг-бег 1 т",
    price: 4700,
    unit: "за биг-бег",
    attributes: [
      { key: "Фракция", value: "0.5-2.5 мм" },
      { key: "Тара", value: "МКР со стропами" },
    ],
  },
  {
    id: "demo-5",
    name: "Щебень гранитный 5-20 — мешок 30 кг",
    categoryName: "Щебень",
    type: "Мешок 30 кг",
    price: 260,
    unit: "за мешок",
    attributes: [
      { key: "Фракция", value: "5-20 мм" },
      { key: "ГОСТ", value: "8267-93" },
    ],
  },
  {
    id: "demo-6",
    name: "Щебень гранитный 5-20 — биг-бег 1 т",
    categoryName: "Щебень",
    type: "Биг-бег 1 т",
    price: 6400,
    unit: "за биг-бег",
    attributes: [
      { key: "Фракция", value: "5-20 мм" },
      { key: "Тара", value: "МКР со стропами" },
    ],
  },
];

export function ProductGridCards({
  products,
  geoZoneName,
}: {
  products: ProductCardData[];
  geoZoneName?: string;
}) {
  return (
    <div className="block-grid">
      {products.map((p) => (
        <div
          key={p.id}
          className="block-card group flex flex-col overflow-hidden p-0"
        >
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-muted to-secondary/60">
            {/* Скидочный бейдж — commerce */}
            <span className="block-badge">-10%</span>
            {productImageSrc(p.imageLocal, p.imageUrl) ? (
              <Image
                src={productImageSrc(p.imageLocal, p.imageUrl)!}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="text-4xl font-black text-primary/20 transition-transform group-hover:scale-110">
                {p.categoryName.slice(0, 1)}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2.5 p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                {p.categoryName}
              </p>
              <Badge variant="secondary">{p.type}</Badge>
            </div>
            <h3 className="font-semibold leading-snug">{p.name}</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {p.attributes.slice(0, 3).map((a) => (
                <li key={a.key}>
                  {a.key}: <span className="text-foreground">{a.value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-baseline justify-between pt-2">
              {p.isOnOrder ? (
                <p className="text-sm font-semibold text-amber-600">
                  Под заказ 1-3 дня
                </p>
              ) : (
                <p className="block-price">{formatRubles(p.price!)}</p>
              )}
              <p className="text-xs text-muted-foreground">{p.unit}</p>
            </div>
            {/* Быстрая покупка — commerce */}
            <div className="block-quickbuy mt-1">
              <Button size="sm" className="w-full">
                <ShoppingCart className="h-4 w-4" />
                В корзину
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
