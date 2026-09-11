'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight, Calculator, ChevronRight, Layers, Truck } from 'lucide-react'
import type { CatalogNav } from '@/lib/pm-catalog'
import { categoryIcon } from '@/lib/category-icons'
import { cn } from '@/lib/pm-utils'

export function SiteSidebar({ catalog }: { catalog: CatalogNav[] }) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Авто-раскрытие ветки, содержащей активную страницу
  useEffect(() => {
    const parent = catalog.find((c) =>
      c.subcategoryRefs.some((s) => pathname === `/shop/${s.slug}`)
    )
    if (parent) setExpanded((e) => ({ ...e, [parent.slug]: true }))
  }, [pathname, catalog])

  return (
    <aside className="hidden w-72 shrink-0 lg:block">
      <div className="pm-sidebar-scroll sticky top-32 flex max-h-[calc(100vh-9rem)] flex-col gap-4 overflow-y-auto pb-8 pr-1">
        <nav className="rounded-3xl border border-border/70 bg-card p-2 shadow-sm shadow-slate-200/50">
          <div className="flex items-center justify-between px-3 pb-1 pt-2">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Layers className="size-3.5" />
              Каталог
            </p>
            <Link
              href="/shop"
              className={cn(
                'group inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors',
                pathname === '/shop' ? 'text-primary' : 'text-muted-foreground hover:text-primary',
              )}
            >
              Весь каталог
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <ul className="flex flex-col gap-0.5">
            {catalog.map((cat) => {
              const href = `/shop/${cat.slug}`
              const active = pathname === href
              const subs = cat.subcategoryRefs.filter((s) => s.count > 0)
              const totalCount = cat.subcategoryRefs.reduce((sum, s) => sum + s.count, 0)
              const isOpen = expanded[cat.slug] ?? false
              const Icon = categoryIcon(cat.title)

              return (
                <li key={cat.slug}>
                  <div
                    className={cn(
                      'group relative flex items-center rounded-2xl transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                        : 'text-foreground hover:bg-accent',
                    )}
                  >
                    {/* Активный индикатор слева */}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-300',
                        active ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <Link
                      href={href}
                      className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5"
                    >
                      <span
                        className={cn(
                          'flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                          active ? 'bg-white/15 text-primary-foreground' : 'bg-accent text-primary',
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{cat.title}</span>
                      {totalCount > 0 && (
                        <span
                          className={cn(
                            'mr-1 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums transition-colors',
                            active
                              ? 'bg-white/15 text-primary-foreground'
                              : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
                          )}
                        >
                          {totalCount}
                        </span>
                      )}
                    </Link>
                    {subs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpanded((e) => ({ ...e, [cat.slug]: !e[cat.slug] }))}
                        aria-label={isOpen ? 'Свернуть' : 'Развернуть'}
                        className="mr-1.5 flex size-7 items-center justify-center rounded-xl transition-colors hover:bg-black/5"
                      >
                        <ChevronRight
                          className={cn(
                            'size-4 transition-transform duration-300',
                            isOpen && 'rotate-90',
                            active ? 'text-primary-foreground' : 'text-muted-foreground',
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {/* Плавное раскрытие подкатегорий */}
                  {subs.length > 0 && (
                    <div
                      className={cn(
                        'grid transition-all duration-300 ease-out',
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                      )}
                    >
                      <ul className="ml-9 flex flex-col gap-0.5 overflow-hidden border-l border-border/70 pl-2.5">
                        {subs.map((sub) => {
                          const subHref = `/shop/${sub.slug}`
                          const subActive = pathname === subHref
                          return (
                            <li key={sub.slug}>
                              <Link
                                href={subHref}
                                className={cn(
                                  'flex items-center rounded-xl px-2.5 py-1.5 text-[13px] transition-colors',
                                  subActive
                                    ? 'bg-primary/10 font-semibold text-primary'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                )}
                              >
                                <span className="truncate">{sub.name}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-3">
          <Link
            href="/kalkulyator-dostavki"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-500 p-4 text-primary-foreground shadow-sm shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40"
          >
            <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-white/15 transition-transform group-hover:scale-110">
                <Truck className="size-5" />
              </span>
              <span className="font-semibold leading-tight">ИИ-калькулятор доставки</span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-primary-foreground/85">
              Перевод объёма в тару, auto-подбор машины и расчёт стоимости в реальном времени.
            </p>
          </Link>

          <Link
            href="/kalkulyator-metalla"
            className="group rounded-3xl border border-border/70 bg-card p-4 shadow-sm shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-slate-200/70"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-accent text-primary transition-transform group-hover:scale-110">
                <Calculator className="size-5" />
              </span>
              <span className="font-semibold leading-tight text-foreground">ИИ-калькулятор металла</span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
              Перевод метров в тонны, подбор сечения и мгновенный расчёт стоимости партии.
            </p>
          </Link>
        </div>
      </div>
    </aside>
  )
}
