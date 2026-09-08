import { Calendar, ChevronRight, User, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function ModernSeoBlog({ title = "Блог и аналитика", limit = 6 }: { title?: string; limit?: number }) {
  const posts = await prisma.blogPost.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { 
      product: {
        include: {
          category: true
        }
      } 
    }
  });

  if (posts.length === 0) return null;

  return (
    <section className="py-24 font-jakarta">
      <div className="mb-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" />
            Экспертные статьи
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Экспертные статьи по выбору стройматериалов и аналитика цен в Москве и Московской области.
          </p>
        </div>
        <Link 
          href="/blog" 
          className="group flex items-center gap-3 rounded-full border-2 border-border bg-card px-8 py-3 text-sm font-black uppercase tracking-widest transition-all hover:border-primary hover:text-primary shadow-sm active:scale-95"
        >
          Все статьи <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 6).map((post) => (
          <article 
            key={post.id} 
            className="group flex flex-col overflow-hidden rounded-[2.5rem] border-2 border-border bg-card transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
               <div className="flex h-full w-full items-center justify-center text-8xl font-black text-primary/10 select-none">
                 {post.product?.name.slice(0, 1) || "P"}
               </div>
              <div className="absolute left-6 top-6">
                <span className="rounded-full bg-white/95 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-black shadow-xl backdrop-blur-md">
                  {post.product?.category.name || "Аналитика"}
                </span>
              </div>
            </div>
            
            <div className="flex flex-1 flex-col p-10">
              <div className="mb-6 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {new Date(post.createdAt).toLocaleDateString("ru-RU")}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-primary" />
                  Редакция
                </div>
              </div>
              
              <h3 className="mb-4 text-2xl font-black leading-tight tracking-tight transition-colors group-hover:text-primary">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              
              <p className="mb-10 line-clamp-3 text-base leading-relaxed text-muted-foreground font-medium">
                {post.seoDescription}
              </p>
              
              <div className="mt-auto pt-6 border-t">
                <Link 
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all hover:gap-4 group-hover:text-primary"
                >
                  Читать далее <ArrowRightSmall className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      <div className="mt-12 flex justify-center sm:hidden">
        <Link 
          href="/blog" 
          className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-foreground text-xs font-black uppercase tracking-widest text-background"
        >
          Все статьи <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function ArrowRightSmall(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M5 12h14m-4-4 4 4-4 4" />
    </svg>
  );
}
