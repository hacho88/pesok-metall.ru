import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Package } from 'lucide-react'
import type { Category } from '@/lib/pm-catalog'

export function CatalogGrid({ catalog }: { catalog: Category[] }) {
  // Сыпучие материалы показываются отдельной плиткой выше — здесь только металлопрокат
  const metalCats = catalog.filter((c) => c.slug !== "pesok-shcheben");
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Металлопрокат</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Полный ассортимент по ГОСТ с резкой в размер и доставкой по Москве и области.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border/80 bg-card px-5 text-sm font-bold text-slate-900 shadow-sm transition-all hover:border-primary/40 hover:text-primary hover:shadow-md"
        >
          Весь каталог
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metalCats.map((cat) => {
          // Сначала фото категории (загруженное в админке), затем фото первого товара
          const productWithImage = cat.products.find((p) => p.imageLocal || p.imageUrl)
          const imgSrc = cat.imageUrl || productWithImage?.imageLocal || productWithImage?.imageUrl
          return (
            <div
              key={cat.slug}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-slate-200/70"
            >
              <Link href={`/shop/${cat.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-muted">
                {imgSrc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc}
                    alt={cat.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                {/* Градиент снизу для читаемости бейджа */}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-80" />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-900 shadow-sm backdrop-blur">
                  <Package className="size-3 text-primary" />
                  {cat.products.length} товаров
                </span>
                <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-900 opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:opacity-100">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <Link
                  href={`/shop/${cat.slug}`}
                  className="flex items-center justify-between gap-3 text-slate-900 transition-colors hover:text-primary"
                >
                  <h3 className="text-base font-bold">{cat.title}</h3>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowUpRight className="size-4" />
                  </span>
                </Link>
                <ul className="mt-3 flex flex-col gap-0.5">
                  {cat.subcategoryRefs.filter((s) => s.count > 0).map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={`/shop/${sub.slug}`}
                        className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                      >
                        <span className="truncate">{sub.name}</span>
                        <span className="shrink-0 text-xs font-semibold opacity-60">{sub.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
