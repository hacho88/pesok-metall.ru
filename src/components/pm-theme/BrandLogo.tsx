import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/pm-utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/30',
        className,
      )}
      aria-hidden="true"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L21 6.5L12 11L3 6.5L12 2Z" fill="currentColor" fillOpacity="0.95" />
        <path d="M3 12L12 16.5L21 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" />
        <path d="M3 17.5L12 22L21 17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" />
      </svg>
    </span>
  )
}

export function BrandLogo({
  withSubtitle = true,
  logoUrl,
  siteName,
  className,
  textClassName,
}: {
  withSubtitle?: boolean;
  logoUrl?: string | null;
  siteName?: string;
  className?: string;
  textClassName?: string;
}) {
  // Если загружен кастомный логотип — показываем его
  if (logoUrl) {
    return (
      <Link href="/" className="flex items-center gap-3">
        <Image
          src={logoUrl}
          alt={siteName || "Логотип"}
          width={160}
          height={40}
          className="h-10 w-auto object-contain"
          priority
        />
      </Link>
    )
  }

  // Дефолтный текстовый логотип
  const name = siteName || "pesok-metall.ru"
  const parts = name.toLowerCase().replace(/\.ru$/, "").split(/[-\s]/)
  const part1 = parts[0] || "pesok"
  const part2 = parts.slice(1).join("-") || "metall"

  return (
    <Link href="/" className="flex items-center gap-3">
      <BrandMark className={className} />
      <span className="flex flex-col leading-none">
        <span className={cn('text-lg font-bold tracking-tight', textClassName)}>
          <span className="text-slate-900">{part1}</span>
          <span className="text-primary">-{part2}</span>
          <span className="text-xs font-medium text-muted-foreground">.ru</span>
        </span>
        {withSubtitle && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Маркетплейс
          </span>
        )}
      </span>
    </Link>
  )
}
