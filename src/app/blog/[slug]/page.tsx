import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Sparkles, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DefaultLayout } from "@/components/layout/DefaultLayout";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Статья не найдена" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { product: { include: { category: true } } },
  });

  if (!post) notFound();

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-slate-50/40 font-jakarta">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="mb-10 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Все статьи
          </Link>

          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" />
            {post.product?.category.name || "Аналитика"}
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {post.title}
          </h1>

          <div className="mt-8 mb-12 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {new Date(post.createdAt).toLocaleDateString("ru-RU")}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              ИИ-Аналитик
            </div>
          </div>

          <article
            className="article-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-16 rounded-[2rem] border-2 border-slate-100 bg-white p-8">
            <h2 className="text-xl font-black tracking-tight">Нужна консультация?</h2>
            <p className="mt-2 text-slate-500">
              Позвоните нам или оставьте заявку — менеджер поможет подобрать материалы и рассчитает доставку в день заказа.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/metall"
                className="rounded-full bg-slate-900 px-8 py-3 text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-105"
              >
                Каталог металлопроката
              </Link>
              <Link
                href="/pesok-scheben"
                className="rounded-full border-2 border-slate-200 px-8 py-3 text-sm font-black uppercase tracking-widest text-slate-900 transition-all hover:border-primary hover:text-primary"
              >
                Песок и щебень
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
