import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { SandProductCard } from "@/components/catalog/SandProductCard";
import { toSandProduct } from "@/lib/sand-catalog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const category = await prisma.category.findUnique({ where: { slug: decoded } });
  if (!category) return { title: "Категория не найдена" };
  return {
    title: `${category.name} — купить в мешках и биг-бегах с доставкой`,
    description: `${category.name} в мешках по 30 кг и биг-бегах по 1 тонне. Доставка по Москве и Московской области.`,
  };
}

export default async function SandCategoryPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const category = await prisma.category.findUnique({
    where: { slug: decoded },
    include: {
      parent: true,
      products: {
        where: { type: { in: ["BAG_30KG", "BIG_BAG_1TON"] } },
        include: { category: true, attributes: true },
        orderBy: { name: "asc" },
      },
    },
  });
  if (!category) notFound();

  const cards = category.products.map(toSandProduct);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/pesok-scheben" className="hover:text-foreground">
            Песок и щебень
          </Link>
          {category.parent && (
            <>
              <span className="mx-2">/</span>
              <Link
                href={`/pesok-scheben/${category.parent.slug}`}
                className="hover:text-foreground"
              >
                {category.parent.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {cards.length} позиций — мешки 30 кг и биг-бэги 1 т, доставка в день
            заказа
          </p>
        </div>

        {cards.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((p) => (
              <SandProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            В этой категории пока нет товаров
          </p>
        )}
      </div>
    </DefaultLayout>
  );
}
