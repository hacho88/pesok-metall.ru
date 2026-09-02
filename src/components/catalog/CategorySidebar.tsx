import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  children: CategoryNode[];
}

// Полное число товаров в категории, включая вложенные
function displayCount(category: CategoryNode): number {
  return (
    category.productCount +
    category.children.reduce((sum, child) => sum + displayCount(child), 0)
  );
}

function totalProducts(categories: CategoryNode[]): number {
  return categories.reduce((sum, c) => sum + displayCount(c), 0);
}

export function CategorySidebar({
  categories,
  activeSlug,
}: {
  categories: CategoryNode[];
  activeSlug?: string;
}) {
  return (
    <aside className="w-full shrink-0 lg:w-64">
      <nav className="space-y-1 rounded-xl border bg-card p-3">
        <Link
          href="/metall"
          className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            !activeSlug
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <span>Весь металлопрокат</span>
          <span className="text-xs opacity-70">{totalProducts(categories)}</span>
        </Link>
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            activeSlug={activeSlug}
          />
        ))}
      </nav>
    </aside>
  );
}

function CategoryItem({
  category,
  activeSlug,
  depth = 0,
}: {
  category: CategoryNode;
  activeSlug?: string;
  depth?: number;
}) {
  const hasChildren = category.children.length > 0;
  const isActive = activeSlug === category.slug;
  const isParentOfActive = category.children.some((c) => c.slug === activeSlug);

  return (
    <div>
      <Link
        href={`/metall/${category.slug}`}
        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-muted"
        }`}
        style={{ paddingLeft: `${12 + depth * 12}px` }}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {hasChildren &&
            (isActive || isParentOfActive ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
            ))}
          <span className="truncate">{category.name}</span>
        </span>
        <span className="shrink-0 text-xs opacity-60">{displayCount(category)}</span>
      </Link>
      {hasChildren && (isActive || isParentOfActive) && (
        <div className="mt-0.5 space-y-0.5">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              activeSlug={activeSlug}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
