import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ChevronRight, MapPin, Sparkles, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DefaultLayout } from "@/components/layout/DefaultLayout";

export const metadata: Metadata = {
  title: "Блог о стройматериалах — аналитика и советы",
  description:
    "Экспертные статьи по выбору металлопроката, песка и щебня, расчёты по ГОСТ, аналитика цен и доставки по Москве и Московской области.",
};

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { include: { category: true } }, geoZone: true },
  });

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-slate-50/40 font-jakarta">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" />
              AI Инсайты
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Блог о стройматериалах
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-500 leading-relaxed">
              Экспертные статьи по выбору металлопроката, песка и щебня, практические расчёты и аналитика цен в Москве и Московской области.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed border-slate-100 py-24 text-center">
              <p className="text-xl font-black text-slate-900">Статьи скоро появятся</p>
              <p className="mt-2 text-slate-500">ИИ-редакция готовит материалы</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col overflow-hidden rounded-[2.5rem] border-2 border-slate-100 bg-white transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <div className="flex h-full w-full items-center justify-center text-8xl font-black text-primary/10 select-none">
                      {post.product?.name.slice(0, 1) || "P"}
                    </div>
                    <div className="absolute left-6 top-6">
                      <span className="rounded-full bg-white/95 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl backdrop-blur-md">
                        {post.geoZone ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary" />
                            {post.geoZone.name}
                          </span>
                        ) : (
                          post.product?.category.name || "Аналитика"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-10">
                    <div className="mb-6 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {new Date(post.createdAt).toLocaleDateString("ru-RU")}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-primary" />
                        ИИ-Аналитик
                      </div>
                    </div>

                    <h2 className="mb-4 text-2xl font-black leading-tight tracking-tight transition-colors group-hover:text-primary">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    <p className="mb-10 line-clamp-3 text-base leading-relaxed text-slate-500 font-medium">
                      {post.seoDescription}
                    </p>

                    <div className="mt-auto pt-6 border-t">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all hover:gap-4 group-hover:text-primary"
                      >
                        Читать далее <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
