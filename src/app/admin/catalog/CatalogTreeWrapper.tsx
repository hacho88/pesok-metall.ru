"use client";

import { useState, useEffect } from "react";
import { CatalogTree } from "@/components/admin/CatalogTree";

export function CatalogTreeWrapper({ initialItems }: { initialItems: any[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleMove = async (itemId: string, newCategoryId: string) => {
    try {
      const res = await fetch(`/api/products/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: newCategoryId }),
      });
      if (res.ok) {
        // Refresh page to show updated tree
        window.location.reload();
      }
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
