import Link from 'next/link'
import { SlidersHorizontal } from 'lucide-react'
import type { Product } from '@/lib/pm-catalog'

/** Собирает топ-значения атрибута из товаров */
function topValues(products: Product[], pattern: RegExp, limit = 6): string[] {
  const counts = new Map<string, number>()
  for (const p of products) {
    const attr = p.attributes.find((a) => pattern.test(a.key))
    if (attr?.value) counts.set(attr.value, (counts.get(attr.value) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([v]) => v)
}

export function ParamPicker({ products }: { products: Product[] }) {
  const diameters = topValues(products, /диаметр|diameter/i, 6)
  const gosts = topValues(products, /гост|gost/i, 4)
  const steels = topValues(products, /марка|сталь|класс прочности/i, 4)

  if (!diameters.length && !gosts.length && !steels.length) return null

  return (
    <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm shadow-slate-200/50">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-2xl bg-accent text-primary">
          <SlidersHorizontal className="size-4.5" />
        </span>
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900">Подбор по параметрам</h2>
          <p className="text-xs text-muted-foreground">Один клик — и вы видите все товары с нужной характеристикой</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {diameters.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Диаметр</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {diameters.map((d) => (
                <Link
                  key={d}
                  href={`/catalog?q=${encodeURIComponent(d)}`}
                  className="rounded-full border border-border/70 bg-secondary px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-primary"
                >
                  ⌀ {d}
                </Link>
              ))}
            </div>
          </div>
        )}
        {steels.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Марка стали</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {steels.map((s) => (
                <Link
                  key={s}
                  href={`/catalog?q=${encodeURIComponent(s)}`}
                  className="rounded-full border border-border/70 bg-secondary px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        )}
        {gosts.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">ГОСТ</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {gosts.map((g) => (
                <Link
                  key={g}
                  href={`/catalog?q=${encodeURIComponent(g)}`}
                  className="rounded-full border border-border/70 bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  ГОСТ {g}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
