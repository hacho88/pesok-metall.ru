"use client";

import { useState, useEffect } from "react";
import { BentoBulkSection } from "./BentoBulkSection";
import { InlineCatalogMenu, type InlineSection, type InlineCategory } from "./InlineCatalogMenu";

interface CategoryHubProps {
  title?: string;
  subtitle?: string;
}

export function CategoryHub({ title, subtitle }: CategoryHubProps) {
  const [activeBulkCategory, setActiveBulkCategory] = useState<string | null>(null);
  const [sections, setSections] = useState<InlineSection[]>([]);
  const [categories, setCategories] = useState<InlineCategory[]>([]);

  // Load categories from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch("/api/categories/tree");
        if (resp.ok) {
          const data = await resp.json();
          if (mounted) {
            if (Array.isArray(data.sections)) setSections(data.sections);
            if (Array.isArray(data.tree)) setCategories(data.tree);
          }
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const handleSelectBulk = (categoryName: string) => {
    setActiveBulkCategory((prev) => (prev === categoryName ? null : categoryName));
  };

  return (
    <section id="catalog" className="w-full space-y-8 py-6">
      {/* 🧱 SECTION 1 (TOP): PREMIUM BENTO GRID FOR OWNED MATERIALS */}
      <BentoBulkSection
        onSelectCategory={handleSelectBulk}
        activeBulkCategory={activeBulkCategory}
      />

      {/* 📊 SECTION 2: Inline catalog menu (замена MetalDirectoryHub) */}
      <InlineCatalogMenu sections={sections} categories={categories} />
    </section>
  );
}
