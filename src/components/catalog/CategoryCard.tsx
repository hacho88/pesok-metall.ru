import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Карточка категории: имя + число товаров, ведёт на страницу категории
export function CategoryCard({
  name,
  slug,
  productCount,
}: {
  name: string;
  slug: string;
  productCount: number;
}) {
  return (
    <Link
      href={`/metall/${slug}`}
      className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="min-w-0">
        <p className="truncate font-semibold leading-snug">{name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {productCount} {productCount === 1 ? "товар" : productCount < 5 ? "товара" : "товаров"}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
