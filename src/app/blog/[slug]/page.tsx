import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Sparkles, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DefaultLayout } from "@/components/layout/DefaultLayout";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pesok-metall.ru";

export const dynamic = "force-dynamic";

/** FAQ из HTML статьи: заголовки h2/h3 со знаком «?» + следующий за ними абзац */
function extractFaq(html: string): Array<{ q: string; a: string }> {
  const faq: Array<{ q: string; a: string }> = [];
  const re = /<h[23][^>]*>([\s\S]*?)<\/h[23]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const q = m[1].replace(/<[^>]+>/g, "").trim();
    const a = m[2].replace(/<[^>]+>/g, "").trim();
    if (q.endsWith("?") && a.length > 20) faq.push({ q, a });
    if (faq.length >= 10) break;
  }
  return faq;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { product: { select: { name: true, imageLocal: true, imageUrl: true } } },
  });
  if (!post) return { title: "Статья не найдена" };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.title;
  const url = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
  const image = post.product?.imageLocal || post.product?.imageUrl || undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "pesok-metall.ru",
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: image ? [{ url: image }] : undefined,
    },
    keywords: post.product
      ? [post.product.name, "купить", "цена", "доставка", "Москва", "Московская область"]
      : undefined,
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

  // JSON-LD: Article — для Google AI Overviews, Яндекс.Алисы и классической выдачи
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.title,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "pesok-metall.ru", url: SITE_URL },
    publisher: { "@type": "Organization", name: "pesok-metall.ru", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
    ...(post.product?.imageLocal || post.product?.imageUrl
      ? { image: [post.product.imageLocal || post.product.imageUrl] }
      : {}),
    ...(post.product ? { about: { "@type": "Product", name: post.product.name } } : {}),
  };

  // FAQPage — вопросы из статьи (заголовки H2/H3 со знаком «?») — подхват ИИ-поиском
  const faq = extractFaq(post.content);
  const faqJsonLd =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Блог", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };

  return (
    <DefaultLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
              Редакция pesok-metall.ru
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
