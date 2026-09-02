import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronRight, Sparkles } from "lucide-react";
import { PageBuilder } from "@/lib/page-builder";
import { getPageConfig } from "@/lib/page-config";
import { getGeoZone, inZone, toZone } from "@/lib/geo";
import { prisma } from "@/lib/prisma";
import { DefaultLayout } from "@/components/layout/DefaultLayout";

interface GeoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GeoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const zone = await getGeoZone(slug);
  if (!zone) return {};
  return {
    title:
      zone.seoTitle ??
      `Металлопрокат, песок и щебень в ${inZone(zone.name)} — доставка в день заказа`,
    description:
      zone.seoDescription ??
      `Купить металлопрокат, песок и щебень с доставкой в ${toZone(zone.name)} в день заказа. Розница и опт, соответствует ГОСТ. Актуальные цены с учётом локального тарифа доставки.`,
    keywords: [
      "купить",
      "металлопрокат",
      "песок",
      "щебень",
      "доставка",
      zone.name,
      "Москва",
      "Московская область",
      "в день заказа",
      "ГОСТ",
    ],
  };
}

export async function generateStaticParams() {
  const zones = await prisma.geoZone.findMany({ select: { slug: true } });
  return zones.map((z) => ({ slug: z.slug }));
}

export default async function GeoPage({ params }: GeoPageProps) {
  const { slug } = await params;
  const geoZone = await getGeoZone(slug);
  if (!geoZone) notFound();

  const config = await getPageConfig(`geo:${slug}`);

  // Fetch localized product pricing for this zone
  const geoProducts = await prisma.geoProductData.findMany({
    where: { geoZoneId: geoZone.id },
    include: {
      product: {
        include: { category: true },
      },
    },
    take: 12,
    orderBy: { product: { name: "asc" } },
  });

  const localizedHeadline = `Купить мытый песок, щебень и металлопрокат в ${inZone(geoZone.name)} с доставкой в день заказа`;

  // Локализованные статьи для этой зоны
  const zonePosts = await prisma.blogPost.findMany({
    where: { geoZoneId: geoZone.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <DefaultLayout>
      <PageBuilder config={config} geoZone={geoZone} />
      {/* Localized product pricing section */}
      {geoProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              {localizedHeadline}
            </h2>
            <p className="mt-3 text-slate-500">
              Актуальные цены для {inZone(geoZone.name)} с учётом локального тарифа доставки (коэффициент ×{geoZone.deliveryTariffMultiplier})
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {geoProducts.map((gp) => (
              <div
                key={gp.id}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {gp.product.category.name}
                </span>
                <h3 className="mt-1 text-sm font-bold text-slate-900">
                  {gp.product.name}
                </h3>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-2xl font-black text-slate-900">
                    {Math.round(Number(gp.localPrice)).toLocaleString("ru-RU")} ₽
                    {gp.product.unit ? `/${gp.product.unit}` : ""}
                  </span>
                  <span className="text-xs font-bold text-green-600">
                    в наличии
                  </span>
                </div>
                {gp.aiDescription && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-500 line-clamp-3">
                    {gp.aiDescription}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Localized articles for this zone */}
      {zonePosts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
                <Sparkles className="h-3 w-3" />
                Статьи о {inZone(geoZone.name)}
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Доставка и стройматериалы в {toZone(geoZone.name)}
              </h2>
            </div>
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 transition-colors hover:text-primary"
            >
              Все статьи <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {zonePosts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-3xl border-2 border-slate-100 bg-white transition-all hover:border-primary/40 hover:shadow-xl"
              >
                <div className="flex flex-1 flex-col p-8">
                  <div className="mb-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {new Date(post.createdAt).toLocaleDateString("ru-RU")}
                  </div>
                  <h3 className="mb-3 text-lg font-black leading-snug tracking-tight transition-colors group-hover:text-primary">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-slate-500">
                    {post.seoDescription}
                  </p>
                  <div className="mt-auto pt-4 border-t">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:gap-3 group-hover:text-primary"
                    >
                      Читать <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </DefaultLayout>
  );
}
