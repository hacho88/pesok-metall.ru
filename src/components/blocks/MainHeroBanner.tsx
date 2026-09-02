import { ArrowRight, CheckCircle2, HardHat, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/blocks/Reveal";
import type { MainHeroBannerBlock } from "@/types/page-builder";

interface MainHeroBannerProps extends MainHeroBannerBlock {
  geoZoneName?: string;
  calculator?: React.ReactNode;
}

const TRUST_POINTS = [
  "Доставка в день заказа",
  "Розница и опт",
  "Соответствие ГОСТ",
];

const TICKER_PHRASES = [
  "Доставка в день заказа",
  "Розница и опт",
  "Соответствие ГОСТ",
  "Москва и Московская область",
];

export function MainHeroBanner({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  geoZoneName,
  calculator,
  imageUrl,
}: MainHeroBannerProps) {
  return (
    <section className="block-hero relative overflow-hidden py-12 lg:py-24">
      {imageUrl && (
        <div className="absolute inset-0 -z-10">
          <img src={imageUrl} alt="" className="h-full w-full object-cover opacity-10 brightness-[0.2]" />
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-transparent" />
        </div>
      )}
      <div className="block-hero-inner grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="block-hero-copy">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              <HardHat className="h-4 w-4" />
              <span>
                Москва и МО
                {geoZoneName && ` · Доставка в ${geoZoneName}`}
              </span>
            </div>
            
            <h1 className="font-jakarta text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {subtitle}
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <a href={ctaHref}>
                <Button size="xl" className="rounded-full px-8 text-lg font-bold transition-all hover:scale-105 active:scale-95">
                  {ctaLabel}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              {secondaryCtaLabel && secondaryCtaHref && (
                <a href={secondaryCtaHref}>
                  <Button size="xl" variant="outline" className="rounded-full px-8 text-lg font-bold transition-all hover:bg-secondary active:scale-95">
                    {secondaryCtaLabel}
                  </Button>
                </a>
              )}
            </div>
            
            <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {TRUST_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="block-hero-visual relative">
          {calculator ? (
            <div className="animate-fade-up">
              {calculator}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="hero-float-card col-span-2 rounded-2xl border bg-card p-6 shadow-lg">
                <strong className="text-2xl font-bold tracking-tight">54 мешка</strong>
                <span className="mt-1 block text-sm text-muted-foreground">песка на стяжку 20 м² · 5 см</span>
              </div>
              <div className="hero-float-card rounded-2xl border bg-card p-6 shadow-lg">
                <strong className="flex items-center gap-1.5 text-xl font-bold">
                  <Truck className="h-5 w-5 text-primary" />
                  2 500 ₽
                </strong>
                <span className="mt-1 block text-sm text-muted-foreground">подача по Москве</span>
              </div>
              <div className="hero-float-card rounded-2xl border bg-card p-6 shadow-lg">
                <strong className="text-xl font-bold">24/7</strong>
                <span className="mt-1 block text-sm text-muted-foreground">приём заказов онлайн</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16 block-ticker overflow-hidden border-y border-border py-6" aria-hidden>
        <div className="block-ticker-track flex gap-12 whitespace-nowrap">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground/50">
              {TICKER_PHRASES.join(" · ")}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
