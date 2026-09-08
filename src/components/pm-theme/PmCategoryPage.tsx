import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { CartProvider } from "@/components/pm-theme/cart-context";
import { SiteShell } from "@/components/pm-theme/SiteShell";
import { ProductTable } from "@/components/pm-theme/ProductTable";
import type { Category } from "@/lib/pm-catalog";
import type { PublicSettings } from "@/lib/shop-settings";

export function PmCategoryPage({
  category,
  catalog,
  settings,
}: {
  category: Category;
  catalog: Category[];
  settings: PublicSettings;
}) {
  return (
    <CartProvider>
      <SiteShell catalog={catalog} settings={settings}>
        <div className="flex flex-col gap-6">
          <nav
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
            aria-label="Хлебные крошки"
          >
            <Link
              href="/"
              className="flex items-center gap-1 transition-colors hover:text-primary"
            >
              <Home className="size-4" />
              Главная
            </Link>
            <ChevronRight className="size-4" />
            <Link
              href="/shop"
              className="transition-colors hover:text-primary"
            >
              Каталог
            </Link>
            <ChevronRight className="size-4" />
            <span className="font-medium text-foreground">{category.title}</span>
          </nav>

          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm shadow-slate-200/50">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {category.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {category.intro}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {category.subcategories.map((sub) => (
                <span
                  key={sub}
                  className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>

          <ProductTable category={category} />
        </div>
      </SiteShell>
    </CartProvider>
  );
}
