import { Reveal } from "@/components/blocks/Reveal";
import type { StatsBlock } from "@/types/page-builder";

export function Stats({ items }: StatsBlock) {
  return (
    <section className="block-section">
      <div className="block-grid">
        {items.map((item, i) => (
          <Reveal key={item.label} delay={i * 80}>
            <div className="block-card flex h-full flex-col items-center justify-center gap-1 text-center">
              <p className="block-price text-3xl sm:text-4xl">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
