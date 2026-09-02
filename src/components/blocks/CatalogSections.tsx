import Link from "next/link";
import { ArrowRight, Hammer, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

// Два раздела витрины: «Металлопрокат» и «Песок и щебень» (свои товары)
export async function CatalogSections({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const [metalCount, sandCount] = await Promise.all([
    prisma.product.count({ where: { type: "METALL" } }),
    prisma.product.count({
      where: { type: { in: ["BAG_30KG", "BIG_BAG_1TON"] } },
    }),
  ]);

  const sections = [
    {
      href: "/metall",
      icon: Hammer,
      accent: "bg-red-600 shadow-red-200",
      badge: "В наличии на складе",
      title: "Металлопрокат",
      description:
        "Арматура, трубы, уголок, швеллер, лист, сетка и профнастил. Прямые поставки от производителя с нашего склада.",
      count: metalCount,
      countLabel: "позиций в каталоге",
      cta: "В КАТАЛОГ МЕТАЛЛА",
    },
    {
      href: "/pesok-scheben",
      icon: Truck,
      accent: "bg-amber-500 shadow-amber-200",
      badge: "Свои товары",
      title: "Песок и щебень",
      description:
        "Песок, щебень, грунт и керамзит в мешках по 30 кг и биг-бегах по 1 тонне. Доставка в день заказа.",
      count: sandCount,
      countLabel: "позиций в каталоге",
      cta: "В КАТАЛОГ СЫПУЧИХ",
    },
  ];

  return (
    <section className="block-section py-16">
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          Наш ассортимент
        </span>
        <h2 className="font-jakarta text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h2>
        {subtitle && <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>}
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border-2 border-border bg-card p-10 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className={cn(
                "flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                s.accent
              )}>
                <s.icon className="h-10 w-10" />
              </div>
              <span className="rounded-full bg-muted/50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {s.badge}
              </span>
            </div>
            
            <h3 className="font-jakarta text-3xl font-black tracking-tight text-foreground">{s.title}</h3>
            <p className="mt-4 flex-1 text-lg leading-relaxed text-muted-foreground">
              {s.description}
            </p>
            
            <div className="mt-10 flex items-center justify-between border-t pt-8">
              <div>
                <div className="text-3xl font-black text-foreground">{s.count}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{s.countLabel}</div>
              </div>
              <span className="flex h-14 items-center gap-3 rounded-full bg-foreground px-8 text-xs font-black uppercase tracking-widest text-background transition-all group-hover:bg-primary group-hover:text-white group-hover:scale-105 active:scale-95 shadow-xl">
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
