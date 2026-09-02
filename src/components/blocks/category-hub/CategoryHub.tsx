"use client";

import { useState } from "react";
import type { StorefrontProduct } from "@/lib/theme-storefront";
import { CityMetBasketProvider } from "@/components/themes/city-met/basket-context";
import { BentoBulkSection } from "./BentoBulkSection";
import {
  MetalDirectoryHub,
  type ParentCategoryKey,
} from "./MetalDirectoryHub";

interface CategoryHubProps {
  products: StorefrontProduct[];
  title?: string;
  subtitle?: string;
}

export function CategoryHub({ products, title, subtitle }: CategoryHubProps) {
  const [activeCategoryKey, setActiveCategoryKey] =
    useState<ParentCategoryKey>("armatura");
  const [activeSubcategoryTag, setActiveSubcategoryTag] =
    useState<string>("all");
  const [activeBulkCategory, setActiveBulkCategory] = useState<string | null>(
    null
  );

  const handleSelectBulk = (categoryName: string) => {
    setActiveBulkCategory((prev) =>
      prev === categoryName ? null : categoryName
    );
  };

  const handleSelectCategory = (key: ParentCategoryKey) => {
    setActiveCategoryKey(key);
    setActiveBulkCategory(null);
  };

  const handleSelectSubcategoryTag = (tagId: string) => {
    setActiveSubcategoryTag(tagId);
  };

  const handleClearBulkFilter = () => {
    setActiveBulkCategory(null);
  };

  return (
    <CityMetBasketProvider>
      <section id="catalog" className="w-full space-y-8 py-6">
        {/* 🧱 SECTION 1 (TOP): PREMIUM BENTO GRID FOR OWNED MATERIALS */}
        <BentoBulkSection
          onSelectCategory={handleSelectBulk}
          activeBulkCategory={activeBulkCategory}
        />

        {/* 📊 SECTION 2 (BOTTOM): 2-COLUMN METAL CATEGORIES & DIRECTORY HUB */}
        <MetalDirectoryHub
          products={products}
          activeCategoryKey={activeCategoryKey}
          activeSubcategoryTag={activeSubcategoryTag}
          activeBulkCategory={activeBulkCategory}
          onSelectCategory={handleSelectCategory}
          onSelectSubcategoryTag={handleSelectSubcategoryTag}
          onClearBulkFilter={handleClearBulkFilter}
        />
      </section>
    </CityMetBasketProvider>
  );
}
