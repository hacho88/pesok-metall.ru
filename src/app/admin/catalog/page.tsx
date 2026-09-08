import { prisma } from "@/lib/prisma";
import { CatalogTree } from "@/components/admin/CatalogTree";
import { ProductDetailsForm } from "@/components/admin/ProductDetailsForm";
import { NewProductDialog } from "./NewProductDialog";
import { BulkGenerateButton } from "./BulkGenerateButton";
import {
  Info,
  Package,
  Layers
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null
    },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      description: true,
      shortDescription: true,
      seoTitle: true,
      seoDescription: true,
      descriptionStatus: true,
      descriptionGeneratedAt: true,
      products: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      children: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          description: true,
          shortDescription: true,
          seoTitle: true,
          seoDescription: true,
          descriptionStatus: true,
          descriptionGeneratedAt: true,
          products: { select: { id: true, name: true }, orderBy: { name: "asc" } },
        },
      },
    },
  });

  // Сыпучие (песок, керамзит, щебень) — первыми: они питают боксы на главной
  const BULK_ORDER = ["Песок", "Керамзит", "Щебень"];
  const sortedCategories = [
    ...categories.filter((c) => c.slug === "pesok-shcheben"),
    ...categories.filter((c) => c.slug !== "pesok-shcheben"),
  ];

  // Transform data to TreeItem format
  const treeData = sortedCategories.map((cat) => {
    const sortedChildren = [...cat.children].sort((a, b) => {
      const ai = BULK_ORDER.indexOf(a.name);
      const bi = BULK_ORDER.indexOf(b.name);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return {
      id: cat.id,
      name: cat.name,
      type: "category" as const,
      children: [
        ...sortedChildren.map((sub) => ({
          id: sub.id,
          name: sub.name,
          type: "category" as const,
          children: sub.products.map((p) => ({
            id: p.id,
            name: p.name,
            type: "product" as const
          }))
        })),
        ...cat.products.map((p) => ({
          id: p.id,
          name: p.name,
          type: "product" as const
        }))
      ]
    };
  });

  // Плоский список категорий для диалогов (создание товара, редактирование категории)
  const flatCategories = sortedCategories.flatMap((cat) => [
    {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentName: null as string | null,
      imageUrl: cat.imageUrl,
      description: cat.description,
      shortDescription: cat.shortDescription,
      seoTitle: cat.seoTitle,
      seoDescription: cat.seoDescription,
      descriptionStatus: cat.descriptionStatus,
      descriptionGeneratedAt: cat.descriptionGeneratedAt as string | null,
    },
    ...cat.children.map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      parentName: cat.name,
      imageUrl: sub.imageUrl,
      description: sub.description,
      shortDescription: sub.shortDescription,
      seoTitle: sub.seoTitle,
      seoDescription: sub.seoDescription,
      descriptionStatus: sub.descriptionStatus,
      descriptionGeneratedAt: sub.descriptionGeneratedAt as string | null,
    })),
  ]);

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100dvh-48px)]">
      {/* Шапка: название + действия — одна строка */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Package className="h-7 w-7 shrink-0 text-primary" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-black tracking-tight">Управление каталогом</h1>
            <p className="hidden text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:block">
              Категории, товары и остатки
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <BulkGenerateButton />
          <NewProductDialog categories={flatCategories} />
        </div>
      </div>

      {/* Компактная подсказка про боксы главной */}
      <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-accent/60 px-3 py-2">
        <Info className="h-3.5 w-3.5 shrink-0 text-primary" />
        <p className="text-xs leading-snug text-muted-foreground">
          <span className="font-semibold text-foreground">Боксы на главной</span> — закрепите товары вручную в разделе{" "}
          <a href="/admin/hero-boxes" className="font-semibold text-primary underline-offset-2 hover:underline">
            «Боксы на главной»
          </a>{" "}
          или добавляйте в «Сыпучие материалы» для авто-режима.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[300px_1fr]">
        {/* Left Panel: Tree Explorer */}
        <div className="flex max-h-[420px] min-h-0 flex-col overflow-hidden rounded-3xl border-2 bg-card shadow-sm lg:max-h-none">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <Layers className="h-3.5 w-3.5" />
              Структура каталога
            </span>
            <span className="hidden text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 xl:block">
              Сыпучие — первыми
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 custom-scrollbar">
            <CatalogTreeWrapper initialItems={treeData} categories={flatCategories} />
          </div>
        </div>

        {/* Right Panel: Details Form */}
        <div className="min-h-0 overflow-y-auto rounded-3xl border-2 bg-card p-5 shadow-sm custom-scrollbar lg:p-6">
           <ProductEditor />
        </div>
      </div>
    </div>
  );
}

// Client wrappers for interactivity
import { CatalogTreeWrapper } from "./CatalogTreeWrapper";
import { ProductEditor } from "./ProductEditor";
