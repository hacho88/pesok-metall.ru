import { prisma } from "@/lib/prisma";
import { 
  PenTool, 
  Sparkles, 
  Trash2, 
  ExternalLink,
  Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { GeneratePostButton } from "./GeneratePostButton";
import { DeletePostButton } from "./DeletePostButton";
import { EditPostModal } from "./EditPostModal";

export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true }
  });

  return (
    <div className="space-y-10 font-jakarta">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <PenTool className="h-8 w-8 text-primary" />
            AI Блог и SEO
          </h1>
          <p className="mt-1 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
            Автоматическая генерация экспертного контента
          </p>
        </div>
        <div className="flex items-center gap-3">
           <GeneratePostButton />
        </div>
      </div>

      <div className="grid gap-6">
        {posts.map((post: any) => (
          <Card key={post.id} className="group overflow-hidden rounded-3xl border-2 shadow-sm transition-all hover:border-primary/30">
            <CardContent className="p-8">
               <div className="flex items-start justify-between gap-6">
                  <div className="space-y-2 flex-1">
                     <div className="flex items-center gap-3">
                        <Badge variant="outline" className="rounded-full border-2 border-primary/20 text-primary font-black uppercase text-[10px]">
                           SEO OK
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                           {new Date(post.createdAt).toLocaleDateString("ru-RU")}
                        </span>
                     </div>
                     <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{post.title}</h3>
                     <p className="text-sm text-muted-foreground line-clamp-2 italic">
                        {post.seoDescription}
                     </p>
                     {post.product && (
                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-primary uppercase tracking-widest">
                           <Sparkles className="h-3 w-3" />
                           Целевой товар: {post.product.name}
                        </div>
                     )}
                  </div>
                  <div className="flex items-center gap-2">
                     <Link href={`/blog/${post.slug}`} target="_blank">
                        <Button variant="outline" size="icon" className="rounded-xl">
                           <ExternalLink className="h-4 w-4" />
                        </Button>
                     </Link>
                     <EditPostModal post={post} />
                     <DeletePostButton id={post.id} />
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed py-24 text-center">
             <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground/30">
                <PenTool className="h-10 w-10" />
             </div>
             <h3 className="text-xl font-black tracking-tight text-muted-foreground">Статей пока нет</h3>
             <p className="mt-2 text-sm font-bold uppercase tracking-widest text-muted-foreground/40">Нажмите кнопку сверху, чтобы создать первую статью</p>
          </div>
        )}
      </div>
    </div>
  );
}
