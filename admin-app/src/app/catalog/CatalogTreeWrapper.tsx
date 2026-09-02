"use client";

import { useState, useEffect } from "react";
import { CatalogTree } from "@/components/admin/CatalogTree";
import { updateProduct } from "@/lib/api";

export function CatalogTreeWrapper({ initialItems }: { initialItems: any[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleMove = async (itemId: string, newCategoryId: string) => {
    try {
      await updateProduct(itemId, { categoryId: newCategoryId });
      window.location.reload();
    } catch (error) {
      console.error("Move Error:", error);
    }
  };

  // Sync with global state or URL in real app
  const handleSelect = (item: any) => {
    setSelectedId(item.id);
    if (item.type === "product") {
      window.dispatchEvent(new CustomEvent("product-selected", { detail: item.id }));
    }
  };

  return (
    <CatalogTree 
      items={initialItems} 
      selectedId={selectedId} 
      onSelect={handleSelect} 
      onMove={handleMove}
    />
  );
}
