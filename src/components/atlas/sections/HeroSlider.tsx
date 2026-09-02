"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SectionComponentProps } from "./index";

interface Slide {
  title: string;
  subtitle: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  bg?: string;
}

export function HeroSlider({ props }: SectionComponentProps) {
  const slides = (props.slides as Slide[]) ?? [];
  const autoplay = props.autoplay !== false;
  const interval = (props.interval as number) ?? 5000;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [autoplay, interval, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl" style={{ height: 400 }}>
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
        >
          {slide.bg && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={slide.bg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.7), rgba(15,23,42,0.4))" }} />
          <div className="relative h-full flex items-center px-12">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "var(--atlas-font-heading)" }}>
                {slide.title}
              </h1>
              <p className="text-lg mb-6 opacity-90">{slide.subtitle}</p>
              <div className="flex gap-3 flex-wrap">
                {slide.ctaPrimary && (
                  <a href={slide.ctaPrimary.href} className="atlas-btn atlas-btn-primary atlas-btn-lg">
                    {slide.ctaPrimary.label}
                  </a>
                )}
                {slide.ctaSecondary && (
                  <a href={slide.ctaSecondary.href} className="atlas-btn atlas-btn-secondary atlas-btn-lg" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
                    {slide.ctaSecondary.label}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
            onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
            onClick={() => setCurrent((c) => (c + 1) % slides.length)}
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === current ? "#fff" : "rgba(255,255,255,0.4)", width: i === current ? 24 : 8 }}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
