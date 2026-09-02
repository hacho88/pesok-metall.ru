import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DeliveryZonesBlock } from "@/types/page-builder";

// Зоны с отдельной гео-страницей (/geo/{slug}) становятся ссылками
const GEO_SLUGS: Record<string, string> = {
  Москва: "moscow",
  Балашиха: "balashiha",
  Подольск: "podolsk",
  Митино: "mitino",
  Люберцы: "lyubertsy",
};

export function DeliveryZones({ title, description, zones }: DeliveryZonesBlock) {
  return (
    <section className="block-section py-16">
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          География
        </span>
        <h2 className="font-jakarta text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h2>
        {description && <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{description}</p>}
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        {zones.map((zone) => {
          const slug = GEO_SLUGS[zone];
          return (
            <div key={zone} className="group relative">
              {slug ? (
                <a 
                  href={`/geo/${slug}`}
                  className="flex items-center gap-2 rounded-xl border-2 border-border bg-card px-6 py-3 text-sm font-bold transition-all hover:border-primary hover:bg-primary/5 hover:scale-105 active:scale-95 shadow-sm"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  {zone}
                </a>
              ) : (
                <div 
                  className="flex items-center gap-2 rounded-xl border-2 border-border bg-card/50 px-6 py-3 text-sm font-bold text-muted-foreground/70"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {zone}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 rounded-2xl bg-muted/30 p-8 text-center border-2 border-dashed">
        <p className="text-sm font-bold text-muted-foreground">
          Не нашли свой район? <span className="text-primary underline underline-offset-4 cursor-pointer hover:text-primary/80">Спросите нашего ИИ-менеджера</span> — мы доставляем по всей Московской области.
        </p>
      </div>
    </section>
  );
}
