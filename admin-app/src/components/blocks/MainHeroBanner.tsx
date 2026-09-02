import { ArrowRight, CheckCircle2, HardHat, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/blocks/Reveal";
import type { MainHeroBannerBlock } from "@/types/page-builder";

interface MainHeroBannerProps extends MainHeroBannerBlock {
  geoZoneName?: string;
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
}: MainHeroBannerProps) {
  return (
    <section className="block-hero">
      <div className="block-hero-inner">
        <div className="block-hero-copy">
          <Reveal>
            <span className="block-eyebrow">
              <HardHat className="mr-1.5 inline h-3.5 w-3.5" />
              Москва и Московская область
              {geoZoneName && ` · доставка в ${geoZoneName} в день заказа`}
            </span>
            <h1 className="block-hero-title">{title}</h1>
            <p className="block-hero-subtitle">{subtitle}</p>
            <div className="block-hero-cta">
              <a href={ctaHref}>
                <Button size="lg">
                  {ctaLabel}
                  <ArrowRight />
                </Button>
              </a>
              {secondaryCtaLabel && secondaryCtaHref && (
                <a href={secondaryCtaHref}>
                  <Button size="lg" variant="outline">
                    {secondaryCtaLabel}
                  </Button>
                </a>
              )}
            </div>
            <ul className="block-hero-trust">
              {TRUST_POINTS.map((point) => (
                <li key={point}>
                  <CheckCircle2 className="h-4 w-4" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Визуальная колонка: плитки (bento) / сплит (editorial) */}
        <div className="block-hero-visual">
          <div className="hero-float-card">
            <strong>54 мешка</strong>
            <span>песка на стяжку 20 м² · 5 см</span>
          </div>
          <div className="hero-float-card">
            <strong className="flex items-center gap-1.5">
              <Truck className="h-4 w-4" />
              2 500 ₽
            </strong>
            <span>подача Газели по Москве</span>
          </div>
          <div className="hero-float-card">
            <strong>24/7</strong>
            <span>приём заказов онлайн</span>
          </div>
        </div>
      </div>

      {/* Бегущая строка — только в bento-стиле */}
      <div className="block-ticker" aria-hidden>
        <div className="block-ticker-track">
          {[0, 1].map((i) => (
            <span key={i}>{TICKER_PHRASES.join(" · ")}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
