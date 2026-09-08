"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  Package, 
  Pencil,
  PlusCircle,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeItem {
  id: string;
  name: string;
  type: "category" | "product";
  children?: TreeItem[];
}

interface CatalogTreeProps {
  items: TreeItem[];
  selectedId: string | null;
  onSelect: (item: TreeItem) => void;
  onMove?: (itemId: string, newCategoryId: string) => void;
  onAddProduct?: (categoryId: string, categoryName: string) => void;
  onEditCategory?: (categoryId: string) => void;
}

export function CatalogTree({ items, selectedId, onSelect, onMove, onAddProduct, onEditCategory }: CatalogTreeProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <TreeNode 
          key={item.id} 
          item={item} 
          selectedId={selectedId} 
          onSelect={onSelect} 
          onMove={onMove}
          onAddProduct={onAddProduct}
          onEditCategory={onEditCategory}
          level={0}
        />
      ))}
    </div>
  );
}

function TreeNode({ 
  item, 
  selectedId, 
  onSelect, 
  onMove,
  onAddProduct,
  onEditCategory,
  level 
}: { 
  item: TreeItem; 
  selectedId: string | null; 
  onSelect: (item: TreeItem) => void;
  onMove?: (itemId: string, newCategoryId: string) => void;
  onAddProduct?: (categoryId: string, categoryName: string) => void;
  onEditCategory?: (categoryId: string) => void;
  level: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedId === item.id;
  const isCategory = item.type === "category";

  const handleDragStart = (e: React.DragEvent) => {
    if (!isCategory) {
      e.dataTransfer.setData("itemId", item.id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isCategory) {
      e.preventDefault();
      e.currentTarget.classList.add("bg-primary/20");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isCategory) {
      e.currentTarget.classList.remove("bg-primary/20");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isCategory) {
      e.preventDefault();
      e.currentTarget.classList.remove("bg-primary/20");
      const itemId = e.dataTransfer.getData("itemId");
      if (itemId && itemId !== item.id) {
        onMove?.(itemId, item.id);
      }
    }
  };

  return (
    <div>
      <div 
        draggable={!isCategory}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-all hover:bg-accent/50",
          isSelected && "bg-primary/10 text-primary hover:bg-primary/20",
          level > 0 && "ml-4"
        )}
        onClick={() => {
          if (isCategory) setIsOpen(!isOpen);
          onSelect(item);
        }}
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center">
          {isCategory && item.children && item.children.length > 0 && (
            isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </div>
        
        {isCategory ? (
          <Folder className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary fill-primary/20" : "text-amber-500 fill-amber-500/20")} />
        ) : (
          <div className="flex items-center gap-1">
             <GripVertical className="h-3 w-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100" />
             <Package className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
          </div>
        )}
        
        <span className={cn(
          "flex-1 truncate text-sm font-semibold",
          isCategory ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
          isSelected && "text-primary"
        )}>
          {item.name}
        </span>

        {isCategory && (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              title="Добавить товар в категорию"
              className="hidden h-6 w-6 items-center justify-center rounded-md hover:bg-primary hover:text-white group-hover:flex"
              onClick={(e) => {
                e.stopPropagation();
                onAddProduct?.(item.id, item.name);
              }}
            >
              <PlusCircle className="h-4 w-4 text-muted-foreground group-hover:text-white" />
            </button>
            <button
              title="Редактировать категорию: фото, описание, SEO"
              className="hidden h-6 w-6 items-center justify-center rounded-md hover:bg-primary hover:text-white group-hover:flex"
              onClick={(e) => {
                e.stopPropagation();
                onEditCategory?.(item.id);
              }}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground group-hover:text-white" />
            </button>
          </div>
        )}
      </div>

      {isCategory && isOpen && item.children && (
        <div className="mt-1 border-l-2 border-muted/30 ml-3">
          {item.children.map((child) => (
            <TreeNode 
              key={child.id} 
              item={child} 
              selectedId={selectedId} 
              onSelect={onSelect} 
              onMove={onMove}
              onAddProduct={onAddProduct}
              onEditCategory={onEditCategory}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
