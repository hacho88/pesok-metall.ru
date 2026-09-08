'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, Heart, Home, LayoutGrid, ShoppingCart } from 'lucide-react'
import { useCart } from '@/components/pm-theme/cart-context'
import { useFavorites } from '@/components/pm-theme/favorites-context'
import { cn } from '@/lib/pm-utils'

const items = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/armatura', label: 'Каталог', icon: LayoutGrid, match: 'catalog' },
  { href: '/kalkulyator-metalla', label: 'Калькулятор', icon: Calculator, match: 'calc' },
  { href: '/izbrannoe', label: 'Избранное', icon: Heart },
  { href: '/korzina', label: 'Корзина', icon: ShoppingCart },
]

const catalogSlugs = [
  '/armatura',
  '/truba-profilnaya',
  '/truby-kruglye',
  '/fasonnyj-prokat',
  '/listovoj-prokat',
  '/polosa-metallicheskaya',
  '/setka-metallicheskaya',
  '/profnastil',
  '/provoloka',
  '/vintovye-svai',
  '/metallicheskiy-shtaketnik',
  '/dopolnitelnye-materialy',
]

export function MobileNav() {
  const pathname = usePathname()
  const { count } = useCart()
  const { count: favCount } = useFavorites()

  const isActive = (item: (typeof items)[number]) => {
    if (item.match === 'catalog') return catalogSlugs.includes(pathname)
    if (item.match === 'calc') return pathname.startsWith('/kalkulyator')
    return pathname === item.href
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-card/95 backdrop-blur-xl lg:hidden">
      <ul className="flex items-stretch">
        {items.map((item) => {
          const active = isActive(item)
          const Icon = item.icon
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <span className="relative">
                  <Icon className={cn('size-5', item.href === '/izbrannoe' && favCount > 0 && 'text-rose-500')} />
                  {item.href === '/korzina' && count > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {count}
                    </span>
                  )}
                  {item.href === '/izbrannoe' && favCount > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {favCount}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
