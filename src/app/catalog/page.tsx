import type { Metadata } from "next";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { FullCatalog } from "@/components/catalog/FullCatalog";
import { getUnifiedTree, getUnifiedProducts, totalInUnifiedTree } from "@/lib/unified-catalog";

export const metadata: Metadata = {
  title: "Каталог — металлопрокат, песок и щебень",
  description:
    "Полный каталог: арматура, трубы, уголок, швеллер, лист, сетка, песок, щебень и керамзит. Цены от производителя, доставка в день заказа по Москве и МО.",
};

export default async function CatalogPage() {
  const [categories, products] = await Promise.all([
    getUnifiedTree(),
    getUnifiedProducts(1000),
  ]);

  return (
    <DefaultLayout>
      <FullCatalog
        categories={categories}
        products={products}
        title="Каталог"
        subtitle={`${totalInUnifiedTree(categories)} позиций — металлопрокат и сыпучие материалы. Цены обновляются ежедневно, доставка в день заказа.`}
      />
    </DefaultLayout>
  );
}
