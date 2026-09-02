import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HardHat, ShieldCheck, Truck, Zap } from "lucide-react";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { UnifiedCatalog } from "@/components/catalog/UnifiedCatalog";
import { getUnifiedProducts, getUnifiedTree, totalInUnifiedTree } from "@/lib/unified-catalog";

export const metadata: Metadata = {
  title: "ВИНСОВХОЗ — металлопрокат, песок и щебень в одном каталоге",
  description:
    "Единый каталог стройматериалов: арматура, трубы, листы, сетка, песок, щебень, грунт и керамзит. Цены, фото, доставка по Москве и МО в день заказа.",
};

export const dynamic = "force-dynamic";

export default async function VinsovkhozPage() {
  const [tree, products] = await Promise.all([getUnifiedTree(), getUnifiedProducts(1000)]);
  const total = totalInUnifiedTree(tree);

  return (
    <DefaultLayout>
      <div className="theme-vinsovkhoz style-commerce min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,166,35,0.12),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.08),transparent_50%)]" />
          <div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-black uppercase tracking-widest text-primary">
                <HardHat className="h-4 w-4" />
                ВИНСОВХОЗ · единый каталог
              </span>
              <h1 className="font-jakarta text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Металл, песок и щебень —{" "}
                <span className="text-primary">в одном месте</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Больше никаких разделов: ищите арматуру, трубы, мешки песка и биг-беги щебня
                в едином каталоге с фото, ценами и доставкой в день заказа.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#catalog">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-black text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-105 hover:brightness-110 active:scale-95">
                    Открыть каталог
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </a>
                <Link href="/#calculator">
                  <span className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-8 py-4 text-lg font-black transition-all hover:border-primary/50 hover:bg-muted active:scale-95">
                    Рассчитать доставку
                  </span>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-bold text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" /> Доставка в день заказа
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Соответствие ГОСТ
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> {total} позиций в наличии
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Единый каталог */}
        <div id="catalog">
          <UnifiedCatalog
            products={products}
            categories={tree}
            title="Каталог стройматериалов"
            subtitle={`${total} позиций: металлопрокат, песок, щебень, грунт и керамзит. Фильтруйте по типу, категории и цене — всё в одном списке.`}
          />
        </div>
      </div>
    </DefaultLayout>
  );
}
