import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function AtlasBreadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm flex-wrap" style={{ color: "var(--atlas-text-muted)" }}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} style={{ color: "var(--atlas-text-muted)" }} />}
          {item.href ? (
            <Link href={item.href} className="hover:text-[var(--atlas-primary)] transition-colors flex items-center gap-1">
              {i === 0 && <Home size={14} />}
              {item.label}
            </Link>
          ) : (
            <span style={{ color: "var(--atlas-text)" }} className="font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
