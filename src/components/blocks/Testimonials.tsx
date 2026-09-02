import { Star } from "lucide-react";
import { Reveal } from "@/components/blocks/Reveal";
import { cn } from "@/lib/utils";
import type { TestimonialsBlock } from "@/types/page-builder";

export function Testimonials({ title, items }: TestimonialsBlock) {
  return (
    <section className="block-section py-16">
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          Отзывы
        </span>
        <h2 className="font-jakarta text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h2>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.name} delay={i * 80}>
            <div className="group relative flex h-full flex-col gap-6 rounded-2xl border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      s < item.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/20"
                    )}
                    style={{ transitionDelay: `${s * 50}ms` }}
                  />
                ))}
              </div>
              
              <blockquote className="relative flex-1">
                <svg
                  className="absolute -left-2 -top-2 h-8 w-8 -translate-x-full -translate-y-full text-muted-foreground/10"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-lg leading-relaxed text-muted-foreground italic">
                  "{item.text}"
                </p>
              </blockquote>
              
              <div className="flex items-center gap-4 border-t pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-lg font-bold text-primary shadow-inner">
                  {item.name.slice(0, 1)}
                </div>
                <div>
                  <p className="font-jakarta font-bold tracking-tight text-foreground">{item.name}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">{item.role}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
