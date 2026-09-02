import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { SandProductCard } from "@/components/catalog/SandProductCard";
import { getSandTree, toSandProduct } from "@/lib/sand-catalog";

export const metadata: Metadata = {
  title: "Песок и щебень в мешках и биг-бегах — купить с доставкой",
  description:
    "Песок, щебень, грунт и керамзит в мешках по 30 кг и биг-бегах по 1 тонне. Доставка по Москве и Московской области в день заказа.",
};

export default async function SandPage() {
  const tree = await getSandTree();
  const products = await prisma.product.findMany({
    where: { type: { in: ["BAG_30KG", "BIG_BAG_1TON"] } },
    take: 24,
    orderBy: { updatedAt: "desc" },
    include: { category: true, attributes: true },
  });
  const cards = products.map(toSandProduct);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 p-8 text-white sm:p-12">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
              Сыпучие материалы
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Песок и щебень в мешках и биг-бегах
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
              Мешки по 30 кг — для стройки и дачи, биг-бэги по 1 тонне — для
              больших объёмов. Доставка по Москве и Московской области в день
              заказа.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="rounded-lg bg-white/20 px-4 py-2 backdrop-blur">
                🚚 Доставка в день заказа
              </span>
              <span className="rounded-lg bg-white/20 px-4 py-2 backdrop-blur">
                ⚖️ Фасовка 30 кг и 1 т
              </span>
              <span className="rounded-lg bg-white/20 px-4 py-2 backdrop-blur">
                📄 Счёт и накладные
              </span>
            </div>
          </div>
        </div>

        {/* Категории */}
        {tree.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-5 text-2xl font-bold tracking-tight">Категории</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tree.map((c) => (
                <Link
                  key={c.id}
                  href={`/pesok-scheben/${c.slug}`}
                  className="group rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl font-bold text-white">
                    {c.name.slice(0, 1)}
                  </div>
                  <h3 className="font-semibold group-hover:text-primary">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.productCount} позиций
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Товары */}
        <section>
          <h2 className="mb-5 text-2xl font-bold tracking-tight">
            Товары в наличии
          </h2>
          {cards.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map((p) => (
                <SandProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
              Каталог наполняется. Добавьте товары в админке: раздел «Товары» →
              тип «Мешок 30 кг» или «Биг-бэг 1 т».
            </p>
          )}
        </section>
      </div>
    </DefaultLayout>
  );
}
