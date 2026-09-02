"use client";

import { useState, useEffect } from "react";
import { ProductDetailsForm } from "@/components/admin/ProductDetailsForm";
import { Loader2, PackageSearch } from "lucide-react";
import { updateProduct, deleteProduct, API_BASE } from "@/lib/api";

export function ProductEditor() {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const handleSelected = async (e: any) => {
      const productId = e.detail;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/products/${productId}`);
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    window.addEventListener("product-selected", handleSelected);
    return () => window.removeEventListener("product-selected", handleSelected);
  }, []);

  const handleSave = async (formData: any) => {
    if (!product) return;
    setActionLoading(true);
    try {
      await updateProduct(product.id, formData);
      alert("Товар обновлен!");
    } catch (error) {
      console.error(error);
      alert("Ошибка при сохранении");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить этот товар?")) return;
    setActionLoading(true);
    try {
      await deleteProduct(id);
      setProduct(null);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Ошибка при удалении");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary/20" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-muted text-muted-foreground/30">
          <PackageSearch className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-black tracking-tight text-muted-foreground">Выберите товар</h3>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest text-muted-foreground/40">
          для просмотра или редактирования деталей
        </p>
      </div>
    );
  }

  return (
    <div className={actionLoading ? "opacity-50 pointer-events-none" : ""}>
      <ProductDetailsForm 
        product={product} 
        onSave={handleSave} 
        onDelete={handleDelete} 
      />
    </div>
  );
}
