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
    <section className="block-section">
      <div className="mb-10 text-center">
        <span className="block-eyebrow">География</span>
        <h2 className="block-heading">{title}</h2>
        {description && <p className="mt-3 text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {zones.map((zone) => {
          const slug = GEO_SLUGS[zone];
          const className =
            "gap-1.5 px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground";
          return slug ? (
            <a key={zone} href={`/geo/${slug}`}>
              <Badge variant="outline" className={className}>
                <MapPin className="h-3.5 w-3.5" />
                {zone}
              </Badge>
            </a>
          ) : (
            <Badge key={zone} variant="outline" className={className}>
              <MapPin className="h-3.5 w-3.5" />
              {zone}
            </Badge>
          );
        })}
      </div>
    </section>
  );
}
