"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import type { SectionComponentProps } from "./index";

interface Post { id: string; title: string; slug: string; seoDescription: string | null; createdAt: string; }

export function BlogTeasers({ props, data }: SectionComponentProps) {
  const resolved = data as { posts: Post[] } | null;
  const posts = resolved?.posts ?? [];
  const title = (props.title as string) ?? "Статьи";

  if (posts.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--atlas-font-heading)" }}>{title}</h2>
        <Link href="/blog" className="text-sm font-medium" style={{ color: "var(--atlas-primary)" }}>
          Все статьи →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="atlas-card atlas-card-elevated p-5 group">
            <div className="flex items-center gap-2 text-xs mb-2" style={{ color: "var(--atlas-text-muted)" }}>
              <Calendar size={14} />
              {new Date(post.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-[var(--atlas-primary)]">{post.title}</h3>
            {post.seoDescription && (
              <p className="text-sm line-clamp-3" style={{ color: "var(--atlas-text-muted)" }}>{post.seoDescription}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
