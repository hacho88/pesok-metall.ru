"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";

export interface MegaMenuCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  totalProductCount: number;
  sectionId: string | null;
  sectionName: string | null;
  sectionSlug: string | null;
  sortOrder: number;
  children: MegaMenuCategory[];
}

export interface MegaMenuSection {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isVisible: boolean;
  categories: MegaMenuCategory[];
}

export function CatalogMegaMenu({ categories, sections }: { categories: MegaMenuCategory[]; sections?: MegaMenuSection[] }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const roots = categories.filter((c) => !c.parentId);
  const activeCat = roots.find((c) => c.id === activeId) ?? roots[0] ?? null;

  // Group roots by section
  const groupedRoots = useMemo(() => {
    if (sections && sections.length > 0) {
      return sections.filter((s) => s.isVisible).map((s) => ({
        sectionName: s.name,
        categories: s.categories.filter((c) => !c.parentId),
      }));
    }
    // Fallback: group by sectionName field on categories
    const groups = new Map<string, MegaMenuCategory[]>();
    for (const c of roots) {
      const key = c.sectionName ?? "Прочее";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(c);
    }
    return Array.from(groups.entries()).map(([sectionName, cats]) => ({ sectionName, categories: cats }));
  }, [roots, sections]);

  return (
    <div className="catalog-mega" ref={containerRef}>
      {/* Trigger */}
      <button
        className={`catalog-mega__trigger ${open ? "catalog-mega__trigger--active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
        <span>КАТАЛОГ ТОВАРОВ</span>
      </button>

      {/* Mega menu panel */}
      {open && (
        <div className="catalog-mega__panel">
          {/* Left column — categories grouped by section */}
          <div className="catalog-mega__left">
            {groupedRoots.map((group, gIdx) => (
              <div key={group.sectionName} className="catalog-mega__group">
                {gIdx > 0 && <div className="catalog-mega__divider" />}
                <div className="catalog-mega__section-title">{group.sectionName}</div>
                {group.categories.map((cat) => {
                  const isActive = activeCat?.id === cat.id;
                  return (
                    <Link
                      key={cat.id}
                      href={`/shop/${encodeURIComponent(cat.slug)}`}
                      className={`catalog-mega__cat ${isActive ? "catalog-mega__cat--active" : ""}`}
                      onMouseEnter={() => setActiveId(cat.id)}
                      onClick={() => setOpen(false)}
                    >
                      <span className="catalog-mega__cat-icon">
                        <CategoryIcon name={cat.name} />
                      </span>
                      <span className="catalog-mega__cat-name">{cat.name}</span>
                      {cat.totalProductCount > 0 && (
                        <span className="catalog-mega__cat-count">{cat.totalProductCount}</span>
                      )}
                      {cat.children.length > 0 && <ChevronRight size={16} className="catalog-mega__cat-arrow" />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Right column — subcategories */}
          <div className="catalog-mega__right">
            {activeCat && activeCat.children.length > 0 ? (
              <>
                <div className="catalog-mega__right-header">
                  <Link
                    href={`/shop/${encodeURIComponent(activeCat.slug)}`}
                    className="catalog-mega__right-title"
                    onClick={() => setOpen(false)}
                  >
                    {activeCat.name}
                    <ChevronRight size={16} />
                  </Link>
                  <span className="catalog-mega__right-count">{activeCat.totalProductCount} товаров</span>
                </div>
                <div className="catalog-mega__subgrid">
                  {activeCat.children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/shop/${encodeURIComponent(sub.slug)}`}
                      className="catalog-mega__sub"
                      onClick={() => setOpen(false)}
                    >
                      <span className="catalog-mega__sub-name">{sub.name}</span>
                      <span className="catalog-mega__sub-count">{sub.totalProductCount}</span>
                    </Link>
                  ))}
                </div>
              </>
            ) : activeCat ? (
              <div className="catalog-mega__right-empty">
                <Link
                  href={`/shop/${encodeURIComponent(activeCat.slug)}`}
                  className="catalog-mega__right-title"
                  onClick={() => setOpen(false)}
                >
                  {activeCat.name}
                  <ChevronRight size={16} />
                </Link>
                <p className="catalog-mega__right-empty-text">Нет подкатегорий. Перейти в раздел →</p>
              </div>
            ) : (
              <div className="catalog-mega__right-empty">
                <p className="catalog-mega__right-empty-text">Категории не найдены</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {open && <div className="catalog-mega__overlay" onClick={() => setOpen(false)} />}
    </div>
  );
}

function CategoryIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  let emoji = "📦";
  if (lower.includes("арматур")) emoji = "🔩";
  else if (lower.includes("труб")) emoji = "⬜";
  else if (lower.includes("балк") || lower.includes("двутавр")) emoji = "🏗️";
  else if (lower.includes("лист")) emoji = "📐";
  else if (lower.includes("угол")) emoji = "📐";
  else if (lower.includes("швеллер")) emoji = "🏗️";
  else if (lower.includes("сетк")) emoji = "🔲";
  else if (lower.includes("песок")) emoji = "🏖️";
  else if (lower.includes("щебен")) emoji = "🪨";
  else if (lower.includes("гравий")) emoji = "🪨";
  else if (lower.includes("отсев")) emoji = "🪨";
  else if (lower.includes("проволок") || lower.includes("катанк")) emoji = "➰";
  else if (lower.includes("крепеж") || lower.includes("болт")) emoji = "🔩";
  return <span style={{ fontSize: 16, lineHeight: 1, opacity: 0.6 }}>{emoji}</span>;
}
