import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { MetalTable } from "@/components/catalog/MetalTable";
import { getFullTree, toMetalProduct, totalInTree } from "@/lib/metall-catalog";

export const metadata: Metadata = {
  title: "Металлопрокат — арматура, трубы, уголок, лист",
  description:
    "Металлопрокат в Москве и Московской области: арматура, трубы профильные и электросварные, уголок, швеллер, лист, сетка, профнастил. Цены обновляются ежедневно.",
};

export default async function MetallPage() {
  const tree = await getFullTree();
  const products = await prisma.product.findMany({
    where: { type: "METALL" },
    take: 500, // Увеличиваем лимит для полного каталога
    orderBy: { updatedAt: "desc" },
    include: { category: true, attributes: true },
  });
  const rows = products.map((p: any) => ({
    ...toMetalProduct(p),
    groupId: p.groupId,
    groupName: p.groupName
  }));

  return (
    <DefaultLayout>
      <MetalTable
        products={rows}
        categories={tree}
        title="Металлопрокат"
        subtitle={`${totalInTree(tree)} позиций — арматура, трубы, уголок, швеллер, лист, сетка и профнастил. Цены обновляются ежедневно`}
      />
    </DefaultLayout>
  );
}
