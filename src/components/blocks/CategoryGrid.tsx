import { CategoryHub } from "@/components/blocks/category-hub/CategoryHub";

/**
 * 2-Section Hybrid Category Navigation Hub:
 * 1. SECTION 1 (TOP): Premium Bento Grid for owned materials (Песок, Щебень, Керамзит).
 * 2. SECTION 2 (BOTTOM): Inline catalog menu with sections (Песок и щебень / Металлопрокат).
 */
export async function CategoryGrid({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section id="catalog" className="w-full">
      <CategoryHub title={title} subtitle={subtitle} />
    </section>
  );
}
