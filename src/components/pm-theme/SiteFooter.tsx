import Link from 'next/link'
import { Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react'
import { BrandMark } from '@/components/pm-theme/BrandLogo'
import type { CatalogNav } from '@/lib/pm-catalog'
import type { PublicSettings } from '@/lib/shop-settings'

export function SiteFooter({ settings, catalog = [] }: { settings: PublicSettings; catalog?: CatalogNav[] }) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/70 bg-card">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Бренд */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-3">
              <BrandMark />
              <span className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight">
                  <span className="text-slate-900">{settings.siteName.split(/[-\s]/)[0]?.toLowerCase() || 'pesok'}</span>
                  <span className="text-primary">-{settings.siteName.split(/[-\s]/).slice(1).join('-').toLowerCase() || 'metall'}</span>
                </span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">{settings.footerText}</p>
          </div>

          {/* Контакты */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Контакты</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Phone className="size-4" /> {settings.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Mail className="size-4" /> {settings.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4" /> {settings.workHours}
              </li>
            </ul>
          </div>

          {/* Каталог */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Каталог</h3>
            <ul className="space-y-2 text-sm">
              {catalog.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/shop/${cat.slug}`} className="text-muted-foreground hover:text-primary">{cat.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Соцсети + ссылки */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Мы в сети</h3>
            <div className="flex gap-2">
              {settings.whatsappUrl && (
                <a href={settings.whatsappUrl} target="_blank" rel="noreferrer"
                  className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-accent hover:text-primary"
                  aria-label="WhatsApp">
                  <MessageCircle className="size-5" />
                </a>
              )}
              {settings.telegramUrl && (
                <a href={settings.telegramUrl} target="_blank" rel="noreferrer"
                  className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-accent hover:text-primary"
                  aria-label="Telegram">
                  <Send className="size-5" />
                </a>
              )}
              {settings.vkUrl && (
                <a href={settings.vkUrl} target="_blank" rel="noreferrer"
                  className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-accent hover:text-primary"
                  aria-label="ВКонтакте">
                  <span className="text-xs font-bold">VK</span>
                </a>
              )}
            </div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/korzina" className="text-muted-foreground hover:text-primary">Корзина</Link></li>
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary">Все категории</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          © {year} {settings.siteName}. Все права защищены.
        </div>
      </div>
    </footer>
  )
}
