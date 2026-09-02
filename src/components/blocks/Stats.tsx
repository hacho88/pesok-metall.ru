import { Reveal } from "@/components/blocks/Reveal";
import type { StatsBlock } from "@/types/page-builder";

export function Stats({ items }: StatsBlock) {
  return (
    <section className="block-section relative py-20">
      {/* Декоративный фон */}
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={item.label} delay={i * 80}>
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div className="mb-2 text-5xl font-black tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
                {item.value}
              </div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                {item.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
