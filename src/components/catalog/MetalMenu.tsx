import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { CategoryNode } from "./CategorySidebar";

// Горизонтальное меню категорий с современными дропдаунами
export function MetalMenu({
  categories,
  activeSlug,
}: {
  categories: CategoryNode[];
  activeSlug?: string;
}) {
  return (
    <nav className="metal-menu" aria-label="Категории металлопроката">
      <div className="metal-menu-inner">
        <ul>
          <li className={!activeSlug ? "is-active" : ""}>
            <Link href="/metall">Весь каталог</Link>
          </li>
          {categories.map((category) => {
            const isActive =
              activeSlug === category.slug ||
              category.children.some((c) => c.slug === activeSlug);
            return (
              <li key={category.id} className={isActive ? "is-active" : ""}>
                <Link href={`/metall/${category.slug}`}>
                  <span>{category.name}</span>
                  {category.children.length > 0 && (
                    <ChevronDown className="cm-chevron" aria-hidden="true" />
                  )}
                </Link>
                {category.children.length > 0 && (
                  <ul>
                    {category.children.map((child) => (
                      <li key={child.id}>
                        <Link href={`/metall/${child.slug}`}>{child.name}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
