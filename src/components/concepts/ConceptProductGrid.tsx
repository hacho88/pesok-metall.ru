import type { ProductCardData } from "@/components/blocks/ProductGridCards";
import type { ThemeConcept } from "@/lib/theme-concepts";
import { SilkProductGrid } from "./SilkProductGrid";
import { BentoProductGrid } from "./BentoProductGrid";
import { EditorialProductGrid } from "./EditorialProductGrid";
import { HyperProductGrid } from "./HyperProductGrid";
import { ViProductGrid } from "./ViProductGrid";
import { ArenaProductGrid } from "./ArenaProductGrid";

/** Диспетчер: рендерит грид товаров по активной концепции темы */
export function ConceptProductGrid({
  concept,
  products,
}: {
  concept: ThemeConcept;
  products: ProductCardData[];
}) {
  switch (concept) {
    case "silk":
      return <SilkProductGrid products={products} />;
    case "bento":
      return <BentoProductGrid products={products} />;
    case "editorial":
      return <EditorialProductGrid products={products} />;
    case "vi":
      return <ViProductGrid products={products} />;
    case "arena":
      return <ArenaProductGrid products={products} />;
    case "hyper":
    default:
      return <HyperProductGrid products={products} />;
  }
}
