import { getIcon } from "@/lib/icons";
import { Reveal } from "@/components/blocks/Reveal";
import type { AdvantagesBlock } from "@/types/page-builder";

export function Advantages({ title, subtitle, items }: AdvantagesBlock) {
  return (
    <section className="block-section py-16">
      <Reveal>
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            Почему мы
          </span>
          <h2 className="font-jakarta text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h2>
          {subtitle && <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>}
        </div>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const Icon = getIcon(item.icon);
          return (
            <Reveal key={item.title} delay={i * 70}>
              <div className="group relative h-full overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
                
                <div className="relative z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 font-jakarta text-xl font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
