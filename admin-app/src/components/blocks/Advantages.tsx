import { getIcon } from "@/lib/icons";
import { Reveal } from "@/components/blocks/Reveal";
import type { AdvantagesBlock } from "@/types/page-builder";

export function Advantages({ title, subtitle, items }: AdvantagesBlock) {
  return (
    <section className="block-section">
      <Reveal>
        <span className="block-eyebrow">Почему мы</span>
        <h2 className="block-heading">{title}</h2>
        {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
      </Reveal>
      <div className="block-grid mt-10">
        {items.map((item, i) => {
          const Icon = getIcon(item.icon);
          return (
            <Reveal key={item.title} delay={i * 70}>
              <div className="block-card block-glow group h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
