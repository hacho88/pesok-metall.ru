import { getStorefrontProducts } from "@/lib/theme-storefront";
import { CategoryHub } from "@/components/blocks/category-hub/CategoryHub";

/**
 * 2-Section Hybrid Category Navigation Hub:
 * 1. SECTION 1 (TOP): Premium Bento Grid for owned materials (Песок, Щебень, Керамзит).
 * 2. SECTION 2 (BOTTOM): 2-Column interactive metal categories & directory hub (25% Sidebar / 75% Filtering Canvas).
 */
export async function CategoryGrid({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const products = await getStorefrontProducts(150);

  return (
    <section id="catalog" className="w-full">
      <CategoryHub products={products} title={title} subtitle={subtitle} />
    </section>
  );
}
