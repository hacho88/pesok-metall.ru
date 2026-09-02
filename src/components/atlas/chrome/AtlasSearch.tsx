"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatRub } from "@/lib/atlas/pricing";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  imageLocal: string | null;
  categoryName: string;
}

export function AtlasSearch({ placeholder }: { placeholder: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/atlas/search?q=${encodeURIComponent(q)}&limit=6`);
        if (resp.ok) {
          const data = await resp.json();
          setResults(data.products || []);
          setOpen(true);
        }
      } catch {}
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submit = () => {
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (highlight >= 0 && results[highlight]) {
        router.push(`/product/${results[highlight].slug}`);
      } else {
        submit();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex w-full">
        <input
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setHighlight(-1); }}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="atlas-input flex-1 rounded-r-none"
          style={{ height: 44 }}
        />
        {q && (
          <button
            className="flex items-center justify-center w-10 border-y"
            style={{ borderColor: "var(--atlas-border)", background: "var(--atlas-surface)" }}
            onClick={() => { setQ(""); setResults([]); }}
          >
            <X size={16} />
          </button>
        )}
        <button
          className="atlas-btn atlas-btn-primary rounded-l-none"
          onClick={submit}
        >
          <Search size={18} />
          <span className="hidden sm:inline">Найти</span>
        </button>
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg overflow-hidden z-50"
          style={{ background: "var(--atlas-surface)", border: "1px solid var(--atlas-border)" }}
        >
          {results.map((r, i) => (
            <a
              key={r.id}
              href={`/product/${r.slug}`}
              className="flex items-center gap-3 px-3 py-2 transition-colors"
              style={{
                background: i === highlight ? "var(--atlas-surface-2)" : "transparent",
              }}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => setOpen(false)}
            >
              <div className="w-10 h-10 rounded shrink-0 atlas-photo-canvas flex items-center justify-center">
                {r.imageLocal ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.imageLocal} alt={r.name} className="w-full h-full object-contain" />
                ) : (
                  <Search size={16} style={{ color: "var(--atlas-text-muted)" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.name}</div>
                <div className="text-xs" style={{ color: "var(--atlas-text-muted)" }}>{r.categoryName}</div>
              </div>
              {r.price != null && (
                <div className="font-bold text-sm whitespace-nowrap">
                  {formatRub(r.price)} ₽
                </div>
              )}
            </a>
          ))}
          <button
            className="w-full text-center py-2 text-sm font-medium border-t hover:bg-[var(--atlas-surface-2)]"
            style={{ borderColor: "var(--atlas-border)", color: "var(--atlas-primary)" }}
            onClick={() => { submit(); }}
          >
            Все результаты →
          </button>
        </div>
      )}
    </div>
  );
}
