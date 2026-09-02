import { Star } from "lucide-react";
import { Reveal } from "@/components/blocks/Reveal";
import type { TestimonialsBlock } from "@/types/page-builder";

export function Testimonials({ title, items }: TestimonialsBlock) {
  return (
    <section className="block-section">
      <div className="mb-10 text-center">
        <span className="block-eyebrow">Отзывы</span>
        <h2 className="block-heading">{title}</h2>
      </div>
      <div className="block-grid">
        {items.map((item, i) => (
          <Reveal key={item.name} delay={i * 80}>
            <div className="block-card flex h-full flex-col gap-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={
                      s < item.rating
                        ? "h-4 w-4 fill-amber-400 text-amber-400"
                        : "h-4 w-4 text-muted-foreground/30"
                    }
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
              <div className="mt-auto pt-2">
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
