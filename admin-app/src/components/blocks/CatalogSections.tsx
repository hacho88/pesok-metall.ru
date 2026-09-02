import Link from "next/link";
import { ArrowRight, Hammer, Truck } from "lucide-react";

// Превью блока «Два раздела» для админки (без БД — демо-счётчики)
export function CatalogSections({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const sections = [
    {
      href: "/metall",
      icon: Hammer,
      accent: "from-red-600 to-red-700",
      badge: "Цены с city-met.ru",
      title: "Металлопрокат",
      description:
        "Арматура, трубы, уголок, швеллер, лист, сетка и профнастил. Цены обновляются автоматически с сайта Сити-Металл.",
      count: 800,
      countLabel: "позиций в каталоге",
      cta: "Перейти в каталог металла",
    },
    {
      href: "/pesok-scheben",
      icon: Truck,
      accent: "from-amber-500 to-orange-600",
      badge: "Свои товары",
      title: "Песок и щебень",
      description:
        "Песок, щебень, грунт и керамзит в мешках по 30 кг и биг-бегах по 1 тонне. Доставка в день заказа.",
      count: 12,
      countLabel: "позиций в каталоге",
      cta: "Перейти в каталог сыпучих",
    },
  ];

  return (
    <section className="block-section">
      <div className="mb-8">
        <h2 className="block-heading">{title}</h2>
        {subtitle && <p className="block-subheading">{subtitle}</p>}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${s.accent}`}
            />
            <div className="mb-5 flex items-center justify-between">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${s.accent} text-white shadow-lg`}
              >
                <s.icon className="h-7 w-7" />
              </span>
              <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                {s.badge}
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight">{s.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {s.description}
            </p>
            <div className="mt-6 flex items-center justify-between border-t pt-5">
              <p className="text-sm text-muted-foreground">
                <span className="text-2xl font-bold text-foreground">
                  {s.count}
                </span>{" "}
                {s.countLabel}
              </p>
              <span className="flex items-center gap-2 text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
                {s.cta}
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
