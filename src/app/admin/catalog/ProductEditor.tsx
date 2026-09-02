"use client";

import { useState, useEffect } from "react";
import { ProductDetailsForm } from "@/components/admin/ProductDetailsForm";
import { PackageSearch } from "lucide-react";

export function ProductEditor() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      setSelectedProductId(e.detail);
    };
    window.addEventListener("product-selected", handler);
    return () => window.removeEventListener("product-selected", handler);
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      setLoading(true);
      // In a real app, this would be a fetch to an API route
      fetch(`/api/products/${selectedProductId}`)
        .then(res => res.json())
        .then(data => {
          setProduct(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [selectedProductId]);

  const handleSave = async (data: any) => {
    try {
      const res = await fetch(`/api/products/${selectedProductId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setProduct(updated);
        // Refresh the page or the list in a real app
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedProductId(null);
        setProduct(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!selectedProductId) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-muted text-muted-foreground/30">
          <PackageSearch className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Выберите товар</h3>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest text-muted-foreground/40">Используйте дерево слева для навигации</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <ProductDetailsForm 
      product={product} 
      onSave={handleSave} 
      onDelete={handleDelete} 
    />
  );
}
