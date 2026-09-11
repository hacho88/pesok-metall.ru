import { FavoritesProvider } from '@/components/pm-theme/favorites-context'
import { MobileNav } from '@/components/pm-theme/MobileNav'
import { SiteHeader } from '@/components/pm-theme/SiteHeader'
import { SiteSidebar } from '@/components/pm-theme/SiteSidebar'
import { SiteFooter } from '@/components/pm-theme/SiteFooter'
import type { CatalogNav } from '@/lib/pm-catalog'
import type { PublicSettings } from '@/lib/shop-settings'

export function SiteShell({
  children,
  catalog,
  settings,
}: {
  children: React.ReactNode;
  catalog: CatalogNav[];
  settings: PublicSettings;
}) {
  return (
    <FavoritesProvider>
      <div className="min-h-screen pm-theme vinsovkhoz">
        <SiteHeader settings={settings} />
        <div className="mx-auto flex w-full max-w-[1600px] gap-5 px-4 pb-24 pt-8 md:px-6 lg:px-8 lg:pb-10">
          <SiteSidebar catalog={catalog} />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
        <SiteFooter settings={settings} catalog={catalog} />
        <MobileNav />
      </div>
    </FavoritesProvider>
  )
}
