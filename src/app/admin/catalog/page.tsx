import { prisma } from "@/lib/prisma";
import { CatalogTree } from "@/components/admin/CatalogTree";
import { ProductDetailsForm } from "@/components/admin/ProductDetailsForm";
import { 
  Package, 
  Search, 
  Filter,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const categories = await prisma.category.findMany({
    include: {
      products: true,
      children: {
        include: {
          products: true
        }
      }
    },
    where: {
      parentId: null
    }
  });

  // Transform data to TreeItem format
  const treeData = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    type: "category" as const,
    children: [
      ...cat.children.map(sub => ({
        id: sub.id,
        name: sub.name,
        type: "category" as const,
        children: sub.products.map(p => ({
          id: p.id,
          name: p.name,
          type: "product" as const
        }))
      })),
      ...cat.products.map(p => ({
        id: p.id,
        name: p.name,
        type: "product" as const
      }))
    ]
  }));

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <Package className="h-8 w-8 text-primary" />
            Управление каталогом
          </h1>
          <p className="mt-1 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
            Визуальный проводник: категории, товары и остатки
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl border-2 font-bold transition-all hover:bg-primary hover:text-white hover:border-primary">
              <Plus className="mr-2 h-4 w-4" />
              НОВАЯ КАТЕГОРИЯ
           </Button>
           <Button className="rounded-xl bg-primary h-11 px-6 font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              <Plus className="mr-2 h-4 w-4" />
              НОВЫЙ ТОВАР
           </Button>
        </div>
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left Panel: Tree Explorer */}
        <div className="flex flex-col rounded-3xl border-2 bg-card shadow-sm overflow-hidden">
          <div className="border-b p-4 space-y-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Поиск в каталоге..." className="pl-9 h-11 rounded-xl border-2" />
             </div>
             <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Структура</span>
                <Filter className="h-3 w-3 text-muted-foreground" />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <CatalogTreeWrapper initialItems={treeData} />
          </div>
        </div>

        {/* Right Panel: Details Form */}
        <div className="rounded-[2.5rem] border-2 bg-card p-10 shadow-sm overflow-y-auto custom-scrollbar">
           <ProductEditor />
        </div>
      </div>
    </div>
  );
}

// Client wrappers for interactivity
import { CatalogTreeWrapper } from "./CatalogTreeWrapper";
import { ProductEditor } from "./ProductEditor";
