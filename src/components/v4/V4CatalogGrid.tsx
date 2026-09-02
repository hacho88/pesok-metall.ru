import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Hammer, Truck } from "lucide-react";
import { productImageSrc } from "@/lib/product-image";

export interface V4CatalogItem {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  price: number | null;
  unit: string | null;
  imageUrl: string | null;
  imageLocal: string | null;
  domain: "metal" | "sand";
}

const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

export function V4CatalogGrid({ items }: { items: V4CatalogItem[] }) {
  const metal = items.filter((i) => i.domain === "metal").slice(0, 4);
  const sand = items.filter((i) => i.domain === "sand").slice(0, 4);

  return (
    <section id="catalog" className="border-b border-[#3A3F44] bg-[#F4EBE1] py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 border border-[#1A1D20]/20 bg-[#E6D5BC] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#1A1D20]">
              Каталог
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#1A1D20] sm:text-4xl">
              Два домена — <span className="text-[#FF6B00]">один склад</span>
            </h2>
          </div>
          <div className="flex gap-3">
            <Link
              href="/metall"
              className="flex items-center gap-2 border-2 border-[#1A1D20] px-5 py-3 text-xs font-black uppercase tracking-widest text-[#1A1D20] transition-all hover:bg-[#1A1D20] hover:text-[#F4EBE1] active:scale-95"
            >
              <Hammer className="h-4 w-4" />
              Весь металл
            </Link>
            <Link
              href="/pesok-scheben"
              className="flex items-center gap-2 border-2 border-[#1A1D20]/30 px-5 py-3 text-xs font-black uppercase tracking-widest text-[#1A1D20] transition-all hover:border-[#FF6B00] hover:text-[#FF6B00] active:scale-95"
            >
              <Truck className="h-4 w-4" />
              Сыпучие
            </Link>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Metal column */}
          <div>
            <div className="mb-6 flex items-center justify-between border-b-2 border-[#1A1D20] pb-3">
              <h3 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-[#1A1D20]">
                <Hammer className="h-5 w-5 text-[#FF6B00]" />
                Металлопрокат
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1D20]/40">
                ₽/метр · ₽/тонна
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {metal.map((p) => (
                <CatalogCard key={p.id} item={p} accent="orange" />
              ))}
            </div>
          </div>

          {/* Sand column */}
          <div>
            <div className="mb-6 flex items-center justify-between border-b-2 border-[#1A1D20] pb-3">
              <h3 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-[#1A1D20]">
                <Truck className="h-5 w-5 text-[#FF9900]" />
                Песок и щебень
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1D20]/40">
                ₽/м³ · ₽/мешок
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {sand.map((p) => (
                <CatalogCard key={p.id} item={p} accent="sand" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CatalogCard({ item, accent }: { item: V4CatalogItem; accent: "orange" | "sand" }) {
  const img = productImageSrc(item.imageLocal, item.imageUrl);
  return (
    <Link
      href={`/metall/${item.slug}`}
      className="group relative flex flex-col overflow-hidden border-2 border-[#1A1D20]/15 bg-[#E6D5BC]/40 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF6B00] hover:shadow-[0_10px_40px_rgba(255,107,0,0.15)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F4EBE1]">
        {img ? (
          <Image
            src={img}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 50vw, 300px"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl font-black text-[#1A1D20]/10">
            {item.categoryName.slice(0, 1)}
          </div>
        )}
        <span
          className={cnBadge(accent)}
        >
          {item.categoryName}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h4 className="line-clamp-2 text-sm font-bold leading-snug text-[#1A1D20]">
          {item.name}
        </h4>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            {item.price != null ? (
              <>
                <p className="text-xl font-black tracking-tight text-[#1A1D20]">
                  {fmt(item.price)} ₽
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1D20]/40">
                  за {item.unit ?? "ед."}
                </p>
              </>
            ) : (
              <p className="text-xs font-black uppercase tracking-widest text-[#1A1D20]/40">
                Под заказ
              </p>
            )}
          </div>
          <span className="flex h-9 w-9 items-center justify-center border-2 border-[#1A1D20]/20 text-[#1A1D20] transition-all group-hover:border-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-[#1A1D20]">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function cnBadge(accent: "orange" | "sand") {
  return accent === "orange"
    ? "absolute left-3 top-3 bg-[#1A1D20] px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#FF9900]"
    : "absolute left-3 top-3 bg-[#1A1D20] px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#E6D5BC]";
}
